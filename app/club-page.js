var observable = require("data/observable");
var listViewModule = require("tns-core-modules/ui/list-view");
var Label = require("tns-core-modules/ui/label").Label;
var ObservableArray = require("data/observable-array").ObservableArray;

var frameModule = require("ui/frame");
var app = require("tns-core-modules/application");
var appSettings = require("application-settings");
var http = require("http");
var bghttp = require("nativescript-background-http");
var viewModel;


// Gets a list of all the clubs that the user is an admin of
function onNavigatingTo(args) {
    page = args.object; 
    viewModel = new observable.Observable();
    page.bindingContext = viewModel;

    // initialise list container
    const container = page.getViewById("container");
    const listView = new listViewModule.ListView();
    var lists = new ObservableArray([]);

    // retrieve saved token
    var sendToken = appSettings.getString(global.tokenAccess);
    var sendUrl = global.serverUrl + global.endpointUser + "me";

    http.request({
        url: sendUrl,
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sendToken }
    }).then(function(result) {
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        for (i=0; i<8; i++){
            console.log(obj.content.admin_clubs[i].id);
        lists.push({id: obj.content.admin_clubs[i].id, name: obj.content.admin_clubs[i].name});
        }
    }, function(error) {
        console.error(JSON.stringify(error));
    });


    listView.items = lists;

    listView.on(listViewModule.ListView.itemLoadingEvent, (args) => {
        if (!args.view) {
            // Create label if it is not already created.
            args.view = new Label();
            args.view.className = "list-group-item";
        }
        (args.view).text = "Name: " + listView.items.getItem(args.index).name;
        (args.view).textWrap = true;

    });

    listView.on(listViewModule.ListView.itemTapEvent, (args) => {
        const tappedItemIndex = args.index;
        const tappedItemView = args.view;
        var id = listView.items.getItem(args.index).id;
        var navigationOptions={
            moduleName:'clubsingle-page',
            context:{id: id}
        }
        container.removeChild(listView);
        frameModule.topmost().navigate(navigationOptions);
    });

    container.addChild(listView);
    

    
}
exports.onNavigatingTo = onNavigatingTo;

function onDrawerButtonTap(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}
exports.onDrawerButtonTap = onDrawerButtonTap;
