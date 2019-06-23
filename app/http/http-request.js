const app = require("application");
const appSettings = require("application-settings");
const http = require("http");
const dialogs = require("tns-core-modules/ui/dialogs");

/**
 * This class acts as a wrapper and error handler for all HTTP requests. It
 * allows users to add a callback to a response, as well as callbacks for when
 * the call back has finished.
 */
class HTTPRequestWrapper {

    // these codes are the only ones returned when a request has been
    // successfully handled.
    static goodResponses = [
        { statusCode: 200, description: "OK" },
        { statusCode: 201, description: "Created" },
        { statusCode: 202, description: "Accepted" },
        { statusCode: 204, description: "No Content" },
        { statusCode: 205, description: "Reset Content" }
    ];
    // used when a content type is not set
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

    /**
     * Sets the authorisation token. Default is set in constructor.
     * @param {any} authToken
     */
    setAuthToken(authToken) {
        this.authToken = authToken;
    }

    /**
     * Sets the content type. Default is defaultContentType
     * @param {any} contentType
     */
    setContentType(contentType) {
        this.content = contentType;
    }

    /**
     * Sets the content. Default is set in constructor.
     * @param {any} content
     */
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
     * @param {Function} callback Optional. Can be provided earlier using
     *        setCallback(). Will override the callback.
     * @param {Function} errorCallback Optional. Used when an error occurs.
              Intended to perform page-specific functionality upon failing a
              request, such as exiting a page. Can also be set using
              setErrorCallback().
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

        // set callbacks using lexical scoping
        var lexicalCallback = this.callback ? this.callback : this._defaultCallback;
        var lexicalErrorCallback = this.errorCallback ? this.errorCallback : null;

        // run request
        http.request(request).then(
            // do reponse
            function (response) {
                // has a status code that is valid
                if (HTTPRequestWrapper.goodResponses.some(obj => obj.statusCode == response.statusCode)) {

                    // do callback
                    try {
                        lexicalCallback(response);
                    } catch (err) {
                        // console logging handled here
                        console.error("HTTP response error: " + err + "\n" + err.stack);
                        console.error(response.content.toString());

                        // other functions handled in error callback
                        if (lexicalErrorCallback) {
                            lexicalErrorCallback(err);
                        }
                        // if no error callback, we show a dialog
                        else {
                            dialogs.alert({
                                title: "Response to HTTP request could not be handled.",
                                message: err.message,
                                okButtonText: "Okay"
                            }).then(function () { });
                        }
                    }
                }
                // otherwise throw error for bad status code
                else {
                    // console logging handled here
                    var err = new Error("Bad response code: " + response.statusCode);
                    console.error(err.message + "\n" + err.stack);

                    // other functions handled in error callback
                    if (lexicalErrorCallback) {
                        lexicalErrorCallback(err);
                    }
                    // if no error callback, we show a dialog
                    else {
                        dialogs.alert({
                            title: "HTTP request could not be handled.",
                            message: err.message,
                            okButtonText: "Okay"
                        }).then(function () { });
                    }
                }
            },
            // do general error
            function (err) {
                // console logging handled here
                console.error(err.message);

                // other functions handled in error callback
                if (lexicalCallbackError) {
                    lexicalErrorCallback(err);
                }
                // if no error callback, we show a dialog
                else {
                    dialogs.alert({
                        title: "HTTP request failed",
                        message: err.message,
                        okButtonText: "Okay"
                    }).then(function () { });
                }
            }
        );

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