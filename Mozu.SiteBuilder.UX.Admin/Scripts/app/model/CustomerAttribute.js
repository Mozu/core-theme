/**
 * @class Taco.model.CustomerAttribute
 */
Ext.define('Taco.model.CustomerAttribute', {
    extend: 'Taco.model.Attribute',
    behaviors: {
        read: 24,
        create: 25,
        update: 26,
        destroy: 27
    },
    supportsAttributeType: function () {
        return false;
    },
    supportsDisplayGroup: function () {
        return true;
    },
    supportsValueType: function () {
        return true;
    },
    supportsIsRequired: function () {
        return false;
    },
    supportsIsVisible: function () {
        return false;
    },
    allowProductDataType: function () {
        return false;
    },
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/customerattributes/list',
           
            create: '/admin/app/customerattributes/create',
            update: '/admin/app/customerattributes/edit',
            destroy: '/admin/app/customerattributes/delete'
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