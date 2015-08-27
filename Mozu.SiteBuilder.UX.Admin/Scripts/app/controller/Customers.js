/**
 * @class Taco.controller.Customers
 * The Customers controller.
 */
Ext.define('Taco.controller.Customers', {
    extend: 'Taco.core.Controller',
    modelName: 'CustomerAccount',
    requires: ['Taco.model.CustomerAccount', 'Taco.view.customers.Index', 'Taco.view.customers.Edit', 'Taco.view.customers.Segments.Index'],
    views: ['customers.Index'],
    indexView: 'Taco.view.customers.Index',
    editorView: 'Taco.view.customers.Edit',
    segments:function () {
        this.createContentView('Taco.view.customers.Segments.Index');
    }
});
