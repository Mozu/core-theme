/**
* @class Taco.view.stroefrontproduct.Panel
* Storefront product preview
*/

Ext.define('Taco.view.storefrontproduct.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.storefontProductPreview',
    requires: ['Taco.view.storefrontProduct.Grid'],
    stateful: false,
    config: {
        headerToolbar: true,
    }
    

});



