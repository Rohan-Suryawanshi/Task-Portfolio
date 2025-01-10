import requests
from rest_framework import serializers
from .models import Stock
from django.conf import settings

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ['id', 'name', 'ticker', 'quantity', 'buy_price', 'user',]
        read_only_fields = ['id', 'user']

    
