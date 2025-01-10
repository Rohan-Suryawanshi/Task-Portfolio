const Feature_Section=()=>{
  return (
     <section id="features" className="py-12 bg-gray-100">
        <div className="container mx-auto text-center px-8">
           <h3 className="text-3xl font-bold mb-6">Platform Features</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                 <div className="mb-4 rounded">
                    <img
                       src="../images/Portfolio Tracking.png"
                       className="rounded"
                    />
                 </div>
                 <h4 className="text-xl font-bold mb-2">Portfolio Tracking</h4>
                 <p className="text-gray-600">
                    Monitor your assets and stocks in real-time from one place.
                 </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                 <div className="mb-4 rounded">
                    <img
                       src="../images/Market Insight.png"
                       className="rounded"
                    />
                 </div>
                 <h4 className="text-xl font-bold mb-2">Market Insights</h4>
                 <p className="text-gray-600">
                    Get the latest stock market news and trends at your
                    fingertips.
                 </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                 <div className="mb-4 rounded">
                    <img
                       src="../images/Analytic.png"
                       className="rounded"
                    />
                 </div>
                 <h4 className="text-xl font-bold mb-2">Analytics & Reports</h4>
                 <p className="text-gray-600">
                    Gain actionable insights with performance analytics.
                 </p>
              </div>
           </div>
        </div>
     </section>
  );
}

export default  Feature_Section