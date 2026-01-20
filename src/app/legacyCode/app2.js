"use strict";

const NorenRestApi = require("../lib/RestApi");
const { authenticator } = require("otplib"); // OTP generator
require('dotenv').config({ path: '../../.env' });

// Define your authentication parameters
let authparams = {
    userid: process.env.NEXT_PUBLIC_USERID,                // Replace with your actual user ID
    password: process.env.NEXT_PUBLIC_PASSWORD,              // Replace with your actual password
    twoFA: authenticator.generate(process.env.NEXT_PUBLIC_TWOFA), // Replace with your 2FA secret
    vendor_code: process.env.NEXT_PUBLIC_VENDOR_CODE,          // Replace with your vendor code
    api_secret: process.env.NEXT_PUBLIC_API_SECRET, // Replace with your API secret
    imei: process.env.NEXT_PUBLIC_IMEI                     // Replace with your device IMEI if required
};

// Create an instance of the NorenRestApi
const api = new NorenRestApi({});

// Function to handle received quotes
function receiveQuote(data) {
    console.log("Quote ::", data);
}

// Function to handle received orders
function receiveOrders(data) {
    console.log("Order ::", data);
}

// Function to handle received depth data
function receiveDepth(data) {
    console.log("Depth Data ::", data);
}

// Function to handle WebSocket open event
function open() {
    // let instruments = 'NSE|22#BSE|508123#NSE|NIFTY'; 
    let instruments = 'BSE|1'
    // api.subscribe(instruments);
    // console.log("Subscribing to :: ", instruments);

    api.subscribeDepth(instruments);
    console.log("Subscribing to Depth :: ", instruments);

}

// Function to unsubscribe from depth data
function unsubscribe() {
    let instruments = 'BSE|1'; // Same instruments used for subscription
    api.unsubscribe(instruments); // Call the unsubscribe method
    console.log("Unsubscribing :: ", instruments);
}
// Function to unsubscribe 
function unsubscribeDepth() {
    let instruments = 'BSE|1'; // Same instruments used for subscription
    api.unsubscribeDepth(instruments); // Call the unsubscribe method
    console.log("Unsubscribing from Depth :: ", instruments);
}



// Login to the API
api.login(authparams)
    .then((res) => {
        // Check if login was successful
        if (res.stat !== 'Ok') {
            console.error('Login failed:', res);
            return;
        }

        // Parameters for WebSocket connection
        const params = {
            'socket_open': open,
            'quote': receiveQuote,
            'order': receiveOrders,
            'depth': receiveDepth
        };

        // Start the WebSocket connection
        return api.start_websocket(params);
    })
    .then(() => {
        console.log('WebSocket connection established.');

        // Example: Unsubscribe from depth data after 5 seconds
        setTimeout(unsubscribe, 10000); // Unsubscribe after 5 seconds
        setTimeout(unsubscribeDepth, 5000); // Unsubscribe after 5 seconds
    })
    .catch((err) => {
        console.error('Error during login or WebSocket connection:', err);
    });