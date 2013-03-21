/**
 * @class  Taco.controller.Discounts
 * The Discounts controller.
 */
Ext.define('Taco.controller.Discounts', {
    extend: 'Taco.core.Controller',
    models: ['Taco.model.Discount'],
    stores: ['Taco.store.Discounts'],
    views: ['discount.Index'],
    modelName: 'Discount',
    
    contextPlaceholders: {
        t: function () {
            return Ext.create('Taco.core.ux.content.Container', {
                header: {
                    title: "choose a site collection"
                },

                body: {
                    layout: 'auto',
                    items: [{
                        html: 'placeholder for choose site collection interstitial '
                    }]
                }
            });
        }
    }
});

//    index: function (params) {
//        this.createContentView('Taco.view.discounts.Index');
//    },
//    filter: function (params) {
//
//        this.createContentView('Taco.view.discounts.Index',
//        {
//            filters: [{
//                 property: 'productcode',
//                 value: params.productcode
//             }]
//        });
//    },
//    edit: function (params) {
//        var id = params.id || params;
//
//        Taco.model.Discount.load(id, {
//            success: function (record, o) {
//                id = record;
//                Taco.app.contentView.add(Ext.create('Taco.view.discounts.Index', { editRecordId: id }));
//            }
//        });
//    }
//});
