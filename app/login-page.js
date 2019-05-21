const app = require("tns-core-modules/application");
var application = require("application");
var view = require("ui/core/view");
var dialogs = require("tns-core-modules/ui/dialogs");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");
const appSettings = require("application-settings");
const modalViewModule = "modal-account-create-page";
const HTTPRequestWrapper = require("../app/http/http-request.js");
var observable = require("data/observable");
var viewModel = new observable.Observable();

var email;
var password;
var requestStatus;

/**
 * Opens the Sidedrawer
 * @param {any} args
 */
function onDrawerButtonTap(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}
exports.onDrawerButtonTap = onDrawerButtonTap;

/**
 * Sets up properties when the page loads.
 * @param {any} args
 */
function pageLoaded(args) {
    page = args.object;
    requestStatus = false;
    viewModel.set("requestStatus", requestStatus);
    page.bindingContext = viewModel;
}
exports.pageLoaded = pageLoaded;

/**
 * Logs the user in.
 * @param {any} args
 */
function login(args) {
    const button = args.object;
    const page = button.page;

    // TODO need to to clientside validation.

    requestStatus = true;
    viewModel.set("requestStatus", requestStatus); // disable buttons whilst requesting
    email = viewModel.get("email");
    let password = viewModel.get("password");

    // do a login request
    var request = new HTTPRequestWrapper(
        global.serverUrl + global.endpointToken,
        "POST",
        "application/json"
    );
    request.setContent({ "email": email, "password": password });
    request.send(
        function (result) {
            var obj = JSON.stringify(result);
            obj = JSON.parse(obj);
            var tokenAccess = obj.content.access;
            var tokenRefresh = obj.content.refresh;
            console.log(tokenAccess + " " + tokenRefresh);

            // could not get token / login with credentials.
            if (!tokenAccess || obj.content.detail) {
                console.error("Login Error: " + obj.content.detail);
                let message = obj.content.detail ? obj.content.detail : "Could not log in.";
                dialogs.alert({
                    title: "Could not login!",
                    message: message,
                    okButtonText: "Okay"
                }).then(
                    function () {
                        _removePassword();
                        requestStatus = false;
                        viewModel.set("requestStatus", requestStatus);
                    }
                );
                return;
            }

            // otherwise, do user data
            _getMyDetails(tokenAccess, tokenRefresh)

        },
        function (error) {
            appSettings.remove("isCoach");
            appSettings.remove("isPlayer");
            appSettings.remove("coachId");
            appSettings.remove("playerId");
            appSettings.remove(global.tokenAccess);
            appSettings.remove(global.tokenRefresh);
            appSettings.remove(global.lastRefresh);

            dialogs.alert({
                title: "Could not log in!",
                message: error.message,
                okButtonText: "Okay"
            }).then(
                function () {
                    _removePassword();
                    requestStatus = false;
                    viewModel.set("requestStatus", requestStatus);
                }
            );
        }
    );

    // try to log in.
    /*
    http.request({
        url: global.serverUrl + global.endpointToken,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify({ "email": email, "password": password })
    }).then(function (result) {
        // console.log("log in start");
        // console.log(result);
        viewModel.set("requestStatus", true);
        // console.log("print result");
        var obj = JSON.stringify(result);
        // console.log("stringify result");
        obj = JSON.parse(obj);
        // console.log("parse result");
        var tokenAccess = obj.content.access;
        var tokenRefresh = obj.content.refresh;
        console.log(tokenAccess + " " + tokenRefresh);

        // could not get token / login with credentials.
        if (!tokenAccess || obj.content.detail) {
            console.log("Login Error: " + obj.content.detail);
            let message = obj.content.detail ? obj.content.detail : "Could not log in.";
            dialogs.alert({
                title: "Could not login!",
                message: message,
                okButtonText: "Okay"
            }).then(function () { });
            viewModel.set("password", "");
            return;
        } else {

            // Set tokens
            appSettings.setString(global.tokenAccess, tokenAccess);
            appSettings.setString(global.tokenRefresh, tokenRefresh);
            appSettings.setNumber(global.lastRefresh, (new Date()).getTime());
            console.log("access = " + appSettings.getString(global.tokenAccess));
            console.log("refresh = " + appSettings.getString(global.tokenRefresh));
            console.log("lastRefresh = " + appSettings.getNumber(global.lastRefresh));
            viewModel.set("email", "");
            viewModel.set("password", "");

            page.frame.navigate({
                moduleName: "home-page",
                clearHistory: true
            });

        }
    }, function (error) {
        viewModel.set("requestStatus", true);
        console.error(JSON.stringify(error));
        dialogs.alert({
            title: "Error!",
            message: JSON.stringify(error),
            okButtonText: "Okay"
        });
    });
    */

}
exports.login = login;

/**
 * Loads the account creation modal.
 * @param {any} args
 */
function createAccount(args) {
    const button = args.object;
    const page = button.page;
    const fullscreen = false;

    button.showModal(modalViewModule, {}, () => { }, fullscreen);
}
exports.createAccount = createAccount;

/**
 * Follows a login. required to get specific user data.
 * @param {any} result
 */
function _getMyDetails(tokenAccess, tokenRefresh) {
    var request = new HTTPRequestWrapper(
        global.serverUrl + global.endpointUser + "me",
        "GET",
        "application/json",
        tokenAccess
    );
    request.send(
        function (result) {

            // set your login data
            var obj = JSON.stringify(result);
            obj = JSON.parse(obj);
            appSettings.setBoolean("isCoach", obj.content.is_coach);
            if (obj.content.is_coach) {
                appSettings.setString("coachId", obj.content.coach.id);
            }
            appSettings.setBoolean("isPlayer", obj.content.is_player);
            if (obj.content.is_player) {
                appSettings.setString("playerId", obj.content.player.id);
            }
            console.log("Is Coach:" + appSettings.getBoolean("isCoach"));
            console.log("Coach Id:" + appSettings.getString("coachId"));
            console.log("Is Player:" + appSettings.getBoolean("isPlayer"));
            console.log("Player Id:" + appSettings.getString("playerId"));

            // set your tokens
            appSettings.setString(global.tokenAccess, tokenAccess);
            appSettings.setString(global.tokenRefresh, tokenRefresh);
            appSettings.setNumber(global.lastRefresh, (new Date()).getTime());
            console.log("access = " + appSettings.getString(global.tokenAccess));
            console.log("refresh = " + appSettings.getString(global.tokenRefresh));
            console.log("lastRefresh = " + appSettings.getNumber(global.lastRefresh));

            // all went well
            page.frame.navigate({
                moduleName: "home-page",
                clearHistory: true
            });

        },
        function (error) {
            appSettings.remove("isCoach");
            appSettings.remove("isPlayer");
            appSettings.remove("coachId");
            appSettings.remove("playerId");
            appSettings.remove(global.tokenAccess);
            appSettings.remove(global.tokenRefresh);
            appSettings.remove(global.lastRefresh);
            
            dialogs.alert({
                title: "Could not log in!",
                message: error.message,
                okButtonText: "Okay"
            }).then(
                function () {
                    _removePassword();
                    requestStatus = false;
                    viewModel.set("requestStatus", requestStatus);
                }
            );
        }
    )
}

/**
 * Remove the email field from the form / data to prevent unauthorised
 * access.
 */
function _removeEmail() {
    email = null;
    viewModel.set("email", null);
}

/**
 * Remove the password field from the form / data to prevent unauthorised
 * access.
 */
function _removePassword() {
    password = null;
    viewModel.set("password", null);
}

/**
 * Removes data from the page.
 * @param {any} args
 */
function onNavigatingFrom(args) {
    // _removeEmail();
    _removePassword();
}
exports.onNavigatingFrom = onNavigatingFrom;