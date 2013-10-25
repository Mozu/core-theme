define(['shim!vendor/jquery.tools.dateinput[jquery=jQuery]>jQuery', 'shim!vendor/underscore>_'], function ($, _) {
    // localize using mozu labels

    var months = 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
        days = 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(',');

    var locale = (navigator.language || "en-US").split('-').shift();
    $.tools.dateinput.conf.locale = locale;
    $.tools.dateinput.localize(locale, {
        months: _.map(months, function (month) {
            return require.mozuLabel(month.toLowerCase());
        }).join(','),
        shortMonths: _.map(months, function (month) {
            return require.mozuLabel('short' + month);
        }).join(','),
        days: _.map(days, function (day) {
            return require.mozuLabel(day.toLowerCase());
        }).join(','),
        shortDays: _.map(days, function (day) {
            return require.mozuLabel('short' + day);
        }).join(',')
    });
});
