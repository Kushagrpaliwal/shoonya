"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [watchlist, setWatchlist] = useState([]); // Initialize watchlist state
  const router = useRouter();
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/auth/login", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }), // Send email and password
    });

    const data = await response.json();
    console.log(data); // Log the response to check for the email

    if (response.ok) {
      // Check if email is present in the response
      if (data.email) {
        localStorage.setItem("TradingUserEmail", data.email); // Store email in local storage
        alert(data.message); // Alert for successful login
        router.push('/user'); // Redirect to the user dashboard or another page
      } else {
        alert("Email not found in response.");
      }
    } else {
      alert(data.error || "An error occurred during login."); // Alert for failed login
      console.error(data.error);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const tradingUserEmail = localStorage.getItem("TradingUser Email"); // Ensure the key matches
        if (!tradingUserEmail) {
          console.error("No email found in local storage.");
          return; // Exit if no email is found
        }

        const response = await fetch(`/api/getWatchlist?TradingUser Email=${tradingUserEmail}`); // Adjust the endpoint as necessary
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        
        // Check if exchanges exist in the response
        if (data.exchanges) {
          // Set the watchlist with the user's exchanges
          setWatchlist(data.exchanges.map(exchange => ({
            exchange: exchange.name,
            token: exchange.token
          })));
        } else {
          console.error("No exchanges found in the response.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div>
      <section className="bg-gray-50 ">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 ">
            <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo"/>
            Trading  
          </a>
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 ">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                Login to your account
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 ">Your email</label>
                  <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " 
                    placeholder="name@company.com" 
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 ">Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="password" 
                    placeholder="••••••••" 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                    required
                  />
                </div>
                <button type="submit" className="w-full text-white bg-black hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ">Login</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;