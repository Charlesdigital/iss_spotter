const request = require("request");

const fetchMyIP = function (callback) {
  // use request to fetch IP address from JSON API
  const URL = "https://api.ipify.org?format=json";
  request(URL, (error, response, body) => {
    const data = JSON.parse(body);
    if (error) {
      return callback(error, null);
    }
    if (data["ip"]) {
      return callback(null, data["ip"]);
      console.log(data["ip"]);
    } else {
      return callback("ip not found", null);
    }
  });
};

const fetchCoordsByIP = function (ip, callback) {
  const URL = `https://freegeoip.app/json/${ip}`;
  console.log(URL);
  request(URL, (error, response, body) => {
    const data = JSON.parse(body);
    if (error) {
      return callback(error, null);
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    const position = {
      latitude: data["latitude"],
      longitude: data["longitude"],
    };
    callback(error, position);
  });
};
module.exports = { fetchMyIP, fetchCoordsByIP };


// iss.js

/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
 const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

// Don't need to export the other functions since we are not testing them right now.
module.exports = { fetchISSFlyOverTimes };


const request = require('request');

// ... other three functions not included in solution ...

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

// Only export nextISSTimesForMyLocation and not the other three (API request) functions.
// This is because they are not needed by external modules.
module.exports = { nextISSTimesForMyLocation };