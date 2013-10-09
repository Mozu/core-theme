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
            if (parseInt(num) <= parseInt(this.get('PageCount'))) this.get($.extend({}, this.lastRequest, {
                startIndex: (num - 1) * parseInt(this.get('PageSize'))
            }));
        },

        firstIndex: function() {
            return this.get("StartIndex") + 1;
        },

        lastIndex: function () {
            return this.get("StartIndex") + this.get("Items").length;
        },

        hasPreviousPage: function () {
            return this.get("StartIndex") > 0;
        },

        hasNextPage: function () {
            return this.lastIndex() < this.get("TotalCount");
        },

        pageNumbers: function () {
            var nums = this.get("PageCount"), ret = [];
            for (var i = 1; i <= nums; i++) {
                ret.push(i);
            }
            return ret;
        }
    };
});
