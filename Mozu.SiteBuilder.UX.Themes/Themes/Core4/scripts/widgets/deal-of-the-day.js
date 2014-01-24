define(
    ['modules/jquery-mozu', 'shim!vendor/underscore>_', "modules/api", "modules/backbone-mozu", "modules/models-product"],
    function ($, _, api, Backbone, ProductModels) {
        $(function () {
            $('[data-mz-deal-of-the-day]').each(function (index, deal) {
                deal = $(deal);

                var config = deal.data('mzDealOfTheDay'),
                    products, DealView;

                products = api.get('search', {
                    // filter: 'discountId eq ' + config.discount
                });

                DealView = Backbone.MozuView.extend({
                    templateName: 'modules/product/product-list',
                    getRenderContext: function () {
                        var context = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);

                        context.dealOfTheDay = config;

                        return context;
                    }
                });

                products.then(function (collection) {
                    var productCollection = new ProductModels.ProductCollection(collection.data),
                        dealView;

                    dealView = new DealView({
                        model: productCollection,
                        el: deal
                    });

                    dealView.render();
                });
            });
        });
    }
);