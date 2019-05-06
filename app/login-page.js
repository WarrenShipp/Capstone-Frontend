const app = require("tns-core-modules/application");
var application = require("application");
var view = require("ui/core/view");
var dialogs = require("tns-core-modules/ui/dialogs");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");
const appSettings = require("application-settings");

exports.onDrawerButtonTap = function(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.login = function(args) {
    const button = args.object;
    const page = button.page;
    
    let email = page.getViewById("email");
    let password = page.getViewById("password");

    // try to log in.
    http.request({
        url: global.serverUrl + "api/token/",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify({ "email": email.text, "password": password.text })
    }).then(function (result) {
        // console.log("log in start");
        console.log(result);
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
            return;
        } else {

            // Set tokens
            appSettings.setString("tokenAccess", tokenAccess);
            appSettings.setString("tokenRefresh", tokenRefresh);
            appSettings.setNumber("lastRefresh", (new Date()).getTime());
            console.log("access = " + appSettings.getString("tokenAccess"));
            console.log("refresh = " + appSettings.getString("tokenRefresh"));
            console.log("lastRefresh = " + appSettings.getNumber("lastRefresh"));
            page.frame.navigate({
                moduleName: "home-page",
                clearHistory: true
            });
        
        }
    }, function (error) {
        console.error(JSON.stringify(error));
        dialogs.alert({
            title: "Error!",
            message: JSON.stringify(error),
            okButtonText: "Okay"
        });
    });

}

exports.createAccount = function(args) {
    const button = args.object;
    const page = button.page;
    if(page.android) {
        var Toast = android.widget.Toast;
        Toast.makeText(application.android.context, "Account Created", Toast.LENGTH_SHORT).show();
    }

    page.frame.navigate("home-page");

}
