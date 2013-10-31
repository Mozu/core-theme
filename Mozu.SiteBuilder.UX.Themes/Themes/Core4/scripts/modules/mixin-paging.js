define(['jquery'], function($) {
    return {

        _isPaged: true,

        previousPage: function () {
            try {
                this.apiModel.prevPage(this.lastRequest);
            } catch (e) { }
        },

        nextPage: function () {
            try {
                this.apiModel.nextPage(this.lastRequest);
            } catch (e) { }
        },

        setPage: function (num) {
            if (parseInt(num) <= parseInt(this.get('pageCount'))) this.get($.extend({}, this.lastRequest, {
                startIndex: (num - 1) * parseInt(this.get('pageSize'))
            }));
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
