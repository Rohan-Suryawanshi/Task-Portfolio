import React, { useState, useEffect } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

const Dashboard = () => {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [stockName, setStockName] = useState("");
   const [ticker, setTicker] = useState("");
   const [quantity, setQuantity] = useState("");
   const [buyPrice, setBuyPrice] = useState("");
   const [error, setError] = useState("");
   const [successMessage, setSuccessMessage] = useState("");
   const [stocks, setStocks] = useState([]);
   const [loading, setLoading] = useState(true); // Set to true initially
   const [editStockId, setEditStockId] = useState(null);
   const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
   const [realTimePrices, setRealTimePrices] = useState({});
   const [portfolioValue, setPortfolioValue] = useState(0);
   const [ws, setWs] = useState(null); // Store WebSocket instance

   const toggleAddStockModal = () => {
      setIsModalOpen(!isModalOpen);
      setStockName("");
      setTicker("");
      setQuantity("");
      setBuyPrice("");
      setError("");
      setSuccessMessage("");
   };

   const toggleEditStockModal = (stockId) => {
      const stockToEdit = stocks.find((stock) => stock.id === stockId);
      if (stockToEdit) {
         setEditStockId(stockId);
         setStockName(stockToEdit.name);
         setTicker(stockToEdit.symbol);
         setQuantity(stockToEdit.quantity);
         setBuyPrice(stockToEdit.buyPrice);
      }
      setIsEditModalOpen(!isEditModalOpen);
   };

   const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("id");
      localStorage.removeItem("name");
      localStorage.removeItem("email");

      window.location.href = "/login";
   };

   const isLoggedIn = !!localStorage.getItem("token");
   const username = localStorage.getItem("name");

   useEffect(() => {
      const fetchStocks = async () => {
         try {
            const response = await fetch(
               "https://rohansuryawanshi.pythonanywhere.com/api/stock/",
               {
                  method: "GET",
                  headers: {
                     "Content-Type": "application/json",
                     Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
               }
            );

            if (!response.ok) {
               throw new Error("Failed to fetch stock data.");
            }

            const data = await response.json();
            console.log("📊 Fetched Stocks:", data);

            // Initialize stocks from API response
            const formattedStocks = data.map((stock) => ({
               id: stock.id, // Assuming 'id' is unique
               name: stock.name,
               symbol: stock.ticker, // Assuming 'ticker' holds the stock symbol
               quantity: stock.quantity,
               buyPrice: stock.buy_price,
            }));

            setStocks(formattedStocks); // ✅ Set fetched stocks
            setLoading(false); // Set loading to false after fetching
         } catch (error) {
            console.error("❌ Error fetching stock data:", error);
            setLoading(false); // Handle loading state if API call fails
         }
      };

      fetchStocks();
   }, []);

   useEffect(() => {
      if (stocks.length > 0) {
         const wsInstance = new ReconnectingWebSocket(
            "wss://ws.finnhub.io?token=cu0g4hpr01ql96gqhp00cu0g4hpr01ql96gqhp0g"
         );
         setWs(wsInstance);

         wsInstance.onopen = () => {
            console.log("🔓 WebSocket Connected");
            stocks.forEach((stock) =>
               wsInstance.send(
                  JSON.stringify({ type: "subscribe", symbol: stock.symbol })
               )
            );
         };

         wsInstance.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "trade") {
               const updates = {};
               data.data.forEach((trade) => {
                  updates[trade.s] = trade.p;
               });
               setRealTimePrices((prev) => ({ ...prev, ...updates }));
            }
         };

         wsInstance.onerror = (error) =>
            console.error("❌ WebSocket Error:", error);
         wsInstance.onclose = () => console.log("🔒 WebSocket Disconnected");

         return () => wsInstance.close();
      }
   }, [stocks]); // Reconnect WebSocket only when stocks array is updated

   // Calculate total portfolio value
   useEffect(() => {
      const totalValue = stocks.reduce((acc, stock) => {
         const realTimePrice = realTimePrices[stock.symbol] || stock.buyPrice;
         return acc + realTimePrice * stock.quantity;
      }, 0);
      setPortfolioValue(totalValue);
   }, [realTimePrices, stocks]);

   // Handle form submit to add a stock
   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!stockName || !ticker || !quantity || !buyPrice) {
         setError("Please fill in all fields.");
         return;
      }

      const stockData = {
         name: stockName,
         ticker: ticker,
         quantity: parseInt(quantity),
         buy_price: parseFloat(buyPrice),
      };

      try {
         const response = await fetch(
            "https://rohansuryawanshi.pythonanywhere.com/api/stock/",
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
               },
               body: JSON.stringify(stockData),
            }
         );

         if (!response.ok) {
            throw new Error("Failed to add stock.");
         }

         const data = await response.json();
         console.log(data);
         setSuccessMessage("Stock added successfully!");
         setError("");
         setStockName("");
         setTicker("");
         setQuantity("");
         setBuyPrice("");
         toggleAddStockModal();
         setStocks((prevStocks) => [
            ...prevStocks,
            {
               id: data.id, // Assuming 'id' is unique
               name: data.name,
               symbol: data.ticker, // Assuming 'ticker' holds the stock symbol
               quantity: data.quantity,
               buyPrice: data.buy_price,
            }
         ]);
         console.log(stocks);

         // Subscribe to the new stock symbol for real-time price
         if (ws) {
            ws.send(JSON.stringify({ type: "subscribe", symbol: data.ticker }));
         }
      } catch (error) {
         console.error("Error submitting form:", error);
         setError(error.message);
         setSuccessMessage("");
      }
   };

   // Handle Edit Stock
   const handleEditStock = async (e) => {
      e.preventDefault();

      if (!stockName || !ticker || !quantity || !buyPrice) {
         setError("Please fill in all fields.");
         return;
      }

      const stockData = {
         name: stockName,
         ticker: ticker,
         quantity: parseInt(quantity),
         buy_price: parseFloat(buyPrice),
      };

      try {
         const response = await fetch(
            `https://rohansuryawanshi.pythonanywhere.com/api/stock/${editStockId}`,
            {
               method: "PUT",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
               },
               body: JSON.stringify(stockData),
            }
         );

         if (!response.ok) {
            throw new Error("Failed to edit stock.");
         }

         const data = await response.json();
         setSuccessMessage("Stock updated successfully!");
         setError("");
         setStockName("");
         setTicker("");
         setQuantity("");
         setBuyPrice("");
         setIsEditModalOpen(false);
         setStocks((prevStocks) =>
            prevStocks.map((stock) =>
               stock.id === editStockId
                  ? {
                       ...stock,
                       ...{
                          id: data.id, // Assuming 'id' is unique
                          name: data.name,
                          symbol: data.ticker, // Assuming 'ticker' holds the stock symbol
                          quantity: data.quantity,
                          buyPrice: data.buy_price,
                       },
                    }
                  : stock
            )
         );
      } catch (error) {
         console.error("Error editing stock:", error);
         setError(error.message);
         setSuccessMessage("");
      }
   };

   // Handle Delete Stock
   const handleDeleteStock = async (id) => {
      if (window.confirm("Are you sure you want to delete this stock?")) {
         try {
            const response = await fetch(
               `https://rohansuryawanshi.pythonanywhere.com/api/stock/${id}`,
               {
                  method: "DELETE",
                  headers: {
                     "Content-Type": "application/json",
                     Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
               }
            );

            if (!response.ok) {
               throw new Error("Failed to delete stock.");
            }

            setStocks((prevStocks) =>
               prevStocks.filter((stock) => stock.id !== id)
            );
         } catch (error) {
            console.error("Error deleting stock:", error);
         }
      }
   };

   return (
      <div className="bg-gray-100 font-sans min-h-screen">
         <nav className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
               <h1 className="text-lg font-bold">Portfolio Tracker</h1>
               <ul className="flex space-x-4">
                  <li>
                     <a href="#" className="hover:underline">
                        Dashboard
                     </a>
                  </li>
                  <li>
                     <button
                        onClick={toggleAddStockModal}
                        className="hover:underline"
                     >
                        Add Stock
                     </button>
                  </li>
                  {isLoggedIn ? (
                     <>
                        <li>
                           <span>{username}</span>
                        </li>
                        <li>
                           <a
                              href="#"
                              onClick={handleLogout}
                              className="hover:underline"
                           >
                              Logout
                           </a>
                        </li>
                     </>
                  ) : (
                     <li>
                        <a href="/login" className="hover:underline">
                           Login
                        </a>
                     </li>
                  )}
               </ul>
            </div>
         </nav>
         <div className="flex flex-col md:flex-row h-screen overflow-hidden">
            <main className="flex-1 p-6 overflow-y-auto">
               <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

               {/* Portfolio Metrics */}
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-4 shadow rounded-lg">
                     <h3 className="text-sm text-gray-600">
                        Total Portfolio Value
                     </h3>
                     <p className="text-2xl font-semibold text-blue-600">
                        ${portfolioValue.toFixed(2)}
                     </p>
                  </div>

                  <div className="bg-white p-4 shadow rounded-lg">
                     <h3 className="text-sm text-gray-600">Total Stocks</h3>
                     <p className="text-2xl font-semibold text-blue-600">
                        {stocks.length}
                     </p>
                  </div>
               </div>

               {/* Stocks Table */}
                  {/* <table className="min-w-full table-auto">
                     <thead>
                        <tr>
                           <th className="px-4 py-2 text-left">Stock Name</th>
                           <th className="px-4 py-2 text-left">Ticker</th>
                           <th className="px-4 py-2 text-left">Quantity</th>
                           <th className="px-4 py-2 text-left">Buy Price</th>
                           <th className="px-4 py-2 text-left">
                              Real-time Price
                           </th>
                           <th className="px-4 py-2 text-left">
                              Current Price
                           </th>
                           <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {loading ? (
                           <tr>
                              <td colSpan="6" className="text-center py-4">
                                 Loading...
                              </td>
                           </tr>
                        ) : (
                           stocks.map((stock) => {
                              const realTimePrice =
                                 realTimePrices[stock.symbol] || stock.buyPrice;
                              const currentValue =
                                 realTimePrice * stock.quantity;
                              return (
                                 <tr key={stock.id}>
                                    <td className="px-4 py-2">{stock.name}</td>
                                    <td className="px-4 py-2">
                                       {stock.symbol}
                                    </td>
                                    <td className="px-4 py-2">
                                       {stock.quantity}
                                    </td>
                                    <td className="px-4 py-2">
                                       ${stock.buyPrice}
                                    </td>
                                    <td className="px-4 py-2">
                                       ${realTimePrice.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2">
                                       ${currentValue.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2">
                                       <button
                                          onClick={() =>
                                             toggleEditStockModal(stock.id)
                                          }
                                          className="text-blue-600 hover:text-blue-800"
                                       >
                                          Edit
                                       </button>
                                       <button
                                          onClick={() =>
                                             handleDeleteStock(stock.id)
                                          }
                                          className="ml-2 text-red-600 hover:text-red-800"
                                       >
                                          Delete
                                       </button>
                                    </td>
                                 </tr>
                              );
                           })
                        )}
                     </tbody>
                  </table> */}
                  <table className="min-w-full table-auto shadow-lg rounded-lg overflow-hidden">
                     <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                        <tr>
                           <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                              📈 Stock Name
                           </th>
                           <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                              🔖 Ticker
                           </th>
                           <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                              📦 Quantity
                           </th>
                           <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                              💵 Buy Price
                           </th>
                           <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                              📊 Real-time Price
                           </th>
                           <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                              💰 Current Value
                           </th>
                           <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                              ⚙️ Actions
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        {loading ? (
                           <tr>
                              <td
                                 colSpan="7"
                                 className="text-center py-6 text-gray-500"
                              >
                                 Loading...
                              </td>
                           </tr>
                        ) : (
                           stocks.map((stock, index) => {
                              const realTimePrice =
                                 realTimePrices[stock.symbol] || stock.buyPrice;
                              const currentValue =
                                 realTimePrice * stock.quantity;
                              return (
                                 <tr
                                    key={stock.id}
                                    className={
                                       index % 2 === 0
                                          ? "bg-white"
                                          : "bg-gray-50 hover:bg-gray-100 transition-colors"
                                    }
                                 >
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                       {stock.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                       {stock.symbol}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                       {stock.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-green-600 font-semibold">
                                       ${stock.buyPrice}
                                    </td>
                                    <td className="px-6 py-4 text-blue-600 font-semibold">
                                       ${realTimePrice.toFixed(2)}
                                    </td>
                                    <td
                                       className={`px-6 py-4 font-semibold ${
                                          currentValue >=
                                          stock.buyPrice * stock.quantity
                                             ? "text-green-600"
                                             : "text-red-600"
                                       }`}
                                    >
                                       ${currentValue.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 flex space-x-2">
                                       <button
                                          onClick={() =>
                                             toggleEditStockModal(stock.id)
                                          }
                                          className="px-3 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition-transform transform hover:scale-105"
                                       >
                                          ✏️ Edit
                                       </button>
                                       <button
                                          onClick={() =>
                                             handleDeleteStock(stock.id)
                                          }
                                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-transform transform hover:scale-105"
                                       >
                                          🗑️ Delete
                                       </button>
                                    </td>
                                 </tr>
                              );
                           })
                        )}
                     </tbody>
                  </table>
            </main>
         </div>
         {/* Add Stock Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
               <div className="bg-white p-6 w-10/12 md:w-7/12 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Add Stock</h3>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {successMessage && (
                     <p className="text-green-500 text-sm">{successMessage}</p>
                  )}
                  <form className="space-y-4" onSubmit={handleSubmit}>
                     <div>
                        <label
                           htmlFor="stock-name"
                           className="block text-sm font-medium text-gray-700"
                        >
                           Stock Name
                        </label>
                        <input
                           id="stock-name"
                           type="text"
                           value={stockName}
                           onChange={(e) => setStockName(e.target.value)}
                           placeholder="Enter stock name"
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                     </div>
                     <div>
                        <label
                           htmlFor="ticker"
                           className="block text-sm font-medium text-gray-700"
                        >
                           Ticker
                        </label>
                        <input
                           id="ticker"
                           type="text"
                           value={ticker}
                           onChange={(e) => setTicker(e.target.value)}
                           placeholder="Enter stock ticker"
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                     </div>
                     <div>
                        <label
                           htmlFor="quantity"
                           className="block text-sm font-medium text-gray-700"
                        >
                           Quantity
                        </label>
                        <input
                           id="quantity"
                           type="number"
                           value={quantity}
                           onChange={(e) => setQuantity(e.target.value)}
                           placeholder="Enter stock quantity"
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                     </div>
                     <div>
                        <label
                           htmlFor="buy-price"
                           className="block text-sm font-medium text-gray-700"
                        >
                           Buy Price
                        </label>
                        <input
                           id="buy-price"
                           type="number"
                           value={buyPrice}
                           onChange={(e) => setBuyPrice(e.target.value)}
                           placeholder="Enter buy price"
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                     </div>
                     <div className="flex justify-between">
                        <button
                           type="button"
                           onClick={toggleAddStockModal}
                           className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                           Save Changes
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
         {/* Edit Stock Modal */}
         {isEditModalOpen && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
               <div className="bg-white p-6 w-10/12 md:w-7/12 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Edit Stock</h3>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {successMessage && (
                     <p className="text-green-500 text-sm">{successMessage}</p>
                  )}
                  <form className="space-y-4" onSubmit={handleEditStock}>
                     <div>
                        <label
                           htmlFor="stock-name"
                           className="block text-sm font-medium text-gray-700"
                        >
                           Stock Name
                        </label>
                        <input
                           id="stock-name"
                           type="text"
                           value={stockName}
                           onChange={(e) => setStockName(e.target.value)}
                           placeholder="Enter stock name"
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                     </div>
                     <div>
                        <label
                           htmlFor="ticker"
                           className="block text-sm font-medium text-gray-700"
                        >
                           Ticker
                        </label>
                        <input
                           id="ticker"
                           type="text"
                           value={ticker}
                           onChange={(e) => setTicker(e.target.value)}
                           placeholder="Enter stock ticker"
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                     </div>
                     <div>
                        <label
                           htmlFor="quantity"
                           className="block text-sm font-medium text-gray-700"
                        >
                           Quantity
                        </label>
                        <input
                           id="quantity"
                           type="number"
                           value={quantity}
                           onChange={(e) => setQuantity(e.target.value)}
                           placeholder="Enter stock quantity"
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                     </div>
                     <div>
                        <label
                           htmlFor="buy-price"
                           className="block text-sm font-medium text-gray-700"
                        >
                           Buy Price
                        </label>
                        <input
                           id="buy-price"
                           type="number"
                           value={buyPrice}
                           onChange={(e) => setBuyPrice(e.target.value)}
                           placeholder="Enter buy price"
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                     </div>
                     <div className="flex justify-between">
                        <button
                           type="button"
                           onClick={() => setIsEditModalOpen(false)}
                           className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                           Save Changes
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default Dashboard;
