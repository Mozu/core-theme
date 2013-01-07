/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*/

    Ext.define('Taco.store.Products', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Product',
        pageSize: 25,
        remoteSort: true,
        remoteFilter: true
    });