/**
 * @class Taco.model.LocationAttribute
 */
Ext.define('Taco.model.LocationAttribute', {
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
        return false;
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
    supportsSearchOptions: function () {
        return false;
    },
    supportsSearchInStorefront: function () {
        return false;
    },
    supportsSearchDisplayType: function () {
        return false;
    },
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/LocationAttributes/list',
            create: '/admin/app/LocationAttributes/create',
            update: '/admin/app/LocationAttributes/edit',
            destroy: '/admin/app/LocationAttributes/delete'
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