/**
 * Extends the third-party jQuery Tools DatePicker widget to be internationalized
 * with Mozu text labels.
 */

define(['shim!vendor/jquery.tools.dateinput[jquery=jQuery]>jQuery', 'shim!vendor/underscore>_', 'hyprlive'], function ($, _, Hypr) {
    var months = 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
        days = 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(',');

    var locale = (navigator.language || "en-US").split('-').shift();
    $.tools.dateinput.conf.locale = locale;
    $.tools.dateinput.localize(locale, {
        months: _.map(months, function (month) {
            return Hypr.getLabel(month.toLowerCase());
        }).join(','),
        shortMonths: _.map(months, function (month) {
            return Hypr.getLabel('short' + month);
        }).join(','),
        days: _.map(days, function (day) {
            return Hypr.getLabel(day.toLowerCase());
        }).join(','),
        shortDays: _.map(days, function (day) {
            return Hypr.getLabel('short' + day);
        }).join(',')
    });
});
