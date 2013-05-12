// BEGIN OBJECT
var ApiCollection = (function () {

    var ApiCollectionConstructor = function (cType, data) {
        ApiObject.apply(this, arguments);
        this.itemType = cType.collectionOf;
        if (data.Items.length > 0) this.add(data.Items, true);
    }

    ApiCollectionConstructor.prototype = utils.extend(new ApiObject(), {
        isCollection: true,
        constructor: ApiCollectionConstructor,
        add: function (newItems, /*private*/ noUpdate) {
            if (utils.getType(newItems) !== "Array") newItems = [newItems];
            Array.prototype.push.apply(this, utils.map(newItems, this.convertItem, this));
            if (!noUpdate) {
                var rawItems = this.prop("Items");
                this.prop("Items", rawItems.concat(newItems));
            }
        },
        remove: function(indexOrItem) {
            throw "Not implemented";
        },
        convertItem: function(raw) {
            return new ApiObject(this.itemType, raw, this.api);
        },
        page: function () {
            throw "Not implemented";
        }
    });

    return ApiCollectionConstructor;

}());
// END OBJECT

/***********/