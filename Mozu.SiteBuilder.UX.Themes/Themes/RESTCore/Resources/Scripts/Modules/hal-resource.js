define(['jquery'], function ($) {
    return {
        getLink: function (linkName) {
            return this._links && this._links[linkName];
        },
        getResources: function () {
            return this._embedded;
        }
    };
});