var observable = require("data/observable");
var listViewModule = require("tns-core-modules/ui/list-view");
var Label = require("tns-core-modules/ui/label").Label;
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModel = new observable.Observable();
var frameModule = require("ui/frame");
const appSettings = require("application-settings");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");
const ActivityIndicator = require("tns-core-modules/ui/activity-indicator").ActivityIndicator;
const app = require("tns-core-modules/application");
const HTTPRequestWrapper = require("../app/http/http-request.js");
const RatingTypes = require("../app/helpers/type-list").RatingTypes;
const ShotTypes = require("../app/helpers/type-list").ShotTypes;

// consts
const VIEW_ONLINE = "view_online";

// use this to ensure results persist between page opening. When these values
// are different from the provided context, then we redo the query
var navContext;
var nextPage;
var lastTime;

// the container for all the shots
var lists;
var listView;

// page vars
var searchType;
var isLoading;
var canLoadMore;
var noMoreLoading;
var isLoadingMore;
var noResults;
var errorMessage;

// all possible types of search results.
const searchTypeList = [
    "Club",
    "Shot",
    "User"
];

/**
 * Loads data when page is navigated to.
 * @param {any} args
 */
function onNavigatingTo(args) {
    page = args.object;
    page.bindingContext = viewModel;

    var gotData = page.navigationContext;
    var searchTypeGet = gotData.searchType;

    // set page
    searchType = searchTypeGet;
    viewModel.set("searchType", searchTypeList[searchType]);

    var sendToken = appSettings.getString(global.tokenAccess);

    isLoading = true;
    viewModel.set("isLoading", isLoading);

    // check loading
    if (!_checkSearchLoaded(gotData)) {
        // if not loaded, then do loading.
        _loadResults(gotData.urlSearch);
    }

}

exports.onNavigatingTo = onNavigatingTo;

/**
 * Only allows the app to download data if the context does not exist.
 * @param {any} context
 */
function _checkSearchLoaded(context) {
    if (
        navContext &&
        context.urlSearch == navContext.urlSearch &&
        context.searchType == navContext.searchType &&
        context.searchTime == lastTime
    ) {
        isLoading = false;
        viewModel.set("isLoading", isLoading);
        return true;
    }
    navContext = context;
    lastTime = context.searchTime;
    return false;
}

function _loadResults(searchUrl) {

    // set list
    lists = new ObservableArray([]);
    viewModel.set("itemList", lists);
    listView = page.getViewById("itemList");

    // set page vars
    canLoadMore = false;
    noMoreLoading = false;
    isLoadingMore = false;
    noResults = false;
    errorMessage = false;
    viewModel.set("canLoadMore", canLoadMore);
    viewModel.set("noMoreLoading", noMoreLoading);
    viewModel.set("isLoadingMore", isLoadingMore);
    viewModel.set("noResults", noResults);
    viewModel.set("errorMessage", errorMessage);

    // do request
    var sendToken = appSettings.getString(global.tokenAccess);
    var request = new HTTPRequestWrapper(searchUrl, "GET", "application/json", sendToken);
    request.send(
        // callback
        function (result) {
            // parse results
            var obj = JSON.stringify(result);
            obj = JSON.parse(obj);
            var resultList = obj.content.results;

            // load items
            _loadItems(resultList);

            // check if another page can be loaded and queue
            if (obj.content.next) {
                nextPage = obj.content.next;
                canLoadMore = true;
                viewModel.set("canLoadMore", canLoadMore);
            }

            // stop loading
            isLoading = false;
            viewModel.set("isLoading", isLoading);
        },
        // error
        function () {
            // stop loading
            isLoading = false;
            viewModel.set("isLoading", isLoading);
            errorMessage = true;
            viewModel.set("errorMessage", errorMessage);
        }
    );
}

/**
 * Loads more search results from the server.
 * @param {any} args
 */
function onLoadMoreData(args) {

    // set page vars
    canLoadMore = false;
    isLoadingMore = true;
    viewModel.set("canLoadMore", canLoadMore);
    viewModel.set("isLoadingMore", isLoadingMore);

    // do request
    var sendToken = appSettings.getString(global.tokenAccess);
    var request = new HTTPRequestWrapper(nextPage, "GET", "application/json", sendToken);
    request.send(
        // callback
        function (result) {
            // parse results
            var obj = JSON.stringify(result);
            obj = JSON.parse(obj);
            var resultList = obj.content.results;

            // load items
            _loadItems(resultList);

            // check if another page can be loaded and queue
            if (obj.content.next) {
                nextPage = obj.content.next;
                canLoadMore = true;
                viewModel.set("canLoadMore", canLoadMore);
            } else {
                noMoreLoading = true;
                viewModel.set("noMoreLoading", noMoreLoading);
            }

            // stop loading
            isLoadingMore = false;
            viewModel.set("isLoadingMore", isLoadingMore);
        },
        // error
        function () {
            // stop loading
            isLoadingMore = false;
            viewModel.set("isLoadingMore", isLoadingMore);
            errorMessage = true;
            viewModel.set("errorMessage", errorMessage);
        }
    );
}
exports.onLoadMoreData = onLoadMoreData;

/**
 * Shows the results on the page.
 * @param {any} resultList
 */
function _loadItems(resultList) {
    // push club results
    if (searchType == 0) {
        for (var i in resultList) {
            lists.push({
                id: resultList[i].id,
                name: resultList[i].name,
                image : resultList[i].logo
            });
        }
    }
    // push shot results
    else if (searchType == 1) {
        for (var i in resultList) {
            // if (video exists) ? video : null
            var image = (
                resultList[i].video_set &&
                resultList[i].video_set[0] &&
                resultList[i].video_set[0].thumbnail &&
                resultList[i].video_set[0].thumbnail.file
            ) ? resultList[i].video_set[0].thumbnail.file : null;
            if (image == null) {
                image = '~/images/picture-2.png';
            }
            lists.push({
                name: resultList[i].player_name,
                type: resultList[i].type,
                rating: resultList[i].rating,
                shotTypeName: ShotTypes.getNameFromValue(resultList[i].type),
                ratingTypeName: RatingTypes.getNameFromValue(resultList[i].rating),
                id: resultList[i].id,
                image: image
            });
        }
    }
    // push user results
    else if (searchType == 2) {
        for (var i in resultList) {
            lists.push({
                id: resultList[i].id,
                name: resultList[i].first_name + " " + resultList[i].last_name,
                image: resultList[i].profile_pic
            });
        }
    }
}

/**
 * Goes to the appropriate page, based upon what was clicked.
 * @param {any} args
 */
function onItemTap(args) {
    const tappedItemIndex = args.index;
    var path = lists.getItem(args.index).path;
    var id = lists.getItem(args.index).id;
    var redirect;
    var passContext;

    // go to club page
    if (searchType == 0) {
        redirect = 'clubsingle-page';
        passContext = {path: path, id: id};
    }
    // go to shot page
    else if (searchType == 1) {
        redirect = 'view-shot-page';
        passContext = {
            sourcePage: "view-local-shots-page",
            type: VIEW_ONLINE,
            id: id
        };
    }
    // go to profile page
    else if (searchType == 2) {
        redirect = 'profile-page';
        passContext = {userId: id};
    }
    var navigationOptions = {
        moduleName: redirect,
        context: passContext
    }
    frameModule.topmost().navigate(navigationOptions);
}
exports.onItemTap = onItemTap;

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
