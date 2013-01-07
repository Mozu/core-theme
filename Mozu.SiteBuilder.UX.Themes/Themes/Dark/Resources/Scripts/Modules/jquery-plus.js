define(['jquery'], function($) {
    $.postJson = function (options) {
        var settings = $.extend({
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8'
        }, options);

        if (typeof settings.data !== 'string') {
            settings.data = JSON.stringify(settings.data);
        }

        return $.ajax(settings);
    };

    return $;
});