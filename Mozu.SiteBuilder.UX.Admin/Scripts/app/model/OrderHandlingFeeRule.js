/**
 * @class Taco.model.LocationType
 */
Ext.define('Taco.model.OrderHandlingFeeRule', {
    extend: 'Taco.model.HandlingFeeRule',
    

    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/shipping/HandlingRules/read',
            create: '/admin/app/shipping/HandlingRules/create',
            update: '/admin/app/shipping/HandlingRules/edit',
            destroy: '/admin/app/shipping/HandlingRules/delete'
        },
        extraParams: {
            applysTo: 'order'
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

