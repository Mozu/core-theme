/**
* @class Taco.store.ProductTypes
* @author Thomas Phipps
* The ProductOptions store
*/

Ext.define('Taco.store.ProductTypes', {
        extend: 'Taco.store.shared.BaseStore',
        model: 'Taco.model.ProductType',
        pageSize: 20,
        //  numFromEdge: 10,
        // leadingBufferZone:40,
        // trailingBufferZone:10,
        storeId: 'ProductTypeStore',
        buffered: false,
        remoteFilter: true
        // remoteSort: true
    });

