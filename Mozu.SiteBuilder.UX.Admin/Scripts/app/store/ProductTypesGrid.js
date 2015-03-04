/**
* @class Taco.store.ProductTypesGrid
* @author Thomas Phipps
* The ProductTypes Grid store. Used exclusively by the product types grid.
* Will retain the page number and search filters from previuos requests.
* Not to be used for any other purpose
*/

Ext.define('Taco.store.ProductTypesGrid', {
    requires:['Taco.model.ProductType'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.ProductType',
    pageSize: 25,
    buffered: false,
    remoteSort: true,
    remoteFilter: true,
    sorters: [{
        property: 'name',
        direction: 'ASC'
    }],
    storeManagerConfig: {
        contextLevel:'mc',
        autoLoad: true
    }
});