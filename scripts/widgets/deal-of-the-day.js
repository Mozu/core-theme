define(
    ['modules/jquery-mozu', 'shim!vendor/underscore>_', "modules/api", "modules/backbone-mozu", "modules/models-product"],
    function ($, _, api, Backbone, ProductModels) {
        $(function () {
            $('[data-mz-deal-of-the-day]').each(function (index, deal) {
                deal = $(deal);

                var config = deal.data('mzDealOfTheDay'),
                    products, DealView;

                products = api.get('search', {
                    filter: 'discountId eq ' + config.discountId,
                    pageSize: (config.displayStyle === 'product' ? 1 : 20)
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

                    if (productCollection.attributes.totalCount === 0) {
                        throw "Deal of the Day: there are no products to show for the selected discount.";
                    } else {
                        dealView = new DealView({
                            model: productCollection,
                            el: deal
                        });

                        dealView.render();
                    }
                });
            });
        });
    }
);

// http://services-sandbox-mozu-qa.dev.volusion.com/mozu.ProductRuntime.WebApi/commerce/catalog/storefront/productsearch/search/?query={query}&filter={filter}&facetTemplate={facetTemplate}&facetTemplateSubset={facetTemplateSubset}&facet={facet}&facetFieldRangeQuery={facetFieldRangeQuery}&facetHierPrefix={facetHierPrefix}&facetHierValue={facetHierValue}&facetHierDepth={facetHierDepth}&facetStartIndex={facetStartIndex}&facetPageSize={facetPageSize}&facetSettings={facetSettings}&facetValueFilter={facetValueFilter}&sortBy={sortBy}&pageSize={pageSize}&startIndex={startIndex}