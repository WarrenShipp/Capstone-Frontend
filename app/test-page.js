var observable = require("tns-core-modules/data/observable");
var dropdown = require("nativescript-drop-down");
var viewModel;
var dd;
var aa;
function pageLoaded(args) {
    var page = args.object;
    var items = new dropdown.ValueList();
    dd = page.getViewById("dd");

    var items1 = new dropdown.ValueList();
    aa = page.getViewById("aa");

    for (var loop = 0; loop < 200; loop++) {
        items.push({ value: "B" + loop, display: "Item " + loop });
    }

    for (var loop = 0; loop < 200; loop++) {
        items1.push({ value: "A" + loop, display: "Item " + loop });
    }

    viewModel = new observable.Observable();
    viewModel.set("items", items);
    viewModel.set("items1", items1);
    viewModel.set("hint", "My Hint");
    viewModel.set("selectedIndex", null);
    viewModel.set("selectedIndex1", null);
    viewModel.set("isEnabled", true);
    viewModel.set("cssClass", "default");
    page.bindingContext = viewModel;

}
exports.pageLoaded = pageLoaded;
// function dropDownOpened(args) {
//     console.log("Drop Down opened");
// }
// exports.dropDownOpened = dropDownOpened;
// function dropDownClosed(args) {
//     console.log("Drop Down closed");
// }
// exports.dropDownClosed = dropDownClosed;
function dropDownSelectedIndexChanged(args) {
    console.log("Drop Down selected index changed from " + args.oldIndex + " to " + args.newIndex + ". New value is '" + viewModel.get("items").getValue(args.newIndex) + "'");
}
exports.dropDownSelectedIndexChanged = dropDownSelectedIndexChanged;

function second(args) {
    console.log("Drop Down selected index changed from " + args.oldIndex + " to " + args.newIndex + ". New value is '" + viewModel.get("items1").getValue(args.newIndex) + "'");
}
exports.second = second;
// function changeStyles() {
//     viewModel.set("cssClass", "changed-styles");
// }
// exports.changeStyles = changeStyles;
// function open() {
//     dd.open();
// }
// exports.open = open;
// function close() {
//     dd.close();
// }
// exports.close = close;
// // //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZS1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaG9tZS1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0RBQXlFO0FBR3pFLGlFQUE0RjtBQUU1RixJQUFJLFNBQXFCLENBQUM7QUFDMUIsSUFBSSxFQUFZLENBQUM7QUFFakIsU0FBZ0IsVUFBVSxDQUFDLElBQWU7SUFDdEMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQW9CLENBQUM7SUFDdkMsSUFBTSxLQUFLLEdBQUcsSUFBSSxrQ0FBUyxFQUFVLENBQUM7SUFFdEMsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQVcsSUFBSSxDQUFDLENBQUM7SUFFdEMsU0FBUyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBRTdCLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzlCLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2pDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBRXJDLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO0lBRWhDLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDbkMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFJLElBQU0sRUFBRSxPQUFPLEVBQUUsVUFBUSxJQUFNLEVBQUMsQ0FBQyxDQUFDO0tBQzdEO0FBQ0wsQ0FBQztBQW5CRCxnQ0FtQkM7QUFFRCxTQUFnQixjQUFjLENBQUMsSUFBZTtJQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEMsQ0FBQztBQUZELHdDQUVDO0FBRUQsU0FBZ0IsY0FBYyxDQUFDLElBQWU7SUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFGRCx3Q0FFQztBQUVELFNBQWdCLDRCQUE0QixDQUFDLElBQW1DO0lBQzVFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkNBQXlDLElBQUksQ0FBQyxRQUFRLFlBQU8sSUFBSSxDQUFDLFFBQVEsd0JBQW1CLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBRyxDQUFDLENBQUM7QUFDaEssQ0FBQztBQUZELG9FQUVDO0FBRUQsU0FBZ0IsWUFBWTtJQUN4QixTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFGRCxvQ0FFQztBQUVELFNBQWdCLElBQUk7SUFDaEIsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2QsQ0FBQztBQUZELG9CQUVDO0FBRUQsU0FBZ0IsS0FBSztJQUNqQixFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDZixDQUFDO0FBRkQsc0JBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudERhdGEsIE9ic2VydmFibGUgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9kYXRhL29ic2VydmFibGVcIjtcbmltcG9ydCAqIGFzIHBhZ2VzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL3BhZ2VcIjtcblxuaW1wb3J0IHsgRHJvcERvd24sIFNlbGVjdGVkSW5kZXhDaGFuZ2VkRXZlbnREYXRhLCBWYWx1ZUxpc3QgfSBmcm9tIFwibmF0aXZlc2NyaXB0LWRyb3AtZG93blwiO1xuXG5sZXQgdmlld01vZGVsOiBPYnNlcnZhYmxlO1xubGV0IGRkOiBEcm9wRG93bjtcblxuZXhwb3J0IGZ1bmN0aW9uIHBhZ2VMb2FkZWQoYXJnczogRXZlbnREYXRhKSB7XG4gICAgY29uc3QgcGFnZSA9IGFyZ3Mub2JqZWN0IGFzIHBhZ2VzLlBhZ2U7XG4gICAgY29uc3QgaXRlbXMgPSBuZXcgVmFsdWVMaXN0PHN0cmluZz4oKTtcblxuICAgIGRkID0gcGFnZS5nZXRWaWV3QnlJZDxEcm9wRG93bj4oXCJkZFwiKTtcblxuICAgIHZpZXdNb2RlbCA9IG5ldyBPYnNlcnZhYmxlKCk7XG5cbiAgICB2aWV3TW9kZWwuc2V0KFwiaXRlbXNcIiwgaXRlbXMpO1xuICAgIHZpZXdNb2RlbC5zZXQoXCJoaW50XCIsIFwiTXkgSGludFwiKTtcbiAgICB2aWV3TW9kZWwuc2V0KFwic2VsZWN0ZWRJbmRleFwiLCBudWxsKTsgICAgXG4gICAgdmlld01vZGVsLnNldChcImlzRW5hYmxlZFwiLCB0cnVlKTsgICAgXG4gICAgdmlld01vZGVsLnNldChcImNzc0NsYXNzXCIsIFwiZGVmYXVsdFwiKTtcblxuICAgIHBhZ2UuYmluZGluZ0NvbnRleHQgPSB2aWV3TW9kZWw7XG5cbiAgICBmb3IgKGxldCBsb29wID0gMDsgbG9vcCA8IDIwMDsgbG9vcCsrKSB7XG4gICAgICAgIGl0ZW1zLnB1c2goeyB2YWx1ZTogYEkke2xvb3B9YCwgZGlzcGxheTogYEl0ZW0gJHtsb29wfWB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcm9wRG93bk9wZW5lZChhcmdzOiBFdmVudERhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkRyb3AgRG93biBvcGVuZWRcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcm9wRG93bkNsb3NlZChhcmdzOiBFdmVudERhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkRyb3AgRG93biBjbG9zZWRcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcm9wRG93blNlbGVjdGVkSW5kZXhDaGFuZ2VkKGFyZ3M6IFNlbGVjdGVkSW5kZXhDaGFuZ2VkRXZlbnREYXRhKSB7XG4gICAgY29uc29sZS5sb2coYERyb3AgRG93biBzZWxlY3RlZCBpbmRleCBjaGFuZ2VkIGZyb20gJHthcmdzLm9sZEluZGV4fSB0byAke2FyZ3MubmV3SW5kZXh9LiBOZXcgdmFsdWUgaXMgJyR7dmlld01vZGVsLmdldChcIml0ZW1zXCIpLmdldFZhbHVlKGFyZ3MubmV3SW5kZXgpfSdgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoYW5nZVN0eWxlcygpIHtcbiAgICB2aWV3TW9kZWwuc2V0KFwiY3NzQ2xhc3NcIiwgXCJjaGFuZ2VkLXN0eWxlc1wiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgZGQub3BlbigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgZGQuY2xvc2UoKTtcbn0iXX0=

// // >> require-list-view
// const listViewModule = require("tns-core-modules/ui/list-view");
// // << require-list-view
// const dialogs = require("tns-core-modules/ui/dialogs");
// const Label = require("tns-core-modules/ui/label").Label;
// const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;

// const listViewArray = new ObservableArray([
//     { title: "The Da Vinci Code" },
//     { title: "Harry Potter and the Chamber of Secrets" },
//     { title: "The Alchemist" },
//     { title: "The Godfather" },
//     { title: "Goodnight Moon" },
//     { title: "The Hobbit" }
// ]);

// function onNavigatingTo(args) {
//     const page = args.object;
//     // >> create-list-view-code
//     const container = page.getViewById("container");

//     const listView = new listViewModule.ListView();
//     listView.className = "list-group";
//     listView.items = listViewArray;
//     // The itemLoading event is used to create the UI for each item that is shown in the ListView.
//     listView.on(listViewModule.ListView.itemLoadingEvent, (args) => {
//         if (!args.view) {
//             // Create label if it is not already created.
//             args.view = new Label();
//             args.view.className = "list-group-item";
//         }
//         (args.view).text = listViewArray.getItem(args.index).title;

//     });
//     listView.on(listViewModule.ListView.itemTapEvent, (args) => {
//         const tappedItemIndex = args.index;
//         const tappedItemView = args.view;
//         dialogs.alert(`Index: ${tappedItemIndex} View: ${tappedItemView}`)
//             .then(() => {
//                 console.log("Dialog closed!");
//             });
//     });

//     container.addChild(listView);
//     // << create-list-view-code
// }
// exports.onNavigatingTo = onNavigatingTo;