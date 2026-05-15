from django.contrib import admin
from .models import VerificationLog

@admin.register(VerificationLog)
class VerificationLogAdmin(admin.ModelAdmin):
    list_display  = ('timestamp', 'nrn_queried', 'name_queried', 'status', 'source', 'geolocation')
    list_filter   = ('status', 'source')
    search_fields = ('nrn_queried', 'name_queried')
    readonly_fields = ('timestamp',)
    ordering      = ('-timestamp',)
