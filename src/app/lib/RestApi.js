"use strict";

const axios = require("axios");
var sha256 = require("crypto-js/sha256");

let { API } = require("./config");
const WS = require("./WebSocket");

var NorenRestApi = function (params) {
  var self = this;
  self.__susertoken = "";

  var endpoint = API.endpoint;
  var debug = API.debug;
  var routes = {
    authorize: "/QuickAuth",
    logout: "/Logout",
    forgot_password: "/ForgotPassword",
    watchlist_names: "/MWList",
    watchlist: "/MarketWatch",
    watchlist_add: "/AddMultiScripsToMW",
    watchlist_delete: "/DeleteMultiMWScrips",
    placeorder: "/PlaceOrder",
    modifyorder: "/ModifyOrder",
    cancelorder: "/CancelOrder",
    exitorder: "/ExitSNOOrder",
    orderbook: "/OrderBook",
    tradebook: "/TradeBook",
    singleorderhistory: "/SingleOrdHist",
    searchscrip: "/SearchScrip",
    TPSeries: "/TPSeries",
    optionchain: "/GetOptionChain",
    holdings: "/Holdings",
    limits: "/Limits",
    positions: "/PositionBook",
    scripinfo: "/GetSecurityInfo",
    getquotes: "/GetQuotes",
  };

  axios.interceptors.request.use((req) => {
    console.log(`${req.method} ${req.url} ${req.data}`);
    return req;
  });

  // Add a response interceptor
  axios.interceptors.response.use(
    (response) => {
      if (API.debug) console.log(response);
      return response.data;
    },
    (error) => {
      console.log(error);
      if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
      }
      return Promise.reject({ status: 500, message: "Network Error" });
    }
  );

  function post_request(route, params, usertoken = "") {
    let url = endpoint + routes[route];
    let payload = "jData=" + JSON.stringify(params);
    payload = payload + `&jKey=${self.__susertoken}`;
    return axios.post(url, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  self.setSessionDetails = function (response) {
    self.__susertoken = response.susertoken;
    self.__username = response.actid;
    self.__accountid = response.actid;
  };

  self.login = function (params) {
    let pwd = sha256(params.password).toString();
    let u_app_key = `${params.userid}|${params.api_secret}`;
    let app_key = sha256(u_app_key).toString();

    let authparams = {
      source: "API",
      apkversion: "js:1.0.0",
      uid: params.userid,
      pwd: pwd,
      factor2: params.twoFA,
      vc: params.vendor_code,
      appkey: app_key,
      imei: params.imei,
    };

    console.log(authparams);
    let auth_data = post_request("authorize", authparams);

    return auth_data
      .then((response) => {
        console.log("Login response:", response);
        if (response.stat === "Ok") {
          self.setSessionDetails(response);
          return response;
        } else {
          throw new Error("Login failed: " + (response.emsg || response.message || "Unknown error"));
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        throw err; // Rethrow the error for further handling
      });
  };

  self.searchscrip = function (exchange, searchtext) {
    let values = {};
    values["uid"] = self.__username;
    values["exch"] = exchange;
    values["stext"] = searchtext;

    let reply = post_request("searchscrip", values, self.__susertoken);

    reply
      .then((response) => {
        if (response.stat === "Ok") {
          // Handle successful response
        }
      })
      .catch(function (err) {
        throw err;
      });

    return reply;
  };

  self.get_quotes = function (exchange, token) {
    let values = {};
    values["uid"] = self.__username;
    values["exch"] = exchange;
    values["token"] = token;

    let reply = post_request("getquotes", values, self.__susertoken);
    return reply;
  };

  self.start_websocket = function (callbacks) {
    let web_socket = new WS({ url: API.websocket, apikey: self.__susertoken });

    self.web_socket = web_socket;
    let params = {
      uid: self.__username,
      actid: self.__username,
      apikey: self.__susertoken,
    };

    return web_socket.connect(params, callbacks).then(() => {
      console.log("WebSocket is connected");
    });
  };

  self.subscribeDepth = function (instrument) {
    let values = {};
    values["t"] = "d"; // 'd' represents depth subscription
    values["k"] = instrument;
    self.web_socket.send(JSON.stringify(values));
  };

  self.subscribe = function (instrument, feedtype) {
    if (feedtype === "depth") {
      self.subscribeDepth(instrument);
    } else {
      let values = {};
      values["t"] = "t"; // 't' represents touchline subscription
      values["k"] = instrument;
      self.web_socket.send(JSON.stringify(values));
    }
  };

  self.unsubscribeDepth = function (instrument) {
    let values = {};
    values['t'] = 'ud'; // 'u' represents depth unsubscribe
    values['k'] = instrument;
    self.web_socket.send(JSON.stringify(values));
  };

  self.unsubscribe = function (instrument, feedtype) {
    if (feedtype === "depth") {
      self.unsubscribeDepth(instrument);
    }
    let values = {};
    values['t'] = 'u'; // 'u' represents depth unsubscribe
    values['k'] = instrument;
    self.web_socket.send(JSON.stringify(values));
  };
};

module.exports = NorenRestApi;