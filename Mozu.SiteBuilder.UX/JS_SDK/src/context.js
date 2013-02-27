// BEGIN CONTEXT
var ApiContext = function (conf) {
    // TODO: factor out jQuery
    utils.extend(this, conf);
};
ApiContext.prototype = {
    api: function() {
        return this._apiInstance || (this._apiInstance = new ApiInterface(this));
    },
    Store: function(conf) {
        return new ApiContext(conf);
    },
    headers: function() {
        var allvars = ['app-claims','user-claims','callchain','currency','locale','tenant','site-group','site'],
            headerObj = {};
        for (var i = 0; i < allvars.length; i++) {
            headerObj[this.headerPrefix + allvars[i]] = this[allvars[i]];
        }
        return headerObj;
    },
    currency: 'usd',
    locale: 'en-US',
    headerPrefix: 'x-vol-'
};
var immutableAccessors = {
    tenant: 'Tenant',
    site: 'Site',
    'site-group': 'SiteGroup',
    host: 'Host'
};
var setImmutableAccessor = function(propName, fnName) {
    ApiContext.prototype[fnName] = function(val) {
        if (val === undefined) return this[propName];
        var newConf = {};
        for (var k in immutableAccessors) {
            newConf[k] = this[k];
        }
        newConf[propName] = val;
        return new ApiContext(newConf);
    };
};
for (var j in immutableAccessors) {
    if (immutableAccessors.hasOwnProperty(j)) setImmutableAccessor(j, immutableAccessors[j]);
}
var mutableAccessors = {
    'app-claims': 'AppClaims',
    'user-claims': 'UserClaims',
    callchain: 'CallChain',
    currency: 'Currency',
    locale: 'Locale'
};
var setMutableAccessor = function (propName, fnName) {
    ApiContext.prototype[fnName] = function (val) {
        if (val === undefined) return this[propName];
        this[propName] = val;
        return this;
    };
};
for (var k in mutableAccessors) {
    if (mutableAccessors.hasOwnProperty(k)) setMutableAccessor(k, mutableAccessors[k]);
}
// END CONTEXT

/********/