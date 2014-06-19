/**
 * @class Taco.model.LocationType
 */
Ext.define('Taco.model.Entity', {
    extend: 'Taco.core.data.Model',
    idProperty: "entityId",
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
                if (rec.raw) {
                    return rec.raw.item || rec.raw.properties;
                }
            },
            persist: false
        }
    ],

    statics: {
        nullIfEmpty: function (v) {
            return v || null;
        },
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

