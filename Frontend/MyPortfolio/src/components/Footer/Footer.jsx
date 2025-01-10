const footer=()=>{
  return (
     <>
        <footer className="bg-blue-800 text-white py-6">
           <div className="container mx-auto text-center">
              <p className="mb-4">
                 © 2024 StockPortfolio. All rights reserved.
              </p>
              <div className="flex justify-center space-x-6">
                 <a href="#" className="hover:text-yellow-300">
                    Privacy Policy
                 </a>
                 <a href="#" className="hover:text-yellow-300">
                    Terms of Service
                 </a>
                 <a href="#" className="hover:text-yellow-300">
                    Contact
                 </a>
              </div>
           </div>
        </footer>
     </>
  );
}

export default footer;