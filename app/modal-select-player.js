const appSettings = require("application-settings");
var observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
const fileSystemModule = require("tns-core-modules/file-system");
var dialogs = require("tns-core-modules/ui/dialogs");
const HTTPRequestWrapper = require("../app/http/http-request.js");
const ListView = require("tns-core-modules/ui/list-view").ListView;
const BatsmanTypes = require("../app/helpers/type-list.js").BatsmanTypes;
const BowlerTypes = require("../app/helpers/type-list.js").BowlerTypes;

var viewModel = new observable();
var itemList;

var loading;
var noPlayers;
var loadType;

const LOAD_TYPE_PLAYERS = "players";
const LOAD_TYPE_COACHES = "coaches";
const LOAD_TYPE_CLUBS = "clubs";

/**
 * Use this to determine if we are running this as a test or if we are trying
 * using the functionality as is.
 */
const IS_TEST_SELECTION = true;
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
    viewModel.set("loading", loading);
    viewModel.set("noPlayers", noPlayers);

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
    
    var accessToken = appSettings.getString("tokenAccess");
    if (!accessToken) {
        // TODO throw error
        return;
    }
    var request = new HTTPRequestWrapper(
        global.endpointServer + global.endpointUser,
        "GET",
        "application/json",
        accessToken
    );
    request.setContent({
        not_player: false
    });
    request.send(function (result) {
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        var rows = obj.content;
        console.log(rows);
        if (!rows || rows.length == 0) {
            // TODO throw error
            console.error("No rows");
            return;
        }
        for (var row in rows) {
            console.log(rows[row]);
            var player = rows[row][13];     // 13 should be player vars
            console.log(player);
            // TODO also get image
        }
    });
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
    viewModel.set("loading", loading);
    viewModel.set("noPlayers", noPlayers);

}

/**
 * Closes item and passes the user id and 
 * @param {any} args
 */
function onItemTap(args) {
    console.log("close");
    var item = itemList.getItem(args.index);
    var context = {
        id: item.id,
        user: item.user
    };
    console.log(context);
    args.object.closeModal(context);
}
exports.onItemTap = onItemTap;