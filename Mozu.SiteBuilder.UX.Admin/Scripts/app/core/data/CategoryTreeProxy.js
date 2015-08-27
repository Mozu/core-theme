/**
* @author Jason Cochran
* The Mozu Ajax Proxy is a subclass of {@link Ext.data.proxy.Ajax}, preconfigured for the most common Mozu settings, and enhanced with logging and caching.
* 
*/


Ext.define('Taco.core.data.CategoryTreeProxy', {
    extend: 'Taco.core.data.AjaxProxy',
   
    alias: 'proxy.categorytree',
    getData: function () {
        var mcId = Taco.app.context.getMasterCatalogId() || -1;

        return (this.data || {})[mcId];
    },
    setData: function (data) {
        var mcId = Taco.app.context.getMasterCatalogId() || -1;
        this.data = this.data || {};
        
        this.data[mcId] = data;
    },

    read: function (operation, callback, scope) {

        var cbw, me = this,
            data = me.getData(),
            filters = operation.filters;

        // if (operation.id) {
        //     operation.bypassCache = true;
        //     this.data = null;
        //     return this.callParent(arguments);
        // }
        
        

        if (!data || operation.bypassCache) {

            cbw = function (op, success, response) {

                if (op.wasSuccessful()) {
                    me.setData(op.response.responseText);
                }
                operation.filters = filters;
                if (callback) {
                    
                    me.read2(op.response && op.response.responseText ? op.response.responseText : null, operation, callback, scope);
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
                var response = undefined,
                    hasSiteIdFilter = false,
                    jsonData,
                    siteId = operation.siteId,
                    catalogId = operation.catalogId;
                if (data) {
                    
                    response = {
                        responseText: data
                    };
                    Ext.each(operation.filters, function (filter) {
                        if (filter.property == 'siteId') {
                            siteId = filter.value;
                        }
                        if (filter.property == 'catalogId') {
                            catalogId = filter.value;
                        }
                    });
                    if (!siteId) {
                        siteId = Taco.app.context.getSiteId();
                    }
                    if (!catalogId) {
                        if (siteId) {
                            catalogId = Taco.app.context.findSite(siteId).getCatalogId();
                        } 
                    }
                    if (!catalogId) {
                        catalogId = Taco.app.context.getCatalogId();
                    }
                    if (catalogId) {
                        jsonData = Ext.JSON.decode(data);
                        jsonData.items = Ext.Array.filter(jsonData.items, function (item) { return item.catalogId == catalogId; });
                        jsonData.items.sort(function (a, b) { return (a.sequence || 99) - (b.sequence || 99); });
                        response.responseText = Ext.JSON.encode(jsonData);

                    }
                }
                me.processResponse(true, operation, request, response, callback, scope);
        };

        Ext.Function.defer(function() {
            fn();
        }, 10, this);
    },
    getTreeData: function () {
        var me = this,
            ids = me.getIds(),
            length = ids.length,
            records = [],
            recordHash = {},
            root = [],
            i = 0,
            Model = me.model,
            idProperty = Model.prototype.idProperty,
            rootLength, record, parent, parentId, children, id;

        for (; i < length; i++) {
            id = ids[i];

            record = me.getRecord(id);

            records.push(record);

            recordHash[id] = record;
            if (!record.parentId) {

                root.push(record);
            }
        }

        rootLength = root.length;


        Ext.Array.sort(records, me.sortByParentId);


        for (i = rootLength; i < length; i++) {
            record = records[i];
            parentId = record.parentId;
            if (!parent || parent[idProperty] !== parentId) {

                parent = recordHash[parentId];
                parent.children = children = [];
            }


            children.push(record);
        }

        for (i = length; i--;) {
            record = records[i];
            if (!record.children && !record.leaf) {

                record.loaded = true;
            }
        }


        for (i = rootLength; i--;) {
            record = root[i];
            root[i] = new Model(record, record[idProperty], record);
        }

        return root;
    }

}
);
