/**
 * @class Taco.controller.Customers
 * The Customers controller.
 */
Ext.define('Taco.controller.Customers', {
    extend: 'Taco.core.Controller',
    modelName: 'Taco.model.CustomerAccount',
    requires: ['Taco.model.CustomerAccount', 'Taco.view.customers.Index', 'Taco.view.customers.Edit'],
    views: ['customers.Index'],

    index: function (params) {
        this.createContentView('Taco.view.customers.Index');
    },
    edit: function (params) {
        var id = params.id || params;

        Taco.model.CustomerAccount.load(id, {
            success: function (record, o) {
                id = record;
                Taco.app.contentView.add(Ext.create('Taco.view.customers.Index', { recordId: id }));
            }
        });
    }
});
