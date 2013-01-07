/**
 * @class  Taco.controller.Discounts
 * The Discounts controller.
 */
Ext.define('Taco.controller.Discounts', {
    extend: 'Taco.core.Controller',
    modelName: 'Taco.model.Discount',
    requires: ['Taco.model.Discount', 'Taco.view.discounts.Index'],
    views: ['discounts.Index'],
    
    index: function (params) {
        this.createContentView('Taco.view.discounts.Index');
    },
    filter: function (params) {

        this.createContentView('Taco.view.discounts.Index',
        {
            filters: [{
                 property: 'productcode',
                 value: params.productcode
             }]
        });
    },
    edit: function (params) {
        var id = params.id || params;

        Taco.model.Discount.load(id, {
            success: function (record, o) {
                id = record;
                Taco.app.contentView.add(Ext.create('Taco.view.discounts.Index', { editRecordId: id }));
            }
        });
    }
});
