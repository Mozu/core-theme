/**
* @class Taco.model.CmsDocument
* @author Jason Cochran
* The CmsDocument model
*/

Ext.define('Taco.model.CmsDocument', {
    extend: 'Taco.core.data.Model',

    constructor: function (data, id, raw, convertedData) {
        if (data && !data.id && data.documentId) {
            data.id = data.collectionName + '_' + data.documentId;
        }

        this.callParent(arguments);
    },

    dictField: 'items',

    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            "name": "documentType",
            "type": "string",
            "useNull": true
        },
        {
            "name": "name",
            "type": "string",
            "useNull": true
        },
        {
            "name": "documentId",
            "type": "string",
            "useNull": true,
            defaultValue:null
        },
        {
            "name": "collectionName",
            "type": "string",
            "useNull": true
        },
        {
            "name": "items",
            "type": "auto",
            defaultValue:[],
            "useNull": true
        }
        
    ],
    set: function (k, v) {
        
        if (Ext.isObject(k)) {
            Ext.Object.each(k, function (kkey, kvalue) {
                this.set(kkey, kvalue);
            }, this);
        }
        if (k in this.self.realFields || !k || typeof k !== "string") {
            return this.callParent(arguments);
        }
        return this.setItem.apply(this, arguments);
    },
    get: function (k) {
        if (k in this.self.realFields || !k || typeof k !== "string") {
            return this.callParent(arguments);
        }
        return this.getItem.apply(this, arguments);
    },
    getItem: function (itemName, decode) {
        var items = this.get('items'),
           kvp;

        if (!items) {
            return null;
        }
        Ext.Array.forEach(items, function (item) {
            if (item.key === itemName) {
                kvp = item;
                //item.value = itemValue;
                return false;
            }
        });
        return kvp ? (decode ? Ext.decode(kvp.value) : kvp.value) : null;
    },
    setItem: function (itemName, itemValue, encode) {
        var items = (this.get('items') || []).concat([]);       
       
        
        Ext.Array.remove(items, Ext.Array.findBy(items, function (item) { return item.key === itemName; }));

        items.push({ key: itemName, value: (encode ? Ext.encode(itemValue) : itemValue) });
        

        this.set("items", items );

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

}, function() {

    // cache of fields
    var realFields = this.realFields = {};

    this.prototype.fields.each(function (f) {
        realFields[f.name] = true;
    });

});
