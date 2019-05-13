const app = require("tns-core-modules/application");
var application = require("application");
var view = require("ui/core/view");
var dialogs = require("tns-core-modules/ui/dialogs");
var observable = require("data/observable");
var viewModel = new observable.Observable();
var LocalSave = require("../app/localsave/localsave.js");
var db = new LocalSave();

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
 * Rebuilds the local database.
 * @param {any} args
 */
function rebuildDatabase(args) {
    db.rebuild();
}
exports.rebuildDatabase = rebuildDatabase;

/**
 * Adds a test shot to the local DB
 * @param {any} args
 */
function addTestShot(args) {
    let query = "INSERT INTO " + LocalSave._tableName + " (path, playername, coachname, clubname, thumbnail, shottype, ratingtype, date, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let vals = [
        // Math.ceil(Math.random() * 1000000),
        null,
        "Alex",
        "Alex",
        "Alex",
        1000,
        2,
        3,
        new Date(),
        2000
    ];
    db.queryExec(query, vals, function (id) {
        console.log("Added row: " + id);
    });
}
exports.addTestShot = addTestShot;