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
        },{
            "name": "serviceTypes",
            "type": "auto"
        },{
            "name": "auditInfo",
            "type": "auto"
        }, {
            "name": "valueType",
            "type": "string"
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

