/**
* @class Taco.model.CmsDocument
* @author Jason Cochran
* The CmsDocument model
*/

Ext.define('Taco.model.CmsDocument', {
    extend: 'Taco.core.data.Model',

    inheritableStatics: {
        load: function (lookupInfo, config) {
          
            if (Ext.isString(lookupInfo)) {
                Ext.log({ level: 'error' }, 'need lookupInfo object not id');
            }
            config = Ext.apply({}, config);
            config = Ext.applyIf(config, {
                action: 'read',
                id: lookupInfo.id,
                listFQN: lookupInfo.listFQN

            });

            config.params = config.params || {};
            Ext.apply(config.params, lookupInfo);


            var operation = new Ext.data.Operation(config),
                scope = config.scope || this,
                callback;

            callback = function (operation) {
                var record = null,
                    success = operation.wasSuccessful();

                if (success) {
                    record = operation.getRecords()[0];
                    // If the server didn't set the id, do it here
                    if (!record.hasId()) {
                        record.setId(id);
                    }
                    Ext.callback(config.success, scope, [record, operation]);
                } else {
                    Ext.callback(config.failure, scope, [record, operation]);
                }
                Ext.callback(config.callback, scope, [record, operation, success]);
            };

            this.getProxy().read(operation, callback, this);
        },
    },
    constructor: function (data, id, raw, convertedData) {
        if (raw && raw.listFQN && raw.id) {
            raw.uniqueId = raw.listFQN + "/" + raw.id;
        }
        if (data && data.listFQN && data.id) {
            data.uniqueId = data.listFQN + "/" + data.id;
        }
        
        this.callParent(arguments);
    },


    
    fields: [
        {
            "name": "uniqueId",
            "type": "string",
            convert:function (v, r) {
                if (r.raw && r.raw.listFQN && r.raw.id) {
                    return r.raw.listFQN + "/" + r.raw.id;
                }
                if (r.datq && r.datq.listFQN && r.datq.id) {
                    return r.datq.listFQN + "/" + r.datq.id;
                }
                return v;
            }
        },
        {
            "name": "id",
            "type": "string",
            "useNull": true,
            defaultValue:null
        },
        {
            "name": "documentTypeFQN",
            "type": "string",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "name",
            "type": "string",
            "useNull": true,
            defaultValue: null
        },
     
        {
            "name": "listFQN",
            "type": "string",
            "useNull": true,
            defaultValue: null
        },
        {
            name: 'properties',
            type: 'auto',
            useNull: true,
            defaultValue: {},
            convert: function(v, record) {
                var variations = new Array();
                if(v.variations) {
                    Ext.Array.forEach(v.variations, function(variation){
                        variations.push(
                            Ext.create('Taco.model.Entity', variation)
                        );
                    });
                }
                v.variations = variations;
                return v;
            },
            serialize: function(v,record){
                if(v.variations) {
                    var rawVariations = []
                    Ext.Array.forEach(v.variations, function(variation){
                        rawVariations.push(variation.raw)
                    });
                    v.variations = rawVariations;
                }
                return v;
            }
        },
        {
            name: 'publishState',
            defaultValue: null
        },
        {
            name: 'beginDate',
            type: 'date',
            defaultValue: null
        },
        {
            name: 'endDate',
            type: 'date',
            defaultValue: null
        }
    ],
    idProperty:'uniqueId',
    set: function (k, v) {

        if (Ext.isObject(k)) {
            Ext.Object.each(k, function (kkey, kvalue) {
                this.set(kkey, kvalue);
            }, this);
        }
        if (k in this.self.realFields || !k || typeof k !== "string") {
            return this.callParent(arguments);
        }
        return this.setPropertyValue.apply(this, arguments);
    },
    get: function (k) {
        if (k in this.self.realFields || !k || typeof k !== "string") {
            return this.callParent(arguments);
        }
        return this.getPropertyValue.apply(this, arguments);
    },
    getPropertyValue: function (name, decode) {
        var properties = this.get('properties'),
            val;

        if (!properties) {
            return null;
        }

        val = properties[name];
        if (val && decode) {
            return Ext.decode(val, true) || val;
        }
        return val;
    },
    setPropertyValue: function (name, value) {
        var properties = Ext.apply({}, this.get('properties'));

        properties[name] = value;

        this.set("properties", properties);

    },

    proxy: {
        type: 'ajax',
        api: {
            create: '/admin/app/cmsdocument/create',
            read: '/admin/app/cmsdocument/read',
            update: '/admin/app/cmsdocument/update',
            destroy: '/admin/app/cmsdocument/delete',
            duplicate: '/admin/app/cmsdocument/duplicate'
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

}, function () {

    // cache of fields
    var realFields = this.realFields = {};

    this.prototype.fields.each(function (f) {
        realFields[f.name] = true;
    });

});