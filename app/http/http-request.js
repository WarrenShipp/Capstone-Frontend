const app = require("application");
const appSettings = require("application-settings");
const http = require("http");
const dialogs = require("tns-core-modules/ui/dialogs");

// use this to pass callback to _doCallback
var lexicalCallback;
var lexicalErrorCallback;

/**
 * This class acts as a wrapper and error handler for all HTTP requests. It
 * allows users to add a callback to a response, as well as callbacks for when
 * the call back has finished.
 */
class HTTPRequestWrapper {

    static goodResponses = [
        { statusCode: 200, description: "OK" },
        { statusCode: 201, description: "Created" },
        { statusCode: 202, description: "Accepted" },
        { statusCode: 204, description: "No Content" },
        { statusCode: 205, description: "Reset Content" }
    ];
    static defaultContentType = "application/json";

    /**
     * Sets up the HTTP request. Not sent yet.
     * @param {any} url
     * @param {any} type
     */
    constructor(url, method, contentType = null, authToken = null) {
        this.url = url;
        if (!this._isValidURL(url)) {
            throw new Error("\"" + url + "\" is not a valid URL.");
        }
        this.method = method;
        this.contentType = contentType;
        this.authToken = authToken;
        this.content = null;
    }

    setAuthToken(authToken) {
        this.authToken = authToken;
    }

    setContentType(contentType) {
        this.content = contentType;
    }

    setContent(content) {
        this.content = content;
    }

    /**
     * Gives a callback to the request.
     *
     * Callbacks receive one variable which is the unedited server response.
     * @param {any} callback
     */
    setCallback(callback) {
        if (callback instanceof Function) {
            this.callback = callback;
        } else {
            throw new Error("setCallback(callback) requires a Function parameter. Passed a " + typeof callback);
        }
    }

    /**
     * Gives an error callback to the request.
     *
     * Callbacks receive no variables and are used to do necessary processing.
     * @param {any} callback
     */
    setErrorCallback(callback) {
        if (callback instanceof Function) {
            this.errorCallback = callback;
        } else {
            throw new Error("setErrorCallback(callback) requires a Function parameter. Passed a " + typeof callback);
        }
    }

    /**
     * Sends a request with the given information.
     * @param {any} callback Optional. Can be provided earlier using
              setCallback(). Will override the callback.
     */
    send(callback = null, errorCallback = null) {

        // set callbacks
        if (callback) {
            this.setCallback(callback);
        }
        if (errorCallback) {
            this.setErrorCallback(errorCallback);
        }

        // set up request object.
        var headers = {};
        var content = this.content ? this.content : null;
        var request = {
            url: this.url,
            method: this.method,
        };
        if (this.contentType) {
            headers["Content-Type"] = this.contentType;
        } else {
            headers["Content-Type"] = HTTPRequestWrapper.defaultContentType;
        }
        if (this.authToken) {
            headers["Authorization"] = "Bearer " + this.authToken;
        }
        request.headers = headers;
        if (content) {
            if (headers["Content-Type"] == HTTPRequestWrapper.defaultContentType) {
                if (typeof content !== "string") {
                    request.content = JSON.stringify(content);
                } else {
                    request.content = content;
                }
            } else {
                request.content = content;
            }
        }
        console.log(request);

        // run request
        lexicalCallback = this.callback ? this.callback : this._defaultCallback;
        lexicalErrorCallback = this.errorCallback ? this.errorCallback : null;
        http.request(request).then(this._doResponse, this._doRejection);

    }

    /**
     * Handles the response, plus all error checking.
     * @param {any} response
     */
    _doResponse(response) {
        if (HTTPRequestWrapper.goodResponses.some(obj => obj.statusCode == response.statusCode)) {
            
            // do callback
            try {
                lexicalCallback(response);
            } catch (err) {
                console.error("HTTP response error: " + err + "\n" + err.stack);
                lexicalErrorCallback();
                dialogs.alert({
                    title: err.message,
                    message: "Response to HTTP request could not be handled.",
                    okButtonText: "Okay"
                }).then(function () { });
            }
        } else {
            var err = new Error("Bad response code: " + response.statusCode);
            console.error(err + "\n" + err.stack);
            console.error(response.content.toString());
            lexicalErrorCallback();
            dialogs.alert({
                title: err.message,
                message: "HTTP request could not be handled.",
                okButtonText: "Okay"
            }).then(function () { });
        }
    }

    _doRejection(error) {
        console.error(error.message);
        lexicalErrorCallback();
        dialogs.alert({
            title: "HTTP request failed",
            message: error.message,
            okButtonText: "Okay"
        }).then(function () { });
    }

    /**
     * A default callback used when one isn't given. Logs to console.
     * @param {any} response
     */
    _defaultCallback(response) {
        console.log("Recieved response.");
    }

    /**
     * Checks if valid url.
     * Found on: https://stackoverflow.com/a/49849482
     * @param {any} string
     * @returns {boolean}
     */
    _isValidURL(string) {
        var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        if (res == null)
            return false;
        else
            return true;
    }

}
module.exports = HTTPRequestWrapper;