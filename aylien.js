var https       = require("https");
var config      = require("./config");
var querystring = require("querystring");

module.exports = {

    // API CALL
    call: function(endpoint, parameters, callback) {

        var postData = querystring.stringify(parameters);
        var request = https.request({
            host: "api.aylien.com",
            path: "/api/v1/" + endpoint,
            headers: {
                "Accept":                             "application/json",
                "Content-Type":                       "application/x-www-form-urlencoded",
                "Content-Length":                     postData.length,
                "X-AYLIEN-TextAPI-Application-ID":    config.aylien.app_id,
                "X-AYLIEN-TextAPI-Application-Key":   config.aylien.app_key,
            }
        }, function(response) {
            var data = "";
            
            response.on("data", function(chunk) {
                data += chunk;
            });

            response.on("end", function() {
                callback(JSON.parse(data));
            });
        });

        request.write(postData);
        request.end();
    }
};