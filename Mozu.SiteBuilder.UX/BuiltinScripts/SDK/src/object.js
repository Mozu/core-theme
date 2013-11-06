// BEGIN OBJECT
var ApiObject = (function () {

    var ApiObjectConstructor = function (type, data, iapi) {
        this.data = data || {};
        this.api = iapi;
        this.type = type;
    }

    ApiObjectConstructor.prototype = {
        constructor: ApiObjectConstructor,
        action: function (actionName, data) {
            return this.api.action(this, actionName, data);
        },
        getAvailableActions: function () {
            return ApiReference.getActionsFor(this.type);
        },
        prop: function (k, v) {
            switch (arguments.length) {
                case 1:
                    if (typeof k === "string") return this.data[k];
                    if (typeof k === "object") {
                        for (var hashkey in k) {
                            if (k.hasOwnProperty(hashkey)) this.prop(hashkey, k[hashkey]);
                        }
                    }
                    break;
                case 2:
                    this.data[k] = v;
            }
            return this;
        }
    };

    var setOp = function(fnName) {
        ApiObjectConstructor.prototype[fnName] = function (conf) {
            return this.action(fnName, conf);
        }
    };
    for (var i in ApiReference.basicOps) {
        if (ApiReference.basicOps.hasOwnProperty(i)) setOp(i);
    }

    utils.addEvents(ApiObjectConstructor);

    ApiObjectConstructor.types = {};

    ApiObjectConstructor.create = function (typeName, rawJSON, api) {
        var type = ApiReference.getType(typeName);
        if (!type) {
            // for forward compatibility the API should return a response,
            // even one that it doesn't understand
            return rawJSON;
        }
        if (type.collectionOf) {
            return ApiCollection.create(typeName, rawJSON, api, type.collectionOf)
        }
        return new (typeName in this.types ? this.types[typeName] : this)(typeName, rawJSON, api);
    };

    return ApiObjectConstructor;

}());
// END OBJECT

/***********/