/**
 * @class Taco.model.LocationType
 */
Ext.define('Taco.model.HandlingFeeRule', {
    extend: 'Taco.core.data.Model',
    idProperty:"id",
    fields: [
        {
            "name": "id",
            "type": "string",
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        }, {
            "name": "sequence",
            "type": "int",
            useNull:true
        }, {
            "name": "shippingTargetRuleCodes",
            "type": "auto"
        }, {
            "name": "productTargetRuleCodes",
            "type": "auto"
        }, {
            "name": "serviceTypes",
            "type": "auto",
            convert: function (v, rec) {
                var ret = [];
                if (v && v.length) {

                    Ext.Array.each(v, function (item) {
                        if (item.code) {
                            ret.push(item.code);
                        } else {
                            ret.push(item);
                        }

                    });
                }
                return ret;
            },
            serialize: function (v, rec) {
                var ret = [];
                if (v && v.length) {

                    Ext.Array.each(v, function (item) {
                        if (item.code) {
                            ret.push(item);
                        } else {
                            ret.push({ code: item });
                        }

                    });
                }
                return ret;
            }
        }, {
            "name": "auditInfo",
            "type": "auto"
        }, {
            "name": "valueType",
            "type": "string",
            "defaultValue": "flatrate"
        }, {
            "name": "appliesTo",
            "type": "string"
        }, {
            "name": "value",
            "type": "float"
        }
    ],

    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/shipping/HandlingRules/read',
            create: '/admin/app/shipping/HandlingRules/create',
            update: '/admin/app/shipping/HandlingRules/edit',
            destroy: '/admin/app/shipping/HandlingRules/delete'
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

