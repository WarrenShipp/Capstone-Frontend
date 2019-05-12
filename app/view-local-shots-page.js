var observable = require("data/observable");
var Sqlite = require("nativescript-sqlite");
var listViewModule = require("tns-core-modules/ui/list-view");
var Label = require("tns-core-modules/ui/label").Label;
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModel = new observable.Observable();
var frameModule = require("ui/frame");
//const dialogs = require("tns-core-modules/ui/dialogs");
var LocalSave = require("../app/localsave/localsave.js");
var db = new LocalSave();

// page vars
var itemList;

/**
 * Loads data when page is opened.
 * @param {any} args
 */
function onLoading(args) {
    page = args.object;
    console.log(args.object);
    var container = page.getViewById("listContainer");
    var itemListContainer = page.getViewById("itemList");
    console.log(container);
    var itemList = new ObservableArray([]);
    viewModel.set("itemList", itemList);
    page.bindingContext = viewModel;

    // get list of local shots and display.
    db.queryAll(
        "SELECT * FROM " + LocalSave._tableName,
        [],
        function (resultSet) {
            console.log(resultSet);
            toAdd = [];
            for (var row in resultSet) {
                var item = {
                    id: resultSet[row][0],
                    path: resultSet[row][1],
                    playerName: resultSet[row][2],
                    shotType: resultSet[row][7],
                    ratingType: resultSet[row][8],
                    date: resultSet[row][6]
                };
                console.log("RESULT: ", item);
                toAdd.push(item);
            }
            itemList.push(toAdd);
            itemListContainer.refresh();
        }
    );
    
}
exports.onLoading = onLoading;

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
 * Navigates to a shot that was tapped.
 * @param {any} args
 */
function navigateToSingle(args) {
    const button = args.object;
    const page = button.page;
    // TODO pass data so that shot info can be loaded.
    page.frame.navigate("view-shot-page");
}
exports.navigateToSingle = navigateToSingle;

function addItem(args) {
    let query = "INSERT INTO " + LocalSave._tableName + " (id, path, playername, coachname, clubname, thumbnail, shottype, ratingtype, date, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let vals = [
        Math.ceil(Math.random() * 1000000),
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
exports.addItem = addItem;

/**
 * Opens the selected Shot in view-shot-page.
 *
 * @param {any} args
 */
function onItemTap(args) {
    // TODO make sure to send over data in the following format:
    //      {
    //          type: ["view_local", "view_online"],
    //          id: String
    //      }
}
exports.onItemTap = onItemTap;