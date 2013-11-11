/**
 * @class Taco.model.SiteShippingSettings
 */

Ext.define('Taco.model.SiteShippingSettings', {
    requires: ['Taco.model.CustomShippingRate', 'Taco.model.Contact'],
    extend: 'Taco.core.data.Model',
    fields: [
        // siteShippingOriginAddress is deprecated. remove when transition to omnichannel is complete
        { name: 'siteShippingOriginAddress', type: 'auto' },




        // new omnichannel fields that need to be added to the integration layer
        { name: 'shippingLocationCode', type: 'string' },
        { name: 'inStorePickupLabel', type: 'string' },
        { name: 'enableInStorePickup', type: 'boolean' },
        { name: 'storePickupLocationTypeCodes', type: 'auto', defaultValue: [] },
       
        

        // existing fields
        { name: 'activeRateProviders', type: 'auto', defaultValue: [] },
        { name: 'orderHandlingFee', type: 'float' },
        { name: 'customRate', type: 'auto' ,defaultValue: {} }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/shipping/settings/read',
            update: '/admin/app/shipping/settings/edit'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: true,
            type: 'json'
        }
    } 
});