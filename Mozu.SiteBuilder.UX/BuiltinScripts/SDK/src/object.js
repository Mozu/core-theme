// BEGIN OBJECT
var ApiObject = (function () {

    var ApiObjectConstructor = function (type, data, iapi) {
        this.data = data;
        this.api = iapi;
        this.type = type;
        if (ApiPostProcessors[this.type]) {
            this.postProcessor = ApiPostProcessors[this.type];
            this.postProcessor(this);
        }
    }

    ApiObjectConstructor.prototype = {
        constructor: ApiObjectConstructor,
        action: function (actionName, data) {
            var me = this;
            var requestConf = ApiReference.getRequestConfig(actionName, this.type, data || this.data, this.api.context, this);
            me.fire('action', actionName, data, requestConf);
            me.api.fire('action', me, actionName, data, requestConf);
            return this.api.request(ApiReference.basicOps[actionName], requestConf, data).then(function (rawJSON) {
                if (requestConf.returnType) {
                    var returnObj = ApiReference.tryCreateApiObject(requestConf.returnType, rawJSON, me.api);
                    me.fire('spawn', returnObj);
                    me.api.fire('spawn', returnObj, me);
                    return returnObj;
                } else {
                    utils.extend(me.data, rawJSON);
                    if (me.postProcessor) me.postProcessor(me);
                    delete me.unsynced;
                    me.fire('sync', rawJSON, me.data);
                    me.api.fire('sync', me, rawJSON, me.data);
                    return me;
                }
            }, function (errorJSON) {
                me.fire('error', errorJSON);
                me.api.fire('error', errorJSON, me);
                throw errorJSON;
            });
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

    return ApiObjectConstructor;

}());
// END OBJECT

/***********/