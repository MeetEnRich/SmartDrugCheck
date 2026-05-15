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
