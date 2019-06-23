const appSettings = require("application-settings");
var observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
const fileSystemModule = require("tns-core-modules/file-system");
var dialogs = require("tns-core-modules/ui/dialogs");
var gestures = require("tns-core-modules/ui/gestures");
const HTTPRequestWrapper = require("../app/http/http-request.js");
const ListView = require("tns-core-modules/ui/list-view").ListView;
const BatsmanTypes = require("../app/helpers/type-list.js").BatsmanTypes;
const BowlerTypes = require("../app/helpers/type-list.js").BowlerTypes;

var viewModel = new observable();
var itemList;

// control vars
var loading;
var noPlayers;
var loggedIn;
var isPlayer;

// player vars
var playerImg;
var playerId;
var playerName;

// modal type
var loadType;
var loadsToFinish;

// modal types constants
const LOAD_TYPE_PLAYERS = "players";
const LOAD_TYPE_COACHES = "coaches";
const LOAD_TYPE_CLUBS = "clubs";

/**
 * Sets up binding context
 * @param {any} args
 */
function onShownModally(args) {
    var temppage = args.object;
    var itemListContainer = temppage.getViewById("itemList");
    itemList = new ObservableArray([]);
    viewModel.set("itemList", itemList);
    temppage.bindingContext = viewModel;

    // set page vars
    loading = true;
    noPlayers = false;
    loggedIn = appSettings.getString(global.tokenAccess) ? true : false;
    viewModel.set("loading", loading);
    viewModel.set("noPlayers", noPlayers);
    viewModel.set("loggedIn", loggedIn);

    // if not logged in, don't progress
    if (!loggedIn) {
        loading = false;
        viewModel.set("loading", loading);
        return;
    }

    // reset player vars
    playerId = null;
    playerImg = null;
    playerName = null;
    viewModel.set("playerImg", playerImg);

    // get player vars
    isPlayer = appSettings.getBoolean("isPlayer");
    if (isPlayer) {
        playerId = appSettings.getString("playerId");
    }
    viewModel.set("isPlayer", isPlayer);

    // check for load type
    loadType = args.context.type;
    if (loadType == LOAD_TYPE_PLAYERS) {
        viewModel.set("userType", "Player");
        _getPlayers();
    }

}
exports.onShownModally = onShownModally;

/**
 * Shuts the modal.
 * @param {any} args
 */
function onCancel(args) {
    args.object.closeModal();
}
exports.onCancel = onCancel;

/**
 * Gets the players from the server.
 */
function _getPlayers() {

    // do two queries: one for the player's data, the other for the other
    // players.
    var accessToken = appSettings.getString(global.tokenAccess);
    loadsToFinish = 2;

    // request me to get profile picture / data
    if (!isPlayer) {
        _finishLoading();
    } else {
        var requestMe = new HTTPRequestWrapper(
            global.serverUrl + global.endpointUser + "me/",
            "GET",
            "application/json",
            accessToken
        );
        requestMe.send(
            function (result) {
                var obj = JSON.stringify(result);
                obj = JSON.parse(obj);
                var user = obj.content;

                // user didn't get from database.
                if (!obj.content || !obj.content.id) {
                    console.error("Could not find myself.");
                    isLoading = false;
                    viewModel.set("isLoading", isLoading);
                    dialogs.alert({
                        title: "Error finding my user profile!",
                        message: "",
                        okButtonText: "Okay"
                    }).then(function () { });
                    return;
                }

                // add player's data
                playerImg = user.profile_pic;
                viewModel.set("playerImg", playerImg);
                playerName = user.player.user;

                // do load finish
                _finishLoading();

            },
            function (error) {
                dialogs.alert({
                    title: "Error getting your user data!",
                    message: error.message,
                    okButtonText: "Okay"
                }).then(function () { });

                // do load finish
                _finishLoading();
            }
        );
    }

    // request other players
    var requestOthers = new HTTPRequestWrapper(
        global.serverUrl + global.endpointUser,
        "GET",
        "application/json",
        accessToken
    );
    requestOthers.send(
        function (result) {
            var obj = JSON.stringify(result);
            obj = JSON.parse(obj);
            var rows = obj.content.results;

            // no data found. Set to no players!
            if (!rows || !rows.length || rows.length == 0) {
                noPlayers = true;
                viewModel.set("noPlayers", noPlayers);

                // do load finish
                _finishLoading();

                return;
            }

            // data found. Show there are players
            var thisPlayer = appSettings.getString("playerId");
            var allItems = [];
            for (var row in rows) {
                var player = rows[row].player;     // 13 should be player vars
                // continue if this user is not a player, or if their player
                // id is the same as the logged in player's
                if (!player || !rows[row].is_player || 
                    (thisPlayer && rows[row].player.id == thisPlayer)) {
                    continue;
                }
                var item = {};
                item.id = player.id;
                item.user = player.user;
                item.image = rows[row].profile_pic;
                item.batsman_type = player.batsman_type;
                item.batsman_type_name = BatsmanTypes.getNameFromValue(player.batsman_type);
                item.bowler_type = player.bowler_type;
                item.bowler_type_name = BowlerTypes.getNameFromValue(player.bowler_type);
                allItems.push(item);
            }
            itemList.push(allItems);
            noPlayers = (itemList.length == 0);
            viewModel.set("noPlayers", noPlayers);

            // do load finish
            _finishLoading();
        },
        function (error) {
            dialogs.alert({
                title: "Error getting user data!",
                message: error.message,
                okButtonText: "Okay"
            }).then(function () { });

            // do load finish
            _finishLoading();
        }
    );
}

/**
 * Closes item and passes the user id and 
 * @param {any} args
 */
function onItemTap(args) {
    // don't leave while loading of if not a player
    if (loading || !loggedIn) {
        return;
    }
    var item = itemList.getItem(args.index);
    var context = {
        id: item.id,
        user: item.user
    };
    args.object.closeModal(context);
}
exports.onItemTap = onItemTap;

/**
 * Counts down the load counter. Stops the loading icon if done.
 */
function _finishLoading() {
    loadsToFinish--;
    if (loadsToFinish <= 0) {
        loading = false;
        viewModel.set("loading", loading);
    }
}

/**
 * Closes modal after selecting me as a user.
 * @param {any} args
 */
function setMyself(args) {
    // don't leave while loading of if not a player
    if (loading || !loggedIn) {
        return;
    }
    // don't select myself if I'm not a player
    if (!isPlayer) {
        return;
    }
    var context = {
        id: playerId,
        user: playerName
    };
    args.object.closeModal(context);
}
exports.setMyself = setMyself;

/**
 * Closes modal after selecting nobody as a user.
 * @param {any} args
 */
function setNobody(args) {
    var context = {
        id: null,
        user: null
    };
    args.object.closeModal(context);
}
exports.setNobody = setNobody;