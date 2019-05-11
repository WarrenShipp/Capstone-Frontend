const frameModule = require("tns-core-modules/ui/frame");
const app = require("tns-core-modules/application");
var observable = require("data/observable").Observable;
const appSettings = require("application-settings");

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
