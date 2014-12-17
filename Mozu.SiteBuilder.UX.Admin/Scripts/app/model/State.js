Ext.define('Taco.model.State', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Taco.core.data.cache.ProxyCache'
    ],
    fields: [
        { name: 'name', type: 'string' },
        { name: 'code', type: 'string' },
        { name: 'tags', type: 'string' }
    ],
    idProperty: 'code',
    proxy: {
        type: 'taco-ajaxCacheProxy',
        api: {
            read: '/admin/app/reference/states2/list'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        }
    }
});