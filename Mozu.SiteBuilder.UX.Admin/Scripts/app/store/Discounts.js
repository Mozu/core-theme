/**
 * @class Taco.store.Discounts
 */

    Ext.define('Taco.store.Discounts', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Discount',
        remoteFilter: true,
        pageSize: 25
    });
