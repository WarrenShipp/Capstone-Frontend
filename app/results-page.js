var observable = require("data/observable");
var Sqlite = require("nativescript-sqlite");
var listViewModule = require("tns-core-modules/ui/list-view");
var Label = require("tns-core-modules/ui/label").Label;
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModel = new observable.Observable();
var frameModule = require("ui/frame");
//const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("application-settings");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");



function onNavigatingTo(args) {
    console.log("lol");
    page = args.object; 
    const container = page.getViewById("container");
    const listView = new listViewModule.ListView();
    var lists = new ObservableArray([]);


    var gotData=page.navigationContext;
    console.log("this is it");
    var sendToken = appSettings.getString("token");
    console.log(sendToken);
    http.request({
        url: gotData.urlSearch,
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": sendToken }
    }).then(function(result) {
        console.log(JSON.stringify(result));
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        var test = obj.content.results;
        for (i=0; i<10; i++){
        console.log(obj.content.results[i].id);
        console.log(obj.content.results[i].video_set[0].file);
        lists.push({id: test[i].player_name, path: test[i].video_set[0].file});
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
        (args.view).text = "ID: " + listView.items.getItem(args.index).id + " Shot: " + listView.items.getItem(args.index).shottype + " Rating: " + 
        listView.items.getItem(args.index).rating;
        (args.view).textWrap = true;

    });

    listView.on(listViewModule.ListView.itemTapEvent, (args) => {
        const tappedItemIndex = args.index;
        const tappedItemView = args.view;
        var path = listView.items.getItem(args.index).path;
        var id = listView.items.getItem(args.index).id;
        var navigationOptions={
            moduleName:'viewlocal-page',
            context:{path: path, id: id}
        }
        container.removeChild(listView);
        frameModule.topmost().navigate(navigationOptions);

        // dialogs.alert(`Index: ${tappedItemIndex} View: ${tappedItemView}` + listView.items.getItem(args.index).name)
        //     .then(() => {
        //         console.log("Dialog closed!");
        //     });
    });

    container.addChild(listView);
    

    
}
exports.onNavigatingTo = onNavigatingTo;

exports.onDrawerButtonTap = function(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.navigateToSingle = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("singleshot-page");
}

