/**
 * @class Taco.store.RuntimeProductSearch
 * The RuntimeProductSearch store
 */

Ext.define('Taco.store.RuntimeProductSearch', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.RuntimeProductSearchResult',
    autoLoad: false,
    proxy: {
        type: 'ajax',
        url: '/admin/app/phoneorder/product/search',
        reader: {
            type: 'json',
            root: 'users'
        }
    }
});