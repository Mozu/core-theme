/**
 * @class Taco.store.PaymentWorkflows
 */
Ext.define('Taco.store.PaymentWorkflows', {
    requires: ['Taco.model.KeyValuePair'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.KeyValuePair',
    pageSize: 600,
    remoteSort: false,
    remoteFilter: false,

    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/discount/paymentworkflow/list'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
    },
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true,
        createOnly: true
    }
});
