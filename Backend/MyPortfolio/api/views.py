import time
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import Stock
from .serializers import StockSerializer
import requests

class StockListCreateView(generics.ListCreateAPIView):
    """
    Handles listing stocks for the logged-in user and creating new stocks.
    """
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return stocks associated with the logged-in user
        return Stock.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically associate the stock with the logged-in user
        serializer.save(user=self.request.user)


class StockRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles retrieving, updating, or deleting a specific stock for the logged-in user.
    """
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        # Return stocks owned by the logged-in user
        return Stock.objects.filter(user=self.request.user)


class StockDetailView(APIView):
    """
    Handles retrieving a specific stock's details.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, stock_id):
        try:
            stock = Stock.objects.get(id=stock_id, user=request.user)
            serializer = StockSerializer(stock)
            return Response(serializer.data)
        except Stock.DoesNotExist:
            return Response({"error": "Stock not found."}, status=status.HTTP_404_NOT_FOUND)


class StockQuoteService:
    @staticmethod
    def get_stock_quote(symbol):
        url = "https://alpha-vantage.p.rapidapi.com/query"
        querystring = {"function":"GLOBAL_QUOTE","symbol":symbol,"datatype":"json"}

        headers = {
	            "x-rapidapi-key": "72f5327012mshfd9d16345954ee0p134294jsnf0d5b0e93131",
	            "x-rapidapi-host": "alpha-vantage.p.rapidapi.com"
        }
        
        try:
            response = requests.get(url, headers=headers, params=querystring)
            response.raise_for_status()


            data = response.json()
            if "Global Quote" in data:
                return {
                    "symbol": data["Global Quote"].get("01. symbol"),
                    "open": data["Global Quote"].get("02. open"),
                    "high": data["Global Quote"].get("03. high"),
                    "low": data["Global Quote"].get("04. low"),
                    "price": data["Global Quote"].get("05. price"),
                    "volume": data["Global Quote"].get("06. volume"),
                    "latest_trading_day": data["Global Quote"].get("07. latest trading day"),
                    "previous_close": data["Global Quote"].get("08. previous close"),
                    "change": data["Global Quote"].get("09. change"),
                    "change_percent": data["Global Quote"].get("10. change percent")
                }
            return {"error": "Unexpected response format or symbol not found."}
        except requests.RequestException as e:
            return {"error": f"HTTP error: {e}"}
        except ValueError:
            return {"error": "Invalid response format."}


class StockQuoteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_stocks = Stock.objects.filter(user=request.user).values('ticker', 'name')

        if not user_stocks:
            return Response({"error": "No stocks found for the user."}, status=status.HTTP_400_BAD_REQUEST)

        results = []
        for stock in user_stocks:
            symbol = stock['ticker']
            stock_name = stock['name']
            
            result = StockQuoteService.get_stock_quote(symbol)
            result['name'] = stock_name
            results.append(result)
            time.sleep(12)
        return Response(results, status=status.HTTP_200_OK)
    
class TotalPortfolioAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_stocks = Stock.objects.filter(user=request.user).values('ticker', 'quantity')

        if not user_stocks:
            return Response({"error": "No stocks found for the user."}, status=status.HTTP_400_BAD_REQUEST)

        total_value = 0.0
        details = []
        for stock in user_stocks:
            symbol = stock['ticker']
            quantity = stock['quantity']
            quote = StockQuoteService.get_stock_quote(symbol)

            if 'price' in quote and quote['price']:
                current_price = float(quote['price'])
                stock_value = current_price * quantity
                total_value += stock_value
                details.append({
                    "symbol": symbol,
                    "quantity": quantity,
                    "current_price": current_price,
                    "stock_value": stock_value
                })
            else:
                details.append({
                    "symbol": symbol,
                    "error": "Could not fetch price."
                })
            time.sleep(12)

        return Response({
            "total_portfolio_value": total_value,
            "details": details
        }, status=status.HTTP_200_OK)


