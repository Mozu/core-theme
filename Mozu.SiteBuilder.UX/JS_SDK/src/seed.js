//function makeFactory(ctor) {
//    function C(args) {
//        return ctor.apply(this, args);
//    };
//    C.prototype = ctor.prototype;

//    return function () {
//        return new C(arguments);
//    };
//}


// just straight mockin'

var ApiReference = (function() {

    var baseUrl = 'http://wutevs/';

    var objectTypes = {
        product: 'products',
        category: 'categories',
        me: 'accounts/{id}/me'
    };

var ApiInterface = function (context) {

};
var basicOps = ['get','update','create','delete'];
ApiInterface.prototype = {};
for (var i = 0; i < basicOps.length; i++) {
    (function(op) {
        ApiInterface.prototype[op] = function (id, conf) {
            return this.request(op, ApiReference.getUrlFor(op, id), conf);
        };
    }(basicOps[i]));
}

var ApiContext = function (conf) {
    $.extend(this, conf);
    if (this.isQueryable()) this.api = new ApiInterface(this);
};

ApiContext.prototype = {
    Tenant: function(tenantId) {
        return new ApiContext({ tenantId: tenantId });
    },
    Site: function (siteId) {
        return new ApiContext({ siteId: siteId, tenantId: this.tenantId });
    }
    
};

var Mozu = new ApiContext();