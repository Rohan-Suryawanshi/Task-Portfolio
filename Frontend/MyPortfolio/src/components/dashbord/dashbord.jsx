import React, { useState, useEffect } from "react";

const Dashboard = () => {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal state for edit
   const [stockName, setStockName] = useState("");
   const [ticker, setTicker] = useState("");
   const [quantity, setQuantity] = useState("");
   const [buyPrice, setBuyPrice] = useState("");
   const [error, setError] = useState("");
   const [successMessage, setSuccessMessage] = useState("");
   const [stocks, setStocks] = useState([]); // To store fetched stock data
   const [realstocks, setRealStocks] = useState([]); // To store real-time stock data
   const [loading, setLoading] = useState(true); // For loading state
   const [editStockId, setEditStockId] = useState(null); // Store the ID of the stock being edited
   const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);


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
         setTicker(stockToEdit.ticker);
         setQuantity(stockToEdit.quantity);
         setBuyPrice(stockToEdit.buy_price);
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

   // Fetch stock data from the API
   useEffect(() => {
      const fetchStocks = async () => {
         try {
            const response = await fetch("http://127.0.0.1:8000/api/stock/", {
               method: "GET",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
               },
            });

            if (!response.ok) {
               throw new Error("Failed to fetch stock data.");
            }

            const data = await response.json();
            setStocks(data); 
         } catch (error) {
            console.error("Error fetching stock data:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchStocks();
   }, []);

   // Fetch real-time stock price updates
   useEffect(() => {
      const fetchRealtimeStocksPrice = async () => {
         try {
            const response = await fetch(
               "http://127.0.0.1:8000/api/stock/prices/",
               {
                  method: "GET",
                  headers: {
                     "Content-Type": "application/json",
                     Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
               }
            );

            if (!response.ok) {
               throw new Error("Failed to fetch real-time stock data.");
            }

            const data = await response.json();
            setRealStocks(data); // Update realstocks with real-time data
         } catch (error) {
            console.error("Error fetching real-time stock data:", error);
         }
      };

      fetchRealtimeStocksPrice();
   }, []);

   useEffect(() => {
      const fetchPortfolioData = async () => {
         try {
            // Total Portfolio Value
            const totalResponse = await fetch(
               "http://127.0.0.1:8000/api/stock/portfolio/total/",
               {
                  method: "GET",
                  headers: {
                     "Content-Type": "application/json",
                     Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
               }
            );
            const totalData = await totalResponse.json();
            setTotalPortfolioValue(totalData.total_portfolio_value);
         } catch (error) {
            console.error("Error fetching portfolio data:", error);
         }
      };

      fetchPortfolioData();
   }, []);


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
         const response = await fetch("http://127.0.0.1:8000/api/stock/", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(stockData),
         });

         if (!response.ok) {
            throw new Error("Failed to add stock.");
         }

         const data = await response.json();
         setSuccessMessage("Stock added successfully!");
         setError("");
         setStockName("");
         setTicker("");
         setQuantity("");
         setBuyPrice("");
         toggleAddStockModal();
         setStocks((prevStocks) => [...prevStocks, data]);
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
            `http://127.0.0.1:8000/api/stock/${editStockId}`,
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
               stock.id === editStockId ? { ...stock, ...data } : stock
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
               `http://127.0.0.1:8000/api/stock/${id}`,
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

   const getRealTimePrice = (ticker) => {
      const stock = realstocks.find((stock) => stock.symbol === ticker);
      return stock ? stock.price : "N/A";
   };

   return (
      <div className="bg-gray-100 font-sans min-h-screen">
         {/* Navbar */}
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
                        ${totalPortfolioValue.toFixed(2)}
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
               <div className="overflow-x-auto bg-white p-6 rounded-lg shadow">
                  <table className="min-w-full table-auto">
                     <thead>
                        <tr>
                           <th className="px-4 py-2 text-left">Stock Name</th>
                           <th className="px-4 py-2 text-left">Ticker</th>
                           <th className="px-4 py-2 text-left">Quantity</th>
                           <th className="px-4 py-2 text-left">Buy Price</th>
                           <th className="px-4 py-2 text-left">
                              Real-time Price
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
                           stocks.map((stock) => (
                              <tr key={stock.id}>
                                 <td className="px-4 py-2">{stock.name}</td>
                                 <td className="px-4 py-2">{stock.ticker}</td>
                                 <td className="px-4 py-2">{stock.quantity}</td>
                                 <td className="px-4 py-2">
                                    ${stock.buy_price}
                                 </td>
                                 <td className="px-4 py-2">
                                    {getRealTimePrice(stock.ticker)}
                                 </td>
                                 <td className="px-4 py-2">
                                    <button
                                       onClick={() =>
                                          toggleEditStockModal(stock.id)
                                       }
                                       className="bg-yellow-500 text-white px-4 py-2 rounded"
                                    >
                                       Edit
                                    </button>
                                    <button
                                       onClick={() =>
                                          handleDeleteStock(stock.id)
                                       }
                                       className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                                    >
                                       Delete
                                    </button>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
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
