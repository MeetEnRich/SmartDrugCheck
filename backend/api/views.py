import requests
import urllib.parse
import re
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from .models import Drug, VerificationLog
from .serializers import DrugSerializer, VerificationLogSerializer

def sanitize_input(value: str) -> str:
    """
    Removes characters that are not alphanumeric, spaces, or common NRN separators.
    Aligns with the pseudocode in Chapter 3.5.5 and the security evaluation in 3.5.6.
    Protects against SQL injection and path traversal.
    """
    if not value:
        return value
    # Allow: letters, digits, hyphens, forward-slash (common in NRNs like A4-1234)
    sanitized = re.sub(r'[^\w\s\-/]', '', value)
    return sanitized.strip()[:100]   # hard cap at 100 chars

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class DrugListView(generics.ListAPIView):
    serializer_class = DrugSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Drug.objects.all().order_by('product_name')
        search_term = self.request.query_params.get('search', None)
        if search_term:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(product_name__icontains=search_term) | 
                Q(nafdac_reg_no__icontains=search_term) | 
                Q(active_ingredient__icontains=search_term)
            )
        return queryset

def fetch_from_greenbook(query, search_column):
    url = "https://greenbook.nafdac.gov.ng/"
    
    params = {
        'draw': 1,
        'start': 0,
        'length': 10,
        'order[0][column]': 0,
        'order[0][dir]': 'asc',
        'search[value]': '',
        'search[regex]': 'false',
        'search_ingredient': '',
    }
    
    cols = [
        ('product_name', 'product_name', 'true', 'true'),
        ('ingredient.ingredient_name', 'ingredient.ingredient_name', 'true', 'true'),
        ('product_category.name', 'product_category.name', 'true', 'false'),
        ('product_category_id', 'product_category_id', 'true', 'true'),
        ('ingredient.synonym', 'ingredient.synonym', 'true', 'true'),
        ('NAFDAC', 'NAFDAC', 'true', 'true'),
        ('form.name', 'form.name', 'true', 'true'),
        ('route.name', 'route.name', 'true', 'true'),
        ('strength', 'strength', 'true', 'true'),
        ('applicant.name', 'applicant.name', 'true', 'true'),
        ('approval_date', 'approval_date', 'true', 'true'),
        ('status', 'status', 'true', 'true'),
    ]

    for i, (data, name, searchable, orderable) in enumerate(cols):
        params[f'columns[{i}][data]'] = data
        params[f'columns[{i}][name]'] = name
        params[f'columns[{i}][searchable]'] = searchable
        params[f'columns[{i}][orderable]'] = orderable
        params[f'columns[{i}][search][value]'] = query if i == search_column else ''
        params[f'columns[{i}][search][regex]'] = 'false'
        
    headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://greenbook.nafdac.gov.ng/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(url, params=params, headers=headers, timeout=10)
    response.raise_for_status()
    
    data = response.json()
    results = data.get('data', [])
    
    if not results:
        return None
        
    drug = results[0]
    
    return {
        'id': drug.get('id', 0),
        'product_name': drug.get('product_name'),
        'nafdac_reg_no': drug.get('NAFDAC'),
        'status': drug.get('status'),
        'active_ingredient': drug.get('ingredient', {}).get('ingredient_name') if isinstance(drug.get('ingredient'), dict) else None,
        'category': drug.get('product_category', {}).get('name') if isinstance(drug.get('product_category'), dict) else None,
        'approval_date': drug.get('approval_date'),
        'expiry_date': drug.get('expiry_date'),
        'form': drug.get('form', {}).get('name') if isinstance(drug.get('form'), dict) else None,
        'applicant': drug.get('applicant', {}).get('name') if isinstance(drug.get('applicant'), dict) else None,
        'composition': drug.get('composition'),
        'smpc_url': drug.get('smpc'),
        'atc_code': drug.get('atc'),
    }

class VerifyDrugView(APIView):
    def get(self, request):
        nrn         = sanitize_input(request.query_params.get('nrn', '')) or None
        name        = sanitize_input(request.query_params.get('name', '')) or None
        geolocation = request.query_params.get('geo', None)   # "lat,lng" sent by frontend
        user_agent  = request.META.get('HTTP_USER_AGENT', '')

        if not nrn and not name:
            return Response(
                {"error": "Provide 'nrn' or 'name' parameter"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- Attempt 1: Live NAFDAC API ---
        try:
            query      = nrn if nrn else name
            search_col = 5 if nrn else 0

            live_result = fetch_from_greenbook(query, search_col)

            if live_result:
                live_result['_source'] = 'live_api'

                # Log successful live lookup
                VerificationLog.objects.create(
                    nrn_queried  = nrn,
                    name_queried = name,
                    status       = 'found_live',
                    source       = 'live_api',
                    geolocation  = geolocation,
                    user_agent   = user_agent,
                )

                return Response(live_result, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Live API error: {e}")

        # --- Attempt 2: Local SQLite fallback ---
        if nrn:
            try:
                drug       = Drug.objects.get(nafdac_reg_no=nrn)
                serializer = DrugSerializer(drug)
                data       = serializer.data
                data['_source'] = 'local_fallback'

                VerificationLog.objects.create(
                    nrn_queried = nrn,
                    status      = 'found_local',
                    source      = 'local_fallback',
                    geolocation = geolocation,
                    user_agent  = user_agent,
                )

                return Response(data, status=status.HTTP_200_OK)

            except Drug.DoesNotExist:
                # Log failed lookup — surveillance event
                VerificationLog.objects.create(
                    nrn_queried = nrn,
                    status      = 'not_found',
                    source      = 'local_fallback',
                    geolocation = geolocation,
                    user_agent  = user_agent,
                )
                return Response(
                    {"error": "Drug not found", "found": False, "_source": "local_fallback"},
                    status=status.HTTP_200_OK
                )

        if name:
            drugs = (
                Drug.objects.filter(product_name__icontains=name) |
                Drug.objects.filter(active_ingredient__icontains=name)
            )
            if drugs.exists():
                serializer = DrugSerializer(drugs.first())
                data       = serializer.data
                data['_source'] = 'local_fallback'

                VerificationLog.objects.create(
                    name_queried = name,
                    status       = 'found_local',
                    source       = 'local_fallback',
                    geolocation  = geolocation,
                    user_agent   = user_agent,
                )

                return Response(data, status=status.HTTP_200_OK)

            # Log failed name search
            VerificationLog.objects.create(
                name_queried = name,
                status       = 'not_found',
                source       = 'local_fallback',
                geolocation  = geolocation,
                user_agent   = user_agent,
            )
            return Response(
                {"error": "Drug not found", "found": False, "_source": "local_fallback"},
                status=status.HTTP_200_OK
            )

class VerificationLogView(generics.ListAPIView):
    """
    Admin endpoint: returns all verification logs with optional filtering.
    Used by the Admin Analytics dashboard (Chapter 3.4.3).
    """
    serializer_class   = VerificationLogSerializer
    pagination_class   = StandardResultsSetPagination

    def get_queryset(self):
        queryset = VerificationLog.objects.all()
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset
