/**
* @class Taco.store.ProductOptions
* @author Thomas Phipps
* The ProductOptions store
*/

    Ext.define('Taco.store.ProductOptions', {
        extend: 'Taco.store.shared.BaseStore',
        model: 'Taco.model.ProductOption',
        pageSize: 20,
        //  numFromEdge: 10,
        // leadingBufferZone:40,
        // trailingBufferZone:10,
        storeId: 'productOptionsStore',
        buffered: false,
        remoteFilter: true
        // remoteSort: true
    });
