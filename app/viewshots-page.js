var observable = require("data/observable");
var Sqlite = require("nativescript-sqlite");
var ListView = require("ui/list-view").ListView;
var Label = require("tns-core-modules/ui/label").Label;
var GridLayout = require("tns-core-modules/ui/layouts/grid-layout").GridLayout;
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModel = new observable.Observable();
var frameModule = require("ui/frame");
var application = require("application");

// the fixer
var itemsLoaded = [];

function onNavigatingTo(args) {
    // console.log("lol");
    page = args.object; 
    const container = page.getViewById("container");
    var listView = page.getViewById("container-listview");
    var lists = new ObservableArray([]);
    viewModel.lists = lists;
    page.bindingContext = viewModel;
    listView.items = lists;

    (new Sqlite("my.db")).then(db => {
        db.all("SELECT id, path, name, shottype, ratingtype FROM testb").then(rows => {
            for (var row in rows) {
                console.log(rows[row]);
                viewModel.lists.push({
                    id: rows[row][0],
                    path: rows[row][1],
                    name: rows[row][2],
                    shottype: rows[row][3],
                    ratingtype: rows[row][4]
                });
                // console.log("Item pushed: " + row);
            }
        }, error => {
            console.log("SELECT ERROR", error);
            });
        listView.refresh();
    });

    /*
    listView.on(ListView.itemLoadingEvent, (args) => {
        // do nothing if item already exists.
        if (itemsLoaded.includes(listView.items.getItem(args.index).id)) {
            console.log("Item already loaded: " + listView.items.getItem(args.index).id);
            return;
        }
        
        if (!args.view) {
            // Create label if it is not already created.
            args.view = new GridLayout();
            args.view.className = "list-group-item";
            args.view.rows = "*,*";
            args.view.columns = "*,2*,2*"
        } else {
            console.log("view already created:");
            console.log(args.view);
        }
        console.log(listView.items.getItem(args.index));

        // create inner labels

        // image (TODO: add image to label)
        var labelImage = new Label();
        labelImage.row = "0";
        labelImage.rowSpan = "2";
        labelImage.col = "0";
        labelImage.text = "Thumb!";
        args.view.addChild(labelImage);

        // name
        var labelName = new Label();
        labelName.row = "0";
        labelName.col = "1";
        labelName.text = listView.items.getItem(args.index).name;
        args.view.addChild(labelName);

        // shot type
        var labelShotType = new Label();
        labelShotType.row = "1";
        labelShotType.col = "1";
        labelShotType.text = "Shot: " + listView.items.getItem(args.index).shottype;
        args.view.addChild(labelShotType);

        // rating type
        var labelRatingType = new Label();
        labelRatingType.row = "1";
        labelRatingType.col = "2";
        labelRatingType.text = "Rating: " + listView.items.getItem(args.index).ratingtype;
        args.view.addChild(labelRatingType);

        console.log(
            "created item: id=" + listView.items.getItem(args.index).id +
            " name=" + listView.items.getItem(args.index).name +
            " shottype=" + listView.items.getItem(args.index).shottype +
            " ratingtype=" + listView.items.getItem(args.index).ratingtype +
            " path=" + listView.items.getItem(args.index).path
        );

        itemsLoaded.push(listView.items.getItem(args.index).id);

    });
    */

    listView.on(ListView.itemTapEvent, (args) => {
        const tappedItemIndex = args.index;
        const tappedItemView = args.view;
        let viewType = "view_local";
        let viewTypeOptions = {
            shotId: listView.items.getItem(args.index).id
        };
        console.log(listView.items.getItem(args.index));
        let sourcePage = "viewshots-page";
        var navigationOptions={
            moduleName:'viewshotsingle-page',
            context: {
                sourcePage: sourcePage,
                viewType: viewType,
                viewTypeOptions: viewTypeOptions
            }
        }
        // container.removeChild(listView);
        frameModule.topmost().navigate(navigationOptions);
        
    });
    
}
exports.onNavigatingTo = onNavigatingTo;

exports.onDrawerButtonTap = function(args) {
    const sideDrawer = application.getRootView();
    sideDrawer.showDrawer();
}

exports.navigateToSingle = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("singleshot-page");
}