const app = require("tns-core-modules/application");
var application = require("application");
var view = require("ui/core/view");
var dialogs = require("tns-core-modules/ui/dialogs");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");
const appSettings = require("application-settings");
const modalViewModule = "modal-account-create-page";
var observable = require("data/observable");
var viewModel = new observable.Observable();

var email;
var password;

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

    let email = viewModel.get("email");
    let password = viewModel.get("password");
    viewModel.set("requestStatus", false); // disable buttons whilst requesting
    // try to log in.
    http.request({
        url: global.serverUrl + global.endpointToken,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify({ "email": email, "password": password })
    }).then(function (result) {
        // console.log("log in start");
        console.log(result);
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