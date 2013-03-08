// BEGIN CONTEXT
var ApiContext = function (conf) {
    // TODO: factor out jQuery
    utils.extend(this, conf);
},
    mutableAccessors = ['app-claims', 'user-claims', 'callchain', 'currency', 'locale', 'bypass-cache'],
    immutableAccessors = ['tenant', 'site', 'site-group'],
    immutableAccessorLength = immutableAccessors.length,
    allAccessors = mutableAccessors.concat(immutableAccessors),
    allAccessorsLength = allAccessors.length,
    j;

var setImmutableAccessor = function(propName) {
    ApiContext.prototype[utils.camelCase(propName, true)] = function(val) {
        if (val === undefined) return this[propName];
        var newConf = {};
        for (var k = 0; k < immutableAccessorLength; k++) {
            newConf[immutableAccessors[k]] = this[immutableAccessors[k]];
        }
        newConf[propName] = val;
        return new ApiContext(newConf);
    };
};

var setMutableAccessor = function (propName) {
    ApiContext.prototype[utils.camelCase(propName, true)] = function (val) {
        if (val === undefined) return this[propName];
        this[propName] = val;
        return this;
    };
};

ApiContext.prototype = {
    api: function() {
        return this._apiInstance || (this._apiInstance = new ApiInterface(this));
    },
    Store: function(conf) {
        return new ApiContext(conf);
    },
    asObject: function (prefix) {
        var headerObj = {};
        prefix = prefix || '';
        for (var i = 0; i < allAccessorsLength; i++) {
            headerObj[prefix + allAccessors[i]] = this[allAccessors[i]];
        }
        return headerObj;
    },
    currency: 'usd',
    locale: 'en-US'
};

for (j = 0; j < immutableAccessors.length; j++) setImmutableAccessor(immutableAccessors[j]);
for (j = 0; j < mutableAccessors.length; j++) setMutableAccessor(mutableAccessors[j]);

// END CONTEXT

/********/