/**
 * @class Taco.model.Contact
 */
Ext.define('Taco.model.Country', {
    extend: 'Taco.core.data.Model',
    requires:['Taco.core.data.cache.ProxyCache'],
    fields: ['name', 'code'],
    idProperty: 'code',
    proxy: {
        type: 'taco-ajaxCacheProxy',
        api: {
            read: '/admin/app/Reference/countries/list'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
    }
});