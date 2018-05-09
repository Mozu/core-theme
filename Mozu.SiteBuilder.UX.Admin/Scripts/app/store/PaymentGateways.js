/**
 * @class Taco.store.PaymentGateways
 */


Ext.define('Taco.store.PaymentGateways', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.PaymentGateway',
    pageSize: 25,
    remoteSort: true,
    remoteFilter: false,
    autoLoad: true
});
