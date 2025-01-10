from django.urls import path
from .views import *
urlpatterns = [
    # path('admin/', admin.site.urls),
    path('stock/',StockListCreateView.as_view(),name='stock-list'),
    path('stock/<int:pk>', StockRetrieveUpdateDestroyView.as_view(), name='update-stock-list'),
    path('stock/<int:stock_id>/price/', StockDetailView.as_view(), name='stock-price'),
    path('stock/prices/', StockQuoteAPIView.as_view(), name='stock_quote'),
    path('stock/portfolio/total/', TotalPortfolioAPIView.as_view(), name='total-portfolio'),
]