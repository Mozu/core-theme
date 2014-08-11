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
            num = parseInt(num);
            if (num != this.currentPage() && num <= parseInt(this.get('pageCount'))) return this.apiGet($.extend({}, this.lastRequest, {
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

        currentPage: function() {
            return Math.ceil(this.firstIndex() / (this.get('pageSize') || 1));
        },

        middlePageNumbers: function () {
            var current = this.currentPage(),
                ret = [],
                pageCount = this.get('pageCount'),
                i = Math.max(Math.min(current - 2, pageCount - 4), 2),
                last = Math.min(i + 5, pageCount);
            while (i < last) ret.push(i++);
            return ret;
        }
    };
});
