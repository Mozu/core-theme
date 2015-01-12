/**
 * @class Taco.model.OrderAttribute
 */
Ext.define('Taco.model.OrderAttribute', {
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
    supportsDeprecatedFields: function () {
        return true;
    },
    allowProductDataType: function () {
        return false;
    },
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/OrderAttributes/list',
            create: '/admin/app/OrderAttributes/create',
            update: '/admin/app/OrderAttributes/edit',
            destroy: '/admin/app/OrderAttributes/delete'
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