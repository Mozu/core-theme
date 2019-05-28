/**
 * @class Taco.store.PageRuleExpressions
 */
Ext.define('Taco.store.PageRuleMeta', {
    requires: ['Taco.model.PageRuleMeta'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.PageRuleMeta',
    remoteSort: false,
    remoteFilter: false,

    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/cmsdocument/pagerule/metadata',
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        }
    },
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 't',
        clearSort: true,
        autoLoad: false,
        createOnly: true
    }
});
