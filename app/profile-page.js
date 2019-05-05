const app = require("tns-core-modules/application");
var application = require("application");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");
var observable = require("data/observable");
var viewModel = new observable.Observable();
const appSettings = require("application-settings");
var dialogs = require("tns-core-modules/ui/dialogs");

// consts
const profileUrl = "user/";

// profile
var userId;
var isSelf;

// title
var pageTitle;

// player args
var imgSrc;
var name;
var email;
var phone

// club args
var inClub;
var clubList = [];

// player info args
var batsmanType;
var bowlerType;

function navigatingTo(args) {
    page = args.object;

    userId = page.navigationContext.userId;
    isSelf = page.navigationContext.userId ? page.navigationContext.userId : false;

    if (isSelf && !userId) {
        userId = appSettings.getString("userId");
    }
    var sendToken = appSettings.getString("token");

    // set self-profile-related stuff
    if (isSelf) {
        pageTitle = "My Profile";
    } else {
        pageTitle = "User Profile";
    }
    viewModel.set("profileTitle", pageTitle);
    viewModel.set("canEdit", isSelf);
    page.bindingContext = viewModel;
    
    http.request({
        url: global.serverUrl + profileUrl + userId,
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": sendToken }
    }).then(function (result) {
        console.log(JSON.stringify(result));
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);

        // if nothing found, show error dialog
        /*
        if (!obj.) {
            let message = "Insert error message.";
            dialogs.alert({
                title: "Error!",
                message: message,
                okButtonText: "Okay"
            }).then(function () { });
            return;
        }
        */

        // go through vars and add to profile page
        name = obj.first_name + " " + obj.last_name;
        if (isSelf) {
            email = obj.email;
            phone = obj.phone;
        }
        imgSrc = obj.profile_pic;

    }, function (error) {
        console.error(JSON.stringify(error));
    });
}
exports.navigatingTo = navigatingTo;

function onLoaded(args) {

}
exports.onLoaded = onLoaded;

exports.onDrawerButtonTap = function(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.Requested = function(args) {
    const button = args.object;
    const page = button.page;
    if(page.android) {
        var Toast = android.widget.Toast;
        Toast.makeText(application.android.context, "Requested", Toast.LENGTH_SHORT).show();
    }


}