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

var ApiContext = function (conf) {
    $.extend(this, conf);
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