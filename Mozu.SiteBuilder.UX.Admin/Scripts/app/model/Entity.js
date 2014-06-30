/**
 * @class Taco.model.LocationType
 */
Ext.define('Taco.model.Entity', {
    extend: 'Taco.core.data.Model',
    idProperty: "entityId",
    statics: {
        

        load: function (lookupInfo, config) {
            var params;
            config = Ext.apply({}, config);
           
            config = Ext.applyIf(config, {
                action: 'read',
                
            });
            params = config.params|| {}

            params.list = lookupInfo.list;
            params.entityType = lookupInfo.entityType;
            params.id = lookupInfo.id;

            config.params = params;


            var operation = new Ext.data.Operation(config),
                scope = config.scope || this,
                callback;

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
          list: this.get('documentListName') || this.get('entityListFullName'),
          entityType: this.get('entityType'),
          id: this.get('id')
      }  
    },
    fields: [
        {
            "name": "entityId",
            "type": "string",
            convert: function (v, rec) {
                if (rec.raw) {
                    if (rec.raw.documentListName) {
                        return 'cms_' + rec.raw.documentListName + '_' + rec.raw.id;
                    } else {
                        return 'entity_' + rec.raw.entityListName + '_' + rec.raw.id;
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
            name: 'fields',
            type: 'auto',
            convert: function (v, rec) {
                var ret, tmp;
                if (rec.raw) {
                    ret = rec.raw.item || rec.raw.properties;

                }
                //temp code till cms is reworked
                if (ret && Ext.isArray(ret)) {
                    tmp = {};
                    Ext.Array.each(ret, function (item) {
                        tmp[item.propertyType] = item.value && Ext.isString(item.value) && (item.value.indexOf('[') == 0 || item.value.indexOf('{') == 0) && Ext.decode(item.value, true) ? Ext.decode(item.value) : item.value;
                    });
                    ret = tmp;
                }
                return ret;
            },
            persist: false
        }, {
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
            name: 'entityListName',
            type: 'auto',
            useNull: true
        },
        {
            name: 'entityListFullName',
            type: 'auto',
            persist: false,
            convert: function (v, rec) {
                if (rec.raw) {
                    if (rec.raw.nameSpace) {
                        return rec.raw.nameSpace + '.' + rec.raw.entityListName;
                    } else {
                        return rec.raw.entityListName || rec.raw.name;
                    }
                }
                if (rec.data) {
                    if (rec.data.nameSpace) {
                        return rec.data.nameSpace + '.' + rec.data.entityListName;
                    } else {
                        return rec.data.entityListName||rec.data.name;
                    }
                }
                return null;
            }
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
            name: 'documentType',
            type: 'auto',
            useNull: true
        },
        {
            name: 'documentListName',
            type: 'auto',
            useNull: true
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