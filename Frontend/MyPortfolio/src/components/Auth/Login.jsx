import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const refreshAccessToken = async () => {
   const refreshToken = localStorage.getItem("refreshToken");

   if (!refreshToken) {
      throw new Error("No refresh token available");
   }

   const response = await fetch("https://rohansuryawanshi.pythonanywhere.com/api/token/refresh/", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
   });

   if (!response.ok) {
      throw new Error("Failed to refresh token");
   }

   const data = await response.json();
   localStorage.setItem("token", data.access); // Update token
   return data.access;
};

const get_details = async () => {
   let token = localStorage.getItem("token");

   if (!token) {
      throw new Error("No token available");
   }

   const response = await fetch("https://rohansuryawanshi.pythonanywhere.com/api/user/profile/", {
      method: "GET",
      headers: {
         Authorization: `Bearer ${token}`,
         "Content-Type": "application/json",
      },
   });

   if (response.status === 401) {
      // Token expired, try refreshing
      try {
         token = await refreshAccessToken();

         // Retry the request with the new token
         const retryResponse = await fetch(
            "https://rohansuryawanshi.pythonanywhere.com/api/user/profile/",
            {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
               },
            }
         );

         if (!retryResponse.ok) {
            throw new Error(`HTTP error! Status: ${retryResponse.status}`);
         }

         return retryResponse.json();
      } catch (refreshError) {
         console.error("Token refresh failed:", refreshError);
         throw refreshError;
      }
   }

   if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
   }

   return response.json();
};

const Login = () => {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const [successMessage, setSuccessMessage] = useState("");
   const navigate = useNavigate(); // For navigation

   const handleSubmit = async (e) => {
      e.preventDefault();

      const payload = {
         email: email,
         password: password,
      };

      try {
         const response = await fetch("https://rohansuryawanshi.pythonanywhere.com/api/user/login/", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
         });

         if (!response.ok) {
            setError("Invalid email or password. Please try again.");
            setSuccessMessage("");
            return;
         }

         const data = await response.json();
         // console.log("Login successful:", data);

         // Store tokens in localStorage
         localStorage.setItem("token", data.token.access);
         localStorage.setItem("refreshToken", data.token.refresh);

         setSuccessMessage("Login successful!");
         setError("");

         // Fetch user details
         const userDetails = await get_details();
         // console.log("User Details:", userDetails);

         localStorage.setItem("id", userDetails.id);
         localStorage.setItem("email", userDetails.email);
         localStorage.setItem("name", userDetails.name);

         // Redirect to dashboard
         navigate("/dashbord");

         // Reset form
         setEmail("");
         setPassword("");
      } catch (error) {
         console.error("Error during login:", error);
         setError("An error occurred during login. Please try again.");
         setSuccessMessage("");
      }
   };

   return (
      <section className="bg-gray-50 dark:bg-gray-900">
         <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
               <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                  <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                     Sign in to your account
                  </h1>
                  {successMessage && (
                     <div className="text-green-500 text-center">
                        {successMessage}
                     </div>
                  )}
                  <form
                     onSubmit={handleSubmit}
                     className="space-y-4 md:space-y-6"
                  >
                     {error && (
                        <div className="text-red-500 text-center">
                           <p>{error}</p>
                        </div>
                     )}

                     <div>
                        <label
                           htmlFor="email"
                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                           Your email
                        </label>
                        <input
                           type="email"
                           name="email"
                           id="email"
                           className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           placeholder="name@company.com"
                           required
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                        />
                     </div>

                     <div>
                        <label
                           htmlFor="password"
                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                           Password
                        </label>
                        <input
                           type="password"
                           name="password"
                           id="password"
                           placeholder="••••••••"
                           className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                        />
                     </div>

                     <button
                        type="submit"
                        className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                     >
                        Sign in
                     </button>

                     <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Link
                           to="/register"
                           className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                        >
                           Sign up
                        </Link>
                     </p>
                  </form>
               </div>
            </div>
         </div>
      </section>
   );
};

export default Login;
