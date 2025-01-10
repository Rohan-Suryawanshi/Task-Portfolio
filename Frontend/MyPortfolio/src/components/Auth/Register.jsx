import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [name, setName] = useState("");
   const [errors, setErrors] = useState({});
   const [successMessage, setSuccessMessage] = useState("");

   const handleSubmit = async (e) => {
      e.preventDefault();

      const payload = {
         email: email,
         name: name,
         password: password,
         password2: confirmPassword,
      };

      try {
         // Make POST request to register API
         const response = await fetch(
            "http://127.0.0.1:8000/api/user/register/",
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(payload),
            }
         );

         const data = await response.json();

         if (!response.ok) {
            // Handle error case and display validation errors
            setErrors(data.errors || {});
            setSuccessMessage(""); // Clear success message if there is an error
            return;
         }

         // Handle success case
         setSuccessMessage("Registration successful!");
         setErrors({}); // Clear previous errors

         // Clear form fields after successful registration
         setEmail("");
         setPassword("");
         setConfirmPassword("");
         setName("");

         // Store the tokens in localStorage
         localStorage.setItem("token", data.token.access);
         localStorage.setItem("refreshToken", data.token.refresh);
      } catch (error) {
         console.error("Error during registration:", error);
         alert("Registration failed, please try again.");
         setSuccessMessage(""); // Clear success message on failure
      }
   };

   return (
      <section className="bg-gray-50 dark:bg-gray-900">
         <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
               <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                  <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                     Create your account
                  </h1>

                  {/* Display success message */}
                  {successMessage && (
                     <div className="text-green-500 text-center">
                        {successMessage}
                     </div>
                  )}

                  {/* Display error messages */}
                  {Object.keys(errors).length > 0 && (
                     <div className="text-red-500 text-center">
                        <ul>
                           {Object.keys(errors).map((key) => (
                              <li key={key}>{errors[key][0]}</li>
                           ))}
                        </ul>
                     </div>
                  )}

                  <form
                     onSubmit={handleSubmit}
                     className="space-y-4 md:space-y-6"
                  >
                     <div>
                        <label
                           htmlFor="name"
                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                           Your Name
                        </label>
                        <input
                           type="text"
                           name="name"
                           id="name"
                           className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           placeholder="Name"
                           required
                           value={name} // Bind to Name state
                           onChange={(e) => setName(e.target.value)}
                        />
                     </div>
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
                     <div>
                        <label
                           htmlFor="confirmPassword"
                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                           Confirm Password
                        </label>
                        <input
                           type="password"
                           name="confirmPassword"
                           id="confirmPassword"
                           placeholder="••••••••"
                           className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           required
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                     </div>

                     <button
                        type="submit"
                        className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                     >
                        Sign up
                     </button>
                     <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link
                           to="/login"
                          className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                        >
                           Sign in
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
