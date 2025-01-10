const Hero_Section=()=>{
  return (
     <>
        <section className="bg-gradient-to-r from-blue-900 to-blue-600 text-white">
           <div className="container mx-auto flex flex-col-reverse md:flex-row items-center px-4 py-12">
              <div className="w-full md:w-1/2">
                 <h2 className="text-5xl font-bold mb-4 leading-tight">
                    Your Investments, <br /> Simplified.
                 </h2>
                 <p className="text-lg mb-6">
                    Track your portfolio, analyze performance, and stay ahead
                    with real-time insights.
                 </p>
                 <button className="bg-yellow-400 text-black px-6 py-3 rounded shadow-md hover:bg-yellow-500">
                    Get Started Now
                 </button>
              </div>
              <div className="w-full md:w-1/2">
                 <div className="">
                    <img
                       src="../images/Hero.jpg"
                       alt="Image Description"
                       className="object-cover w-full h-full rounded-md"
                    />
                 </div>
              </div>
           </div>
        </section>
     </>
  );
}

export default  Hero_Section