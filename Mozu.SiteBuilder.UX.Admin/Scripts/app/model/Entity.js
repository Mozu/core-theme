/**
 * @class Taco.model.LocationType
 */
Ext.define('Taco.model.Entity', {
    extend: 'Taco.core.data.Model',
    idProperty: "entityId",
    statics: {
        

        load: function (lookupInfo, config) {
            var params,
                operation;
            config = Ext.apply({}, config);
           
            config = Ext.applyIf(config, {
                action: 'read',
                
            });
            params = config.params || {}

            params.list = lookupInfo.list || lookupInfo.listFQN
            params.entityType = lookupInfo.entityType || 'cms'
            params.id = lookupInfo.id;

            config.params = params;


            operation = new Ext.data.Operation(config);
            scope = config.scope || this;
              

            callback = function (operation) {
                var record = null,
                    success = operation.wasSuccessful();

                if (success) {
                    record = operation.getRecords()[0];
                    // If the server didn't set the id, do it here
                    //if (!record.hasId()) {
                    //    record.setId(id);
                    //}
                    Ext.callback(config.success, scope, [record, operation]);
                } else {
                    Ext.callback(config.failure, scope, [record, operation]);
                }
                Ext.callback(config.callback, scope, [record, operation, success]);
            };

            this.getProxy().read(operation, callback, this);
        }
    },
    getLoadParams:function () {
      return {
          list: this.get('listFQN') ,
          entityType: this.get('entityType'),
          id: this.get('id')
      }  
    },
    getFields:function () {
        return this.get('properties') || this.get('item') || {};
    },
    fields: [
        {
            "name": "entityId",
            "type": "string",
            convert: function (v, rec) {
                if (rec && rec.raw) {
                    if (rec.raw.listFQN) {
                        return 'cms_' + rec.raw.listFQN + '_' + rec.raw.id;
                    } else {
                        return rec.raw.entityType + '_' + rec.raw.listFQN + '_' + rec.raw.id;
                    }
                }
            },
            persist: false

        }, {
            "name": "auditInfo",
            "type": "auto",
            persist: false
        },
        {
            name: 'tenantId',
            type: 'auto',
            useNull: true
        },
        {
            name: 'entityType',
            type: 'string'
        },
        {
            name: 'siteId',
            type: 'auto',
            useNull: true
        },
        {
            name: 'nameSpace',
            type: 'auto',
            useNull: true
        },
   
        {
            name: 'listFQN',
            type: 'auto',
            persist: false
        },
        {
            name: 'item',
            type: 'auto',
            useNull: true
        },
        {
            name: 'createDate',
            type: 'auto',
            useNull: true,
            persist: false
        },
        {
            name: 'updateDate',
            type: 'auto',
            useNull: true,
            persist: false
        },
        {
            name: 'name',
            type: 'auto',
            useNull: true
        },
        {
            name: 'extension',
            type: 'auto',
            useNull: true
        },
        {
            name: 'documentTypeFQN',
            type: 'auto',
            useNull: true
        },
        {
            name: 'listFQN',
            type: 'auto',
            useNull: true,
            defaultValue:null,
            //convert:function (v, r) {
            //    if (!v) {
            //        if (r.data && r.data.listFQN) {
            //            return r.data.listFQN;
            //        }
            //        if (r.raw && r.raw.listFQN) {
            //            return r.raw.listFQN;
            //        }
            //        if (r.data && r.data.listFQN) {
            //            return r.data.listFQN;
            //        }
            //        if (r.data && r.raw.listFQN) {
            //            return r.raw.listFQN;
            //        }
            //    }
                
            //},
            //serialize:function (v, r) {
            //    if (r.data && r.data.listFQN) {
            //            return r.data.listFQN;
            //        }
            //        if (r.raw && r.raw.listFQN) {
            //            return r.raw.listFQN;
            //        }
            //        if (r.data && r.data.listFQN) {
            //            return r.data.listFQN;
            //        }
            //        if (r.data && r.raw.listFQN) {
            //            return r.raw.listFQN;
            //        }

            //}

        },
        {
            name: 'publishState',
            type: 'auto',
            useNull: true
        },
        {
            name: 'properties',
            type: 'auto',
            useNull: true
        }
    ],
    publish:function () {
        var pubRecord = Ext.create('Taco.model.CmsDocumentDraft',
            this.data);
        pubRecord.set('isPublished', true);
      

        pubRecord.save.apply(pubRecord, arguments);
    },

   
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/entities/read',
            create: '/admin/app/entities/create',
            update: '/admin/app/entities/update',
            destroy: '/admin/app/entities/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});