/**
* @class Taco.store.ShippingClasses
* @author Jason Cochran
* The Shipping classes store
*/


    Ext.define('Taco.store.ShippingClasses', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.ShippingClass',
        pageSize: 1000
    });
