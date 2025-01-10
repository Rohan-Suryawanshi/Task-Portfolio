import React, { useState } from "react";

const Header = () => {
   const [menuOpen, setMenuOpen] = useState(false);

   const toggleMenu = () => {
      setMenuOpen(!menuOpen);
   };

   return (
      <header className="bg-blue-800 text-white sticky top-0 z-50 shadow-md">
         <div className="container mx-auto flex justify-between items-center px-4 py-4">
            <h1 className="text-2xl font-bold">StockPortfolio</h1>
            {/* Mobile Menu Button */}
            <button
               className="md:hidden block text-white focus:outline-none"
               onClick={toggleMenu}
            >
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
               >
                  {menuOpen ? (
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                     />
                  ) : (
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16m-7 6h7"
                     />
                  )}
               </svg>
            </button>
            {/* Navigation Links */}
            <nav
               className={`${
                  menuOpen ? "block" : "hidden"
               } absolute md:relative md:flex bg-blue-800 md:bg-transparent w-full md:w-auto md:space-x-6 top-full left-0 md:top-0 md:items-center`}
            >
               <a
                  href="#features"
                  className="block md:inline-block px-4 py-2 text-center hover:text-yellow-300"
               >
                  Features
               </a>
               <a
                  href="#testimonials"
                  className="block md:inline-block px-4 py-2 text-center hover:text-yellow-300"
               >
                  Testimonials
               </a>
               <a
                  href="/login"
                  className="block md:inline-block px-4 py-2 text-center hover:text-yellow-300"
               >
                  Login
               </a>
               <a
                  href="/register"
                  className="block md:inline-block px-4 py-2 text-center hover:text-yellow-300"
               >
                  Register
               </a>

               {/* Sign In Button for Mobile */}
               <div className="md:hidden  mt-4 flex justify-center w-full text-center">
                  <a
                     href="/register"
                     className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500 w-56 mb-5 "
                  >
                     Sign In
                  </a>
               </div>
            </nav>
            {/* Sign In Button for Desktop */}
            <a
               href="/register"
               className="hidden md:block bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500 "
            >
               Sign In
            </a>
         </div>
      </header>
   );
};

export default Header;
