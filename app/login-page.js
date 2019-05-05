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

    http.request({
        url: "https://cricket.kinross.co/login/",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify({ "username": email.text, "password": password.text })
    }).then(function (result) {
        // console.log(result);
        var obj = JSON.stringify(result)
        obj = JSON.parse(obj);
        // console.log(obj);
        var token = obj.content.token;
        // console.log(token);
        if (!token || obj.content.non_field_errors) {
            console.error(obj.content.non_field_errors);
            let message = obj.content.non_field_errors[0] ? obj.content.non_field_errors[0] : "Could not log in.";
            dialogs.alert({
                title: "Could not login!",
                message: message,
                okButtonText: "Okay"
            }).then(function () { });
            return;
        }
        if (token) {
            appSettings.setString("token", token);
            console.log("token = " + appSettings.getString("token"));
            // TODO return userid
            // var userId = obj.content.user_id;
            // appSettings.setString("userId", userId);
            // console.log("userId = " + appSettings.getString("userId"));
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