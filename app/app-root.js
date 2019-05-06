const frameModule = require("tns-core-modules/ui/frame");
const app = require("tns-core-modules/application");
const appSettings = require("application-settings");
var observable = require("data/observable");
var http = require("http");

function onLoaded(args) {
    const page = args.object;
    let viewModel = new observable.Observable();
    if (appSettings.getString("tokenAccess")) {
        viewModel.set("loggedIn", true);
    } else {
        viewModel.set("loggedIn", false);
    }
    page.bindingContext = viewModel;
    refresh();
}
exports.onLoaded = onLoaded;

function navigateToHome(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "home-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}
exports.navigateToHome = navigateToHome;


function navigateToSearch(args) {
    if (appSettings.getString("token")) {
        const sideDrawer = app.getRootView();
        const featuredFrame = frameModule.getFrameById("root");
        featuredFrame.navigate({
            moduleName: "search-page",
            clearHistory: true
        });
        sideDrawer.closeDrawer();
    }
}
exports.navigateToSearch = navigateToSearch;

function navigateToLogin(args) {
    if (!appSettings.getString("token")) {
        const sideDrawer = app.getRootView();
        const featuredFrame = frameModule.getFrameById("root");
        featuredFrame.navigate({
            moduleName: "login-page",
            clearHistory: true
        });
        sideDrawer.closeDrawer();
    }
}
exports.navigateToLogin = navigateToLogin;

exports.navigateToRecord = function(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "recordshot-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}

function navigateToProfile(args) {
    if (appSettings.getString("tokenAccess")) {
        const sideDrawer = app.getRootView();
        const featuredFrame = frameModule.getFrameById("root");
        featuredFrame.navigate({
            moduleName: "profile-page",
            context: {
                isSelf: true
            },
            clearHistory: true
        });
        sideDrawer.closeDrawer();
    }
}
exports.navigateToProfile = navigateToProfile;

function navigateToSaved(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "viewshots-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}
exports.navigateToSaved = navigateToSaved;

function navigateToClubCreate(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "clubcreate-page"
    });
    sideDrawer.closeDrawer();
}
exports.navigateToClubCreate = navigateToClubCreate;

function navigateToMyClub(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "club-page"
    });
    sideDrawer.closeDrawer();
}
exports.navigateToMyClub = navigateToMyClub;

function logout(args) {

    const tokenRefresh = appSettings.getString("tokenRefresh");
    if (tokenRefresh) {
        // do logout request
        http.request({
            url: global.serverUrl + "api/token/logout/",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({ "token": tokenRefresh })
        }).then(function (result) {
            var obj = JSON.stringify(result)
            obj = JSON.parse(obj);
            var removed = obj.content.removed;

            // could not get token / login with credentials.
            if (removed == null || obj.content.detail) {
                console.log("Login Error: " + obj.content.detail);
                let message = obj.content.detail ? obj.content.detail : "Could not log out.";
                dialogs.alert({
                    title: "Logout Error!",
                    message: message,
                    okButtonText: "Okay"
                }).then(function () { });
                return;
            }

            // give response
            console.log("Logged out: " + removed);

        }, function (error) {
            console.error(JSON.stringify(error));
            dialogs.alert({
                title: "Error!",
                message: JSON.stringify(error),
                okButtonText: "Okay"
            });
        });
    }
    
    appSettings.remove("tokenAccess");
    appSettings.remove("tokenRefresh");
    appSettings.remove("userId");
    appSettings.remove("lastRefresh");
    console.log("Logged out on client side.");
    console.log("Token = " + appSettings.getString("tokenAccess"));
    // onLoaded(args);
    navigateToHome(args);
}
exports.logout = logout;

function refresh() {
    const lastRefresh = appSettings.getNumber("lastRefresh");
    const tokenRefresh = appSettings.getString("tokenRefresh");
    const tokenAccess = appSettings.getString("tokenAccess");
    let curTime = (new Date()).getTime();
    // if (tokenRefresh && lastRefresh && curTime - lastRefresh > global.refreshTime) {
    if (tokenRefresh) {

        // check server if we're logged in.
        /*
        http.request({
            url: global.serverUrl + "api/token/verify/",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({ "token": tokenAccess })
        }).then(function (result) {
            console.log(result);
            var obj = JSON.stringify(result)
            obj = JSON.parse(obj);

            // something broke. Don't log in.
            if (!userId || obj.content.detail) {
                console.error("UserId Error: " + obj.content.detail);
                let message = obj.content.detail ? obj.content.detail : "Could not check if we are logged in.";
                dialogs.alert({
                    title: "Could not refresh!",
                    message: message,
                    okButtonText: "Okay"
                }).then(function () { });
                return;
            }

            // everything works. Save data and login.
            if (userId) {
                _doRefresh(tokenRefresh);
            }
        }, function (error) {
            console.error(JSON.stringify(error));
            dialogs.alert({
                title: "Error!",
                message: JSON.stringify(error),
                okButtonText: "Okay"
            });
        });
        */
        _doRefresh(tokenRefresh);
        
    } else {
        // logout(args);
    }
}

function _doRefresh(tokenRefresh) {
    // do request
    http.request({
        url: global.serverUrl + "api/token/refresh/",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify({ "refresh": tokenRefresh })
    }).then(function (result) {
        // console.log("Refreshing");
        // console.log(result);
        var obj = JSON.stringify(result)
        obj = JSON.parse(obj);
        var tokenAccess = obj.content.access;

        // could not get token / login with credentials.
        if (!tokenAccess || obj.content.detail) {
            console.log("Refresh Error: " + obj.content.detail);
            let message = obj.content.detail ? obj.content.detail : "Could not log refresh authorization token.";
            dialogs.alert({
                title: "Refresh Error!",
                message: message,
                okButtonText: "Okay"
            }).then(function () { });
            return;
        }

        // update access token and reset timer
        appSettings.setString("tokenAccess", tokenAccess);
        appSettings.setNumber("lastRefresh", (new Date()).getTime());
        console.log("Refreshed with token: " + tokenAccess);

    }, function (error) {
        console.error(JSON.stringify(error));
        dialogs.alert({
            title: "Error!",
            message: JSON.stringify(error),
            okButtonText: "Okay"
        });
    });
}