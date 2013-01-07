/**
* @class Taco.store.SiteShippingRegions
* @author Jason Cochran
* The SiteShippingRegions store
*/


    Ext.define('Taco.store.SiteShippingRegions', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.SiteShippingRegion',
        pageSize: 1000
    });