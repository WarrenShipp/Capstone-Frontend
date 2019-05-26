var observable = require("data/observable").Observable;
var viewModel = new observable();

var maxDate;
var minDate;
var birthDate;
var temppage;

/**
 * Sets up binding context
 * @param {any} args
 */
function onShownModally(args) {
    temppage = args.object;
    temppage.bindingContext = viewModel;

    // set vars
    maxDate = args.context.maxDate ? args.context.maxDate : (new Date()).toISOString();
    minDate = args.context.minDate ? args.context.minDate : null;
    birthDate = args.context.birthDate ? args.context.birthDate : null;
    viewModel.set("maxDate", maxDate);
    viewModel.set("minDate", minDate);
    viewModel.set("birthDate", birthDate);

}
exports.onShownModally = onShownModally;

/**
 * Selects a date and closes the modal.
 * @param {any} args
 */
function onDateSelected(args) {
    let datePicker = temppage.getViewById("birthDate");
    
    console.log(datePicker);
    var yourDate = new Date(datePicker.year, datePicker.month-1, datePicker.day);
    var offset = yourDate.getTimezoneOffset(); 
    console.log(yourDate);
    console.log(offset);
    yourDate = new Date(yourDate.getTime() - (offset*60*1000));
    yourDate = yourDate.toISOString().split('T')[0];

    // compare dates with max and min to ensure that we are within the correct
    // bounds

    // send 
    var context = {
        date: yourDate
    };
    args.object.closeModal(context);
}
exports.onDateSelected = onDateSelected;

/**
 * Employs the deselect button.
 * @param {any} args
 */
function deselect(args) {
    // send 
    var context = {
        date: birthDate
    };
    args.object.closeModal(context);

}
exports.deselect = deselect;

/**
 * Deselects a date. Same functionality as the deselect button.
 * @param {any} args
 */
function onDateDeselected(args) {
    console.log(args);
}
exports.onDateDeselected = onDateDeselected;