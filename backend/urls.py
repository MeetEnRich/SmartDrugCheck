from django.contrib import admin
from django.urls import path
from api.views import VerifyDrugView, DrugListView, VerificationLogView

urlpatterns = [
    path('admin/',        admin.site.urls),
    path('api/verify/',   VerifyDrugView.as_view(),        name='verify-drug'),
    path('api/drugs/',    DrugListView.as_view(),           name='drug-list'),
    path('api/logs/',     VerificationLogView.as_view(),    name='verification-logs'),
]
