/**
 * @class Taco.controller.Tax
 * The Tax settings controller.
 */
Ext.define('Taco.controller.Tax', {
    extend: 'Taco.core.Controller',
    modelName: 'Taco.model.TaxRate',
    requires: ['Taco.view.tax.Index'],
    views: ['tax.Index'],

    index: function (params) {
        this.createContentView('Taco.view.tax.Index');
        
    }
});
