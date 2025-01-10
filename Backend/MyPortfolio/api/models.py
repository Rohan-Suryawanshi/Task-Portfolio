from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Stock(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="stocks")
    name = models.CharField(max_length=100)
    ticker = models.CharField(max_length=10)
    quantity = models.IntegerField(default=1)
    buy_price = models.FloatField()
    """G9OO3L2ON2WO7VZF"""

    def __str__(self):
        return f"{self.name} ({self.ticker})"
 