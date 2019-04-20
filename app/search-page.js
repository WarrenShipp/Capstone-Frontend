var frameModule = require("ui/frame");
var observable = require("data/observable");
var observableArray = require("data/observable-array");
var pages = require("ui/page");
var viewModel = observable.Observable;
const Button = require("tns-core-modules/ui/button").Button;

var searchIndex = 0;

const app = require("tns-core-modules/application");

exports.clubInfo = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("club-page");
}

exports.shotInfo = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("singleshot-page");
}

exports.userInfo = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("profile-page");
}

exports.onDrawerButtonTap = function(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.search_page = function(args) {
	console.log("pageLoaded");
	var searchType = [
		"Club",
        "Shot",
        "User"
        ];

    var shotType = [
        "Straight Drive",
        "Cover Drive",
        "Square Cut",
        "Late Cut",
        "Leg Glance",
        "Hook",
        "Pull",
        "Drive through square leg",
        "On drive",
        "Off drive"
        ];    

    var ratingType = [
        "Perfect",
        "Good",
        "Off Balanced",
        "Off Position",
        "Played Late",
        "Played Early"
        ];
    
    var userType = [
        "Player",
        "Coach",
        "Admin"
        ];
        
	viewModel = new observable.Observable();
    viewModel.set("showClub", true);
    viewModel.set("showShot", false);   
    viewModel.set("showUser", false); 

    viewModel.set("showSearchClub", false);
    viewModel.set("showSearchShot", false);
    viewModel.set("showSearchUser", false);

    viewModel.set("typeIndex", 0);

    viewModel.set("searchTypes", searchType);
    viewModel.set("shotTypes", shotType);
    viewModel.set("ratingTypes", ratingType)
    viewModel.set("userTypes", userType)

    //viewModel.set("typeIndex", 0);
    //console.log(viewModel.get("searchTypes"));
    

          
    
    args.object.bindingContext = viewModel;

};

exports.submitSearch = function (args) {
        console.log(searchIndex);
        if(searchIndex == 0){
            console.log("submit search for club");
            viewModel.set("showSearchClub", true);
            viewModel.set("showSearchShot", false);
            viewModel.set("showSearchUser", false);
        }
        else if(searchIndex == 1){
            console.log("submit search for shot");
            viewModel.set("showSearchClub", false);
            viewModel.set("showSearchShot", true);
            viewModel.set("showSearchUser", false);            
        }
        else{
            console.log("submit search for user");
            viewModel.set("showSearchClub", false);
            viewModel.set("showSearchShot", false);
            viewModel.set("showSearchUser", true);
        }
        
}

//exports.toggle = function() {
//    viewModel.set("showDetails", !viewModel.get("showDetails"));
//    console.log("yes");
//}

exports.dropDownSelectedIndexChanged = function (args){
    console.log("dropDownSelectedIndexChanged");
    console.log(args.newIndex);

    if (args.newIndex == 0){
        console.log("club search");
        viewModel.set("showClub", true);
        viewModel.set("showShot", false);   
        viewModel.set("showUser", false);
        searchIndex = 0;
    }
    else if (args.newIndex == 1){
        console.log("shot search");
        viewModel.set("showShot", true);
        viewModel.set("showClub", false);
        viewModel.set("showUser", false); 
        searchIndex = 1;
    }
    else{
        console.log("user search");
        viewModel.set("showUser", true);
        viewModel.set("showClub", false);
        viewModel.set("showShot", false); 
        searchIndex = 2;
    }
};

exports.dropDownOpened = function(){
	console.log("dropDownOpened");
};