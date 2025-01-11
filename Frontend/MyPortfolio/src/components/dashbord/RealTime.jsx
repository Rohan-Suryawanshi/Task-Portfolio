import React, { useState } from "react";

const StockSearch = () => {
   const [searchQuery, setSearchQuery] = useState("");
   const [searchResults, setSearchResults] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [selectedStockInfo, setSelectedStockInfo] = useState(null); // Store detailed info of selected stock

   const API_KEY = "cu0g4hpr01ql96gqhp00cu0g4hpr01ql96gqhp0g"; // Finnhub API Key

   // Fetch stocks from Finnhub
   const handleSearch = async () => {
      if (!searchQuery.trim()) {
         setError("Please enter a search term.");
         return;
      }

      setLoading(true);
      setError("");
      try {
         const response = await fetch(
            `https://finnhub.io/api/v1/search?q=${searchQuery}&exchange=NSE&token=${API_KEY}`
         );

         if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
         }

         const data = await response.json();
         if (data.result && data.result.length > 0) {
            setSearchResults(data.result);
         } else {
            setSearchResults([]);
            setError("No results found for NSE.");
         }
      } catch (err) {
         console.error("Error fetching data:", err);
         setError("Error fetching data. Please check the console for details.");
      }
      setLoading(false);
   };

   // Fetch detailed information about selected stock
   const handleSelect = async (symbol) => {
      try {
         const response = await fetch(
            `https://finnhub.io/api/v1/search?q=${symbol}&token=${API_KEY}`
         );

         if (!response.ok) {
            throw new Error(
               `Error fetching stock profile: ${response.statusText}`
            );
         }

         const data = await response.json();
         setSelectedStockInfo(data); // Store the stock information
      } catch (err) {
         console.error("Error fetching stock info:", err);
         setError("Error fetching stock information.");
      }
   };

   return (
      <div className="max-w-md mx-auto mt-10">
         <h2 className="text-2xl font-bold mb-4 text-center">
            Indian Stock Search (NSE)
         </h2>

         <div className="flex">
            <input
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search Indian stocks (NSE)..."
               className="w-full border p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
               onClick={handleSearch}
               className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700"
            >
               {loading ? "Searching..." : "Search"}
            </button>
         </div>

         {error && <p className="text-red-500 mt-2">{error}</p>}

         {searchResults.length > 0 && (
            <ul className="mt-2 border rounded-md max-h-60 overflow-y-auto shadow-lg bg-white">
               {searchResults.map((stock) => (
                  <li
                     key={stock.symbol}
                     onClick={() => handleSelect(stock.symbol)}
                     className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                     <strong>{stock.symbol}</strong> - {stock.description}
                  </li>
               ))}
            </ul>
         )}

         {/* Display detailed information of selected stock */}
         {selectedStockInfo && (
            <div className="mt-6 bg-white p-4 shadow-lg rounded-md">
               <h3 className="text-xl font-semibold">Stock Info</h3>
               <p>
                  <strong>Company Name:</strong> {selectedStockInfo.name}
               </p>
               <p>
                  <strong>Sector:</strong> {selectedStockInfo.finnhubIndustry}
               </p>
               <p>
                  <strong>Country:</strong> {selectedStockInfo.country}
               </p>
               <p>
                  <strong>Market Capitalization:</strong>{" "}
                  {selectedStockInfo.marketCapitalization}
               </p>
               <p>
                  <strong>Website:</strong>{" "}
                  <a
                     href={selectedStockInfo.website}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-blue-500"
                  >
                     {selectedStockInfo.website}
                  </a>
               </p>
            </div>
         )}
      </div>
   );
};

export default StockSearch;
