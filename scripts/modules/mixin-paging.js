/**
 * A "mixin" object that can add sorting and paging functionality (page size,
 * start index, total count, nextPage, etc) to Backbone.MozuModels.
 */
define(['jquery'], function($) {
    return {

        _isPaged: true,

        previousPage: function () {
            try {
                return this.apiModel.prevPage(this.lastRequest);
            } catch (e) { }
        },

        nextPage: function () {
            try {
                return this.apiModel.nextPage(this.lastRequest);
            } catch (e) { }
        },

        setPage: function (num) {
            if (parseInt(num) <= parseInt(this.get('pageCount'))) return this.apiGet($.extend({}, this.lastRequest, {
                startIndex: (num - 1) * parseInt(this.get('pageSize'))
            }));
        },

        changePageSize: function() {
            return this.apiGet($.extend({}, this.lastRequest, { pageSize: this.get('pageSize') }));
        },

        firstIndex: function() {
            return this.get("startIndex") + 1;
        },

        lastIndex: function () {
            return this.get("startIndex") + this.get("items").length;
        },

        hasPreviousPage: function () {
            return this.get("startIndex") > 0;
        },

        hasNextPage: function () {
            return this.lastIndex() < this.get("totalCount");
        },

        pageNumbers: function () {
            var nums = this.get("pageCount"), ret = [];
            for (var i = 1; i <= nums; i++) {
                ret.push(i);
            }
            return ret;
        }
    };
});
