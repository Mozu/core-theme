/**
 * @class Taco.model.ActiveRateProvider
 */
Ext.define('Taco.model.ActiveRateProvider', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' }
    ],
    idProperty: 'id',
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/shipping/activerateprovider/read'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: true,
            type:'json'
        }
    }
});