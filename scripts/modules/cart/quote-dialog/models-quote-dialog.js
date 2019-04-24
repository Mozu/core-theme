define(["backbone", 'underscore', 'hyprlive', 'modules/api', 'modules/models-product', 'modules/models-dialog', 'modules/models-quote' ], function(Backbone, _, Hypr, Api, ProductModels, Dialog, QuoteModels) {
    var modalDialog = Dialog.extend({
        handlesMessages: true,
        relations : {
            quote: QuoteModels.Quote
        },
        initialize: function () {
            //this.set('order', new OrderModels.Order({}));
        }
    });
    return modalDialog;
});
