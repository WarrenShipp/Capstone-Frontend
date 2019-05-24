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

var loadType;
var loadsToFinish;

const LOAD_TYPE_PLAYERS = "players";
const LOAD_TYPE_COACHES = "coaches";
const LOAD_TYPE_CLUBS = "clubs";

/**
 * Use this to determine if we are running this as a test or if we are trying
 * using the functionality as is.
 */
const IS_TEST_SELECTION = false;
const TEST_PLAYERS = [
    {
        "id": "253925e5-67ec-4f3a-996e-60eed8704daa",
        "user": "RMIT Coach and Player",
        "batsman_type": 2,
        "bowler_type": 3
    },
    {
        "id": "e0b59404-0779-4f02-976e-509683e47540",
        "user": "Melbourne Player",
        "batsman_type": 1,
        "bowler_type": 6
    },
    {
        "id": "151274bc-1702-4d5d-9d9e-561e8e839f24",
        "user": "Deakin Player",
        "batsman_type": 1,
        "bowler_type": 4
    },
    {
        "id": "8fc0c0b8-e17f-42c6-8783-725e772f0156",
        "user": "Monash Player",
        "batsman_type": 1,
        "bowler_type": 5
    }
];

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

function _getPlayers() {
    if (IS_TEST_SELECTION) {
        _getTestPlayers();
        return;
    }

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
    /*
    requestOthers.setContent({
        not_player: false
    });
    */
    requestOthers.send(
        function (result) {
            // console.log(result);
            var obj = JSON.stringify(result);
            obj = JSON.parse(obj);
            var rows = obj.content.results;
            // console.log(rows);
            // console.log(rows.length);

            // no data found. Set to no players!
            if (!rows || !rows.length || rows.length == 0) {
                noPlayers = true;
                viewModel.set("noPlayers", noPlayers);

                // do load finish
                _finishLoading();

                return;
            }

            // data found. Show there are players
            var allItems = [];
            for (var row in rows) {
                var player = rows[row].player;     // 13 should be player vars
                if (!player || !rows[row].is_player) {
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
            noPlayers = false;
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

function _getTestPlayers() {
    // get items and display
    var allItems = [];
    for (var i in TEST_PLAYERS) {
        var item = {};
        item.id = TEST_PLAYERS[i]["id"];
        item.user = TEST_PLAYERS[i]["user"];
        item.batsman_type = TEST_PLAYERS[i]["batsman_type"];
        item.batsman_type_name = BatsmanTypes.getNameFromValue(TEST_PLAYERS[i]["batsman_type"]);
        item.bowler_type = TEST_PLAYERS[i]["bowler_type"];
        item.bowler_type_name = BowlerTypes.getNameFromValue(TEST_PLAYERS[i]["bowler_type"]);
        allItems.push(item);
    }
    itemList.push(allItems);

    // remove loading, etc
    loading = false;
    noPlayers = false;
    isPlayer = false;
    viewModel.set("loading", loading);
    viewModel.set("noPlayers", noPlayers);
    viewModel.set("isPlayer", isPlayer);

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
    console.log("close");
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
    console.log("close");
    var context = {
        id: playerId,
        user: playerName
    };
    args.object.closeModal(context);
}
exports.setMyself = setMyself;