// BEGIN OBJECT
var ApiCollection = (function () {

    function convertItem(raw) {
        return new ApiReference.tryCreateApiObject(this.itemType, raw, this.api);
    }

    var ApiCollectionConstructor = function (type, data, api, itemType) {
        var self = this;
        ApiObject.apply(this, arguments);
        this.itemType = itemType;
        if (data.Items.length > 0) this.add(data.Items, true);
        this.on('sync', function (raw) {
            self.removeAll();
            self.add(raw.Items);
        });
    }

    ApiCollectionConstructor.prototype = utils.extend(new ApiObject(), {
        isCollection: true,
        constructor: ApiCollectionConstructor,
        add: function (newItems, /*private*/ noUpdate) {
            if (utils.getType(newItems) !== "Array") newItems = [newItems];
            Array.prototype.push.apply(this, utils.map(newItems, convertItem, this));
            if (!noUpdate) {
                var rawItems = this.prop("Items");
                this.prop("Items", rawItems.concat(newItems));
            }
        },
        remove: function(indexOrItem) {

        },
        replace: function(newItems, noUpdate) {
            Array.prototype.splice.call(this, 0, this.length, utils.map(newItems, convertItem, this));
            if (!noUpdate) {
                this.prop("Items", rawItems);
            }
        },
        removeAll: function(noUpdate) {
            Array.prototype.splice.call(this, 0, this.length);
            if (!noUpdate) {
                this.prop("Items", []);
            }
        },
        firstPage: function() {
            var currentIndex = this.prop("StartIndex");
            if (currentIndex === 0) throw "This " + this.type + " collection is already at record 0 and has no previous page.";
            return this.get({ startIndex: 0 });
        },
        index: function(newIndex) {
            return this.get({ startIndex: newIndex});
        },
        prevPage: function () {
            var currentIndex = this.prop("StartIndex"),
                pageSize = this.prop("PageSize"),
                newIndex = currentIndex - pageSize + 1;
            if (currentIndex === 0) throw "This " + this.type + " collection is already at record 0 and has no previous page.";
            return this.index(newIndex);
        },
        nextPage: function () {
            var currentIndex = this.prop("StartIndex"),
                pageSize = this.prop("PageSize"),
                newIndex = currentIndex + pageSize - 1;
            if (!(newIndex < this.prop("TotalCount"))) throw "This " + this.type + " collection is already at its last page and has no next page.";
            return this.index(newIndex);
        },
        lastPage: function () {
            var totalCount = this.prop("TotalCount"),
                pageSize = this.prop("PageSize"),
                newIndex = totalCount - pageSize;
            if (newIndex <= 0) throw "This " + this.type + " collection has only one page.";
            return this.index(newIndex);
        }
    });

    return ApiCollectionConstructor;

}());
// END OBJECT

/***********/