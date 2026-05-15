from rest_framework import serializers
from .models import Drug, VerificationLog

class DrugSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Drug
        fields = '__all__'

class VerificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = VerificationLog
        fields = '__all__'
        read_only_fields = ('timestamp',)
