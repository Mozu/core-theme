/**
* @class Taco.store.ProductTypes
* @author Thomas Phipps
* The ProductOptions store
*/

Ext.define('Taco.store.ProductTypes', {
    requires:['Taco.model.ProductType'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.ProductType',
<<<<<<< HEAD
<<<<<<< HEAD
    pageSize: 50,
=======
    pageSize: 20,
>>>>>>> initial checkin of productType refactoring
=======
    pageSize: 25,
>>>>>>> refactor of product to allow for  paging productType
    buffered: false,
    remoteSort: true,
    remoteFilter: true,
    storeManagerConfig: {
        contextLevel:'mc',
        clearFilters: true,
        clearSort: true,
        autoLoad: true
    }
});