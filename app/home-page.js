const frameModule = require("tns-core-modules/ui/frame");
const app = require("tns-core-modules/application");
var observable = require("data/observable").Observable;
const appSettings = require("application-settings");
const HTTPRequestWrapper = require("../app/http/http-request.js");

// check if logged in
var loggedIn;

/**
 * Sets up page
 * @param {any} args
 */
function onNavigatingTo(args) {
    var viewModel = new observable();
    page = args.object;
    viewModel.set("imageUri", "folder.png");
    loggedIn = appSettings.getString(global.tokenAccess) ? true : false;
    viewModel.set("loggedIn", loggedIn);
    if (loggedIn) {
        var request = new HTTPRequestWrapper(
            global.serverUrl + global.endpointUser + "me/",
            "GET",
            HTTPRequestWrapper.defaultContentType,
            appSettings.getString(global.tokenAccess)
        );
        request.send(function (result) {
            console.log(result);
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

        });
    }

    page.bindingContext = viewModel;
}
exports.onNavigatingTo = onNavigatingTo;

/**
 * Handles functions when page is loaded.
 * @param {any} args
 */
function onLoading(args) {
    loggedIn = appSettings.getString(global.tokenAccess) ? true : false;
}

/**
 * Navigates to search page when button is pressed. Only applicable when logged
 * in.
 * @param {any} args
 */
function navigateToSearch(args) {
    if (loggedIn) {
        const button = args.object;
        const page = button.page;
        page.frame.navigate("search-page");
    }
}
exports.navigateToSearch = navigateToSearch;

/**
 * Navigates to recording page.
 * @param {any} args
 */
function navigateToRecord(args) {
    var navigationOptions = {
        moduleName: 'record-shot-page',
        backstackVisible: false
    };
    page.frame.navigate(navigationOptions);
}
exports.navigateToRecord = navigateToRecord;

/**
 * Opens Sidedrawer.
 * @param {any} args
 */
function onDrawerButtonTap(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}
exports.onDrawerButtonTap = onDrawerButtonTap;

/**
 * Navigates to my profile page. Only applicable when logged in.
 * @param {any} args
 */
function navigateToProfile(args) {
    if (loggedIn) {
        const button = args.object;
        const page = button.page;
        var navigationOptions = {
            moduleName: 'profile-page',
            context: {
                isSelf: true
            }
        };
        page.frame.navigate(navigationOptions);
    }
}
exports.navigateToProfile = navigateToProfile;

/**
 * Navigates to locally saved shots.
 * @param {any} args
 */
function navigateToShots(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("view-local-shots-page");
}
exports.navigateToShots = navigateToShots;
