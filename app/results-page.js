var observable = require("data/observable");
var Sqlite = require("nativescript-sqlite");
var listViewModule = require("tns-core-modules/ui/list-view");
var Label = require("tns-core-modules/ui/label").Label;
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModel = new observable.Observable();
var frameModule = require("ui/frame");
const appSettings = require("application-settings");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");

/**
 * Loads data when page is navigated to.
 * @param {any} args
 */
function onNavigatingTo(args) {
    page = args.object;
    const container = page.getViewById("container");
    const listView = new listViewModule.ListView();
    var lists = new ObservableArray([]);

    var gotData = page.navigationContext;
    var searchType = gotData.searchType;
    console.log(searchType);
    var sendToken = appSettings.getString(global.tokenAccess);
    console.log("token is:" + sendToken);

    http.request({
        url: gotData.urlSearch,
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sendToken }
    }).then(function (result) {
        console.log(JSON.stringify(result));
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        var test = obj.content.results;
        var count = result.count;
        console.log(count);
        if (searchType == 0) { // club search
            for (i = 0; i < 10; i++) {
                lists.push({
                    id: test[i].id,
                    name: test[i].name
                });
            }
        }
        else if (searchType == 1) { // shot search
            for (i = 0; i < 10; i++) {
                console.log(test[i].player_name);
                console.log(test[i].type);
                lists.push({
                    name: test[i].player_name,
                    type: test[i].type,
                    rating: test[i].rating,
                    id: test[i].id
                });
            }
        }
        else if (searchType == 2) { // user search
            for (i = 0; i < 10; i++) {
                console.log(obj.content.results[i].id);
                lists.push({
                    id: test[i].id,
                    firstname: test[i].first_name,
                    lastname: test[i].last_name,
                    email: test[i].email
                });
            }
        }

    }, function (error) {
        console.error(JSON.stringify(error));
    });

    listView.items = lists;

    // trigger for when a shot is loaded.
    listView.on(listViewModule.ListView.itemLoadingEvent, (args) => {
        if (!args.view) {
            // Create label if it is not already created.
            args.view = new Label();
            args.view.className = "list-group-item";
        }
        if (searchType == 0) {
            (args.view).text = "ID: " + listView.items.getItem(args.index).id + " Name: " + listView.items.getItem(args.index).name;
            (args.view).textWrap = true;
        }
        else if (searchType == 1) {
            (args.view).text = "Name: " + listView.items.getItem(args.index).name + " Shot Type: " + listView.items.getItem(args.index).type + " Rating: " +
                listView.items.getItem(args.index).rating;
            (args.view).textWrap = true;
        }
        else if (searchType == 2) {
            (args.view).text = "Email: " + listView.items.getItem(args.index).email + " Name: " + listView.items.getItem(args.index).firstname + " " +
                listView.items.getItem(args.index).lastname;
            (args.view).textWrap = true;
        }

    });

    // trigger for when a shot is tapped.
    listView.on(listViewModule.ListView.itemTapEvent, (args) => {
        const tappedItemIndex = args.index;
        const tappedItemView = args.view;
        var path = listView.items.getItem(args.index).path;
        var id = listView.items.getItem(args.index).id;
        var redirect;
        var passContext;
        if (searchType == 0) {
            redirect = 'clubsingle-page';
            passContext = { path: path, id: id };
        }
        else if (searchType == 1) {
            redirect = 'view-shot-page';
            passContext = { path: path, id: id };
        }
        else if (searchType == 2) {
            redirect = 'profile-page';
            passContext = { userId: id };
        }
        var navigationOptions = {
            moduleName: redirect,
            context: passContext
        }
        container.removeChild(listView);
        frameModule.topmost().navigate(navigationOptions);
    });

    container.addChild(listView);

}
exports.onNavigatingTo = onNavigatingTo;

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
 * Navigates to a single shot to view it.
 * @param {any} args
 */
function navigateToSingle(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("view-shot-page");
}
exports.navigateToSingle = navigateToSingle;
