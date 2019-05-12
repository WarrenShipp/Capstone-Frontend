const frameModule = require("tns-core-modules/ui/frame");
const app = require("tns-core-modules/application");
const appSettings = require("application-settings");
var observable = require("data/observable");
var http = require("http");

let viewModel;

/**
 * Called when the frame is loaded. Handles access and token refreshing.
 * @param {any} args
 */
function onLoaded(args) {
    const page = args.object;
    viewModel = new observable.Observable();
    page.bindingContext = viewModel;
    resetPage();
    refresh(args);
}
exports.onLoaded = onLoaded;

/**
 * Changes sidedrawer. Allows it to update its fields.
 * 
 */
function resetPage() {
    if (appSettings.getString(global.tokenAccess)) {
        viewModel.set("loggedIn", true);
    } else {
        viewModel.set("loggedIn", false);
    }
}

/**
 * Sidedrawer navigates to home page.
 * @param {any} args
 */
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

/**
 * Sidedrawer navigates to search page. Only applicable when logged in.
 * @param {any} args
 */
function navigateToSearch(args) {
    if (appSettings.getString(global.tokenAccess)) {
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

/**
 * Sidedrawer navigates to login page. Only applicable when logged out.
 * @param {any} args
 */
function navigateToLogin(args) {
    if (!appSettings.getString(global.tokenAccess)) {
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

/**
 * Sidedrawer navigates to recording page.
 * @param {any} args
 */
function navigateToRecord(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "record-shot-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}
exports.navigateToRecord = navigateToRecord;

/**
 * Sidedrawer navigates to my profile page. Only applicable when logged in.
 * @param {any} args
 */
function navigateToProfile(args) {
    if (appSettings.getString(global.tokenAccess)) {
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

/**
 * Navigate to local saves page.
 * @param {any} args
 */
function navigateToSaved(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "view-local-shots-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}
exports.navigateToSaved = navigateToSaved;

/**
 * Navigate to Club Creation page. Only applicable when logged in.
 * @param {any} args
 */
function navigateToClubCreate(args) {
    if (appSettings.getString(global.tokenAccess)) {
        const sideDrawer = app.getRootView();
        const featuredFrame = frameModule.getFrameById("root");
        featuredFrame.navigate({
            moduleName: "clubcreate-page"
        });
        sideDrawer.closeDrawer();
    }
}
exports.navigateToClubCreate = navigateToClubCreate;

/**
 * TODO change this to go to a list of our clubs. That page should lead to a
 * specific club page.
 * @param {any} args
 */
function navigateToMyClub(args) {
    if (appSettings.getString(global.tokenAccess)) {
        const sideDrawer = app.getRootView();
        const featuredFrame = frameModule.getFrameById("root");
        featuredFrame.navigate({
            moduleName: "club-page"
        });
        sideDrawer.closeDrawer();
    }
}
exports.navigateToMyClub = navigateToMyClub;

/**
 * Handles logout functionality. Only applicable when logged in.
 * @param {any} args
 */
function logout(args) {
    const tokenRefresh = appSettings.getString(global.tokenRefresh);
    if (tokenRefresh) {
        // do logout request
        http.request({
            url: global.serverUrl + global.endpointToken + "logout/",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({ "token": tokenRefresh })
        }).then(function (result) {
            var obj = JSON.stringify(result);
            obj = JSON.parse(obj);
            var removed = obj.content.removed;

            // could not get token / login with credentials.
            if (removed == null || obj.content.detail) {
                console.log("Logout Error: " + obj.content.detail);
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

    appSettings.remove(global.tokenAccess);
    appSettings.remove(global.tokenRefresh);
    appSettings.remove(global.lastRefresh);
    console.log("Logged out on client side.");
    console.log("Token = " + appSettings.getString(global.tokenAccess));
    resetPage();
    navigateToHome(args);
}
exports.logout = logout;

/**
 * Refreshes token.
 */
function refresh(args) {
    const lastRefresh = appSettings.getNumber(global.lastRefresh);
    const tokenRefresh = appSettings.getString(global.tokenRefresh);
    const tokenAccess = appSettings.getString(global.tokenAccess);
    let curTime = (new Date()).getTime();
    // if (tokenRefresh && lastRefresh && curTime - lastRefresh > global.refreshTime) {
    if (tokenRefresh) {
        _doRefresh(tokenRefresh);
    } else {
        logout(args);
    }
}

function _doRefresh(tokenRefresh) {
    // do request
    http.request({
        url: global.serverUrl + global.endpointToken + "refresh/",
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
            message += "\n You have been logged out."
            dialogs.alert({
                title: "Refresh Error!",
                message: message,
                okButtonText: "Okay"
            }).then(function () { });
            logout(args);
            return;
        }

        // update access token and reset timer
        appSettings.setString(global.tokenAccess, tokenAccess);
        appSettings.setNumber(global.lastRefresh, (new Date()).getTime());
        console.log("Refreshed with token: " + tokenAccess);

    }, function (error) {
        console.error(JSON.stringify(error));
        dialogs.alert({
            title: "Error!",
            message: JSON.stringify(error) + "\n You have been logged out.",
            okButtonText: "Okay"
        });
        logout(args);
    });
}