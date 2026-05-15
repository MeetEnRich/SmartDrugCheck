from django.db import models

class Drug(models.Model):
    product_name = models.TextField(blank=True, null=True)
    active_ingredient = models.TextField(blank=True, null=True)
    category = models.TextField(blank=True, null=True)
    nafdac_reg_no = models.TextField(unique=True, blank=True, null=True)
    form = models.TextField(blank=True, null=True)
    applicant = models.TextField(blank=True, null=True)
    approval_date = models.TextField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'drugs'
        managed = False

from django.utils import timezone

class VerificationLog(models.Model):
    """
    Logs every drug verification attempt for surveillance purposes.
    Aligns with the Verification_Log entity in the ER diagram (Chapter 3.5.2).
    """
    nrn_queried   = models.CharField(max_length=50, blank=True, null=True)
    name_queried  = models.CharField(max_length=200, blank=True, null=True)
    status        = models.CharField(max_length=30)   # 'found_live', 'found_local', 'not_found'
    source        = models.CharField(max_length=30, blank=True, null=True)  # 'live_api' or 'local_fallback'
    timestamp     = models.DateTimeField(default=timezone.now)
    geolocation   = models.CharField(max_length=100, blank=True, null=True)  # "lat,lng" string from frontend
    user_agent    = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'verification_log'
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp}] {self.nrn_queried or self.name_queried} → {self.status}"
