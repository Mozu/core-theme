/**
* @class Taco.store.ProductOptionValues
* @author Thomas Phipps
* The ProductOptionValues store
*/

    Ext.define('Taco.store.ProductOptionValues', {
        extend: 'Taco.store.shared.BaseStore',
        model: 'Taco.model.ProductOptionValue',
        pageSize: 20,
        //  numFromEdge: 10,
        // leadingBufferZone:40,
        // trailingBufferZone:10,
        storeId: 'productOptionValuesStore',
        buffered: false,
        remoteFilter: true
        // remoteSort: true
    });
