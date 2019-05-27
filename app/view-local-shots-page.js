const app = require("tns-core-modules/application");
var observable = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModel = new observable.Observable();
var frameModule = require("ui/frame");
var LocalSave = require("../app/localsave/localsave.js");
var db = new LocalSave();
const ShotTypes = require("../app/helpers/type-list").ShotTypes;
const RatingTypes = require("../app/helpers/type-list").RatingTypes;
const VideoPlayer = require("nativescript-videoplayer").Video;

// View Types
const VIEW_LOCAL = "view_local";
const VIEW_ONLINE = "view_online";

// page vars
var itemList;
var isLoading;
var noResults;
var errorMessage;

/**
 * Loads data when page is opened.
 * @param {any} args
 */
function onLoading(args) {
    page = args.object;
    var itemListContainer = page.getViewById("itemList");

    itemList = new ObservableArray([]);
    viewModel.set("itemList", itemList);

    isLoading = true;
    viewModel.set("isLoading", isLoading);

    noResults = false;
    viewModel.set("noResults", noResults);

    errorMessage = false;
    viewModel.set("errorMessage", errorMessage);

    page.bindingContext = viewModel;

    // get list of local shots and display.
    db.queryAll(
        "SELECT * FROM " + LocalSave._tableName,
        [],
        function (resultSet) {
            console.log(resultSet);
            var noResults = true;
            for (var row in resultSet) {
                var item = {
                    id: resultSet[row][0],
                    videoPath: resultSet[row][1],
                    playerName: resultSet[row][2],
                    shotType: resultSet[row][7],
                    ratingType: resultSet[row][8],
                    date: resultSet[row][6],
                    thumbnail: (resultSet[row][5] && resultSet[row][5] >= 0)
                };
                if (item.shotType) {
                    var shotTypeName = ShotTypes.getNameFromValue(item.shotType);
                    if (shotTypeName) {
                        item.shotTypeName = shotTypeName;
                    }
                }
                if (item.ratingType) {
                    var ratingTypeName = RatingTypes.getNameFromValue(item.ratingType);
                    if (ratingTypeName) {
                        item.ratingTypeName = ratingTypeName;
                    }
                }
                itemList.push(item);
                noResults = false;

                // set video so that it shows the thumbnail
                /* NOTE: not working due to video being added after the DB call completes.

                var player = page.getViewById("thumbnailVideo-" + item.id);
                player.on(VideoPlayer.playbackReadyEvent, args => {
                    duration = player.getDuration();
                    // need to "kickstart" player, otherwise video won't show.
                    var duration = player.getDuration();
                    if (duration == 0) {
                        player.play();
                        player.pause();
                        player.seekToTime(0);
                        duration = player.getDuration();
                    }
                    player.seekToTime(resultSet[row][5]);
                });
                */
            }

            isLoading = false;
            viewModel.set("isLoading", isLoading);
            viewModel.set("noResults", noResults);
        },
        function (error) {
            isLoading = false;
            viewModel.set("isLoading", isLoading);
            errorMessage = true;
            viewModel.set("errorMessage", errorMessage);
        }
    );

    // set video and thumbnail
    
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

/**
 * Opens the selected Shot in view-shot-page.
 *
 * @param {any} args
 */
function onItemTap(args) {
    let viewOptions = {
        sourcePage: "view-local-shots-page",
        type: VIEW_LOCAL,
        id: itemList.getItem(args.index).id
    };
    let navigationOptions = {
        moduleName: 'view-shot-page',
        context: viewOptions,
        backstackVisible: true
    };
    frameModule.topmost().navigate(navigationOptions);
}
exports.onItemTap = onItemTap;