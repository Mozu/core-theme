/**
* @author Jason Cochran
* The Mozu Ajax Proxy is a subclass of {@link Ext.data.proxy.Ajax}, preconfigured for the most common Mozu settings, and enhanced with logging and caching.
* 
*/


Ext.define('Taco.core.data.CategoryTreeProxy', {
    extend: 'Taco.core.data.AjaxProxy',
   
    alias: 'proxy.categorytree',
    getData: function () {
        return this.data;
    },
    setData: function (data) {
        this.data = data;
    },

    read: function (operation, callback, scope) {

        var cbw, me = this,
            data = me.getData(),
            filters = operation.filters;

        if (!data || operation.bypassCache) {

            cbw = function (op, success, response) {

                if (op.wasSuccessful()) {
                    me.setData(op.response.responseText);
                }
                operation.filters = filters;
                if (callback) {
                    me.read2(op.response.responseText, operation, callback, scope);
                }

            };
            delete operation.filters;

            me.doRequest(operation, cbw, this);
        } else {
            this.read2(data,operation, callback, scope);
        }

    },
    doRequest:function() {
        this.setData(null);
        this.callParent(arguments);
    },
    
    read2: function (data,operation, callback, scope) {

        var me = this,
            request = this.buildRequest(operation),
            fn = function () {
                var response = {
                    responseText: data
                }, jsonData,siteId;
                
                Ext.each(operation.filters, function(filter) {
                    if (filter.property == 'siteId') {
                        siteId = filter.value;
                    }
                });
                if (siteId) {
                    jsonData = Ext.JSON.decode(data);
                    jsonData.items = Ext.Array.filter(jsonData.items, function (item) { return item.siteId == siteId });
                    response.responseText = Ext.JSON.encode(jsonData);

                }
                me.processResponse(true, operation, request, response, callback, scope);
        };

        Ext.Function.defer(function() {
            fn();
        }, 10, this);
        ;
    }

}
);
