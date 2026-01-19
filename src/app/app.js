// using the restapi for fetching the data
const ShoonyaApi = require('./lib/RestApi');
const { authenticator } = require("otplib");
require('dotenv').config({ path: '../../.env' });

const api = new ShoonyaApi(); // putting the api fetched from the restapi to const api
const twoFASecret = process.env.NEXT_PUBLIC_TWOFA;
const code = authenticator.generate(twoFASecret);
console.log("Generated 2FA Code:", code);

// For login in to the shoonya servers credentials are needed
const credentials = {
  userid: process.env.NEXT_PUBLIC_USERID,
  password: process.env.NEXT_PUBLIC_PASSWORD,
  twoFA: code,
  vendor_code: process.env.NEXT_PUBLIC_VENDOR_CODE,
  api_secret: process.env.NEXT_PUBLIC_API_SECRET,
  imei: process.env.NEXT_PUBLIC_IMEI,
};

// function for data fetching
async function fetchData() {
  console.log('Logging in...');
  try {
    // Use newly created from ShoonyaApi() to login using cedentials
    const loginResponse = await api.login(credentials);
    console.log('Login Response:', loginResponse);

    // As we logs in with the loginResponse checking if its giving the ok result 
    if (loginResponse.stat === 'Ok') {
      const exchange = 'MCX'; // using the exchange parameter
      const searchKey = 'SILVER'; // using the searchKey for the prefix of the desired contract 

      // With using the searchscrip we will search through the server 
      // for the results which are having the exchange and searchkey as the parameters for searching
      const searchResults = await api.searchscrip(exchange, searchKey);
      console.log('All Search Results:', searchResults);

      // Now i want to search strictly for a specify string of text i am using the regex to find 
      // for specify results , Now suppose we have searched and got 10 results then i will again filter 
      // from those results and then storing them in const .
      const silverContracts = searchResults.values.filter(item =>
        /^SILVER\d{2}[A-Z]{3}\d{2}$/.test(item.tsym) &&
        // !/[PC]\d+/.test(item.tsym) &&
        item.instname === "FUTCOM"
      );

      // Now i am searching through the results if they are available or not 
      if (silverContracts.length > 0) {
        silverContracts.forEach(contract => {
          const expiry = contract.tsym.slice(-7)
          console.log('Available Silver Contract:', contract.tsym);
          console.log('Expiry Date:', expiry)
        });

        // Storing those results which have been choosed from the above filtered results .
        const tradingSymbol1 = silverContracts[0].tsym;
        const tradingSymbol2 = silverContracts[1].tsym;
        const tradingSymbol3 = silverContracts[2].tsym;
        const expirydat1 = tradingSymbol1.slice(-7)
        const expirydat2 = tradingSymbol2.slice(-7)
        const expirydat3 = tradingSymbol3.slice(-7)
        console.log('Selected Trading Symbol:', tradingSymbol1, tradingSymbol2, tradingSymbol3, expirydat1, expirydat2, expirydat3);

        // get_quotes is a fixed predifined api method for fetching through the whole single contract details 

        const quotes1 = await api.get_quotes(exchange, tradingSymbol1);
        const quotes2 = await api.get_quotes(exchange, tradingSymbol2);
        const quotes3 = await api.get_quotes(exchange, tradingSymbol3);
        console.log('Quotes 1:', quotes1);
        console.log('Quotes 2:', quotes2);
        console.log('Quotes 3:', quotes3);
      } else {
        console.log('No Silver contracts found in the desired format.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchData();