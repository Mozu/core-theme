/**
 * @class Taco.controller.Localization
 */
Ext.define('Taco.controller.Localization', {
    extend: 'Taco.core.Controller',
    views: [
        'Taco.view.settings.localization.Attributes',
        'Taco.view.settings.localization.AttributeValues',
        'Taco.view.settings.localization.ProductProperties',
        'Taco.view.settings.localization.ProductExtras',
        'Taco.view.settings.localization.ProductVariants'
    ],
    stores: ['Taco.store.LocalizedAttributes', 'Taco.store.LocalizedAttributeValues', 'Taco.store.LocalizedProductProperties',
        'Taco.store.LocalizedProductExtras', 'Taco.store.LocalizedProductVariants'],
    listView: null,

    attributes: function () {
        this.createContentView('Taco.view.settings.localization.Attributes');
    },

    attributeValues: function () {
        this.createContentView('Taco.view.settings.localization.AttributeValues');
    },
    productProperties: function () {
        this.createContentView('Taco.view.settings.localization.ProductProperties');
    },
    productExtras: function () {
        this.createContentView('Taco.view.settings.localization.ProductExtras');
    },
    productVariants: function () {
        this.createContentView('Taco.view.settings.localization.ProductVariants');
    }
    
});