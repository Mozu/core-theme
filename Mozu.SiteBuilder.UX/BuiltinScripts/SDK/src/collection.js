// BEGIN OBJECT
var ApiCollection = (function () {

    function convertItem(raw) {
        return ApiObject.create(this.itemType, raw, this.api);
    }

    var ApiCollectionConstructor = function (type, data, api, itemType) {
        var self = this;
        ApiObject.apply(this, arguments);
        this.itemType = itemType;
        if (!data) data = {};
        if (!data.Items) this.prop("Items", data.Items = []);
        if (data.Items.length > 0) this.add(data.Items, true);
        this.on('sync', function (raw) {
            if (raw && raw.Items) {
                self.removeAll();
                self.add(raw.Items);
            }
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
        getIndex: function (newIndex) {
            var index = this.currentIndex;
            if (!index && index !== 0) index = this.prop("StartIndex");
            if (!index && index !== 0) index = 0;
            return index;
        },
        setIndex: function(newIndex, req) {
            var me = this;
            var p = this.get(utils.extend(req, { startIndex: newIndex}));
            p.then(function () {
                me.currentIndex = newIndex;
            });
            return p;
        },
        firstPage: function(req) {
            var currentIndex = this.getIndex();
            if (currentIndex === 0) throw "This " + this.type + " collection is already at record 0 and has no previous page.";
            return this.setIndex(0, req);
        },
        prevPage: function (req) {
            var currentIndex = this.getIndex(),
                pageSize = this.prop("PageSize"),
                newIndex = Math.max(currentIndex - pageSize, 0);
            if (currentIndex === 0) throw "This " + this.type + " collection is already at record 0 and has no previous page.";
            return this.setIndex(newIndex, req);
        },
        nextPage: function (req) {
            var currentIndex = this.getIndex(),
                pageSize = this.prop("PageSize"),
                newIndex = currentIndex + pageSize;
            if (!(newIndex < this.prop("TotalCount"))) throw "This " + this.type + " collection is already at its last page and has no next page.";
            return this.setIndex(newIndex, req);
        },
        lastPage: function (req) {
            var totalCount = this.prop("TotalCount"),
                pageSize = this.prop("PageSize"),
                newIndex = totalCount - pageSize;
            if (newIndex <= 0) throw "This " + this.type + " collection has only one page.";
            return this.setIndex(newIndex, req);
        }
    });

    ApiCollectionConstructor.types = {};

    ApiCollectionConstructor.create = function (type, data, api, itemType) {
        return new (type in this.types ? this.types[type] : this)(type, data, api, itemType);
    }

    return ApiCollectionConstructor;

}());
// END OBJECT

/***********/