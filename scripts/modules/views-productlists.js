define(['modules/jquery-mozu', 'modules/backbone-mozu', 'hyprlive'], function ($, Backbone, Hypr) {
    var ProductListView = Backbone.MozuView.extend({
            templateName: 'modules/product/product-list-tiled'
        }),
        
        AnimatedProductListView = ProductListView.extend({
        initialize: function () {
            var self = this,
                items = this.model.get('items');
            this.previousItems = new (items.constructor)(items.models);
            this.itemTemplate = Hypr.getTemplate('modules/product/product-listing');
            require(['shim!vendor/isotope.min[jquery=jQuery]'], function() {
                self.$el.isotope({
                    itemSelector: '.mz-productlist-item',
                    layoutMode: 'cellsByRow',
                    animationOptions: {
                        duration: 400,
                        queue: false
                    }
                });
            });
        },
        getDifferentProducts: function (left, right) {
            // could do this with underscore methods and make it more functional-looking,
            // but this is a heavy operation and we need to do it imperatively
            // for performance reasons
            var diff = right.slice(), code, j, rl = diff.length - 1;
            for (var i = left.length - 1; i >= 0; i--) {
                code = left[i].attributes.productCode;
                for (j = rl; j >= 0; j--) {
                    if (diff[j].attributes.productCode === code) {
                        diff.splice(j, 1);
                        rl--;
                        break;
                    }
                }
            }
            return diff;
        },
        render: function () {
            var self = this, newItems = this.model.get('items');
            var $toRemove = [], toRemove = this.getDifferentProducts(newItems.models, this.previousItems.models);
            if (toRemove.length > 0) {
                $toRemove = this.$(_.map(toRemove, function (i) { return '.mz-productlist-item[data-mz-product="' + i.get('productCode') + '"]'; }).join(','));
            }
            if ($toRemove.length > 0) {
                this.$el.isotope('remove', $toRemove);
            }

            var $toAdd = [], toAdd = this.getDifferentProducts(this.previousItems.models, newItems.models);
            if (toAdd.length > 0) {
                $toAdd = $(_.map(toAdd, function (model) {
                    return '<li class="mz-productlist-item" data-mz-product="' + model.attributes.productCode + '">' + self.itemTemplate.render(self.getRenderContext(model)) + '</li>';
                }).join(''));
            }
            if ($toAdd.length > 0) {
                this.$el.isotope('insert', $toAdd);
            }

            this.previousItems.models = newItems.models.slice();
        }
    }),

    FacetingPanel = Backbone.MozuView.extend({
        additionalEvents: {
            "change [data-mz-facet-value]": "setFacetValue"
        },
        templateName: "modules/product/faceting-form",
        initialize: function () {
            this.listenTo(this.model, 'loadingchange', function (isLoading) {
                this.$el.find('input').prop('disabled', isLoading);
            });
        },
        clearFacets: function () {
            this.model.clearAllFacets();
        },
        clearFacet: function (e) {
            this.model.get("facets").findWhere({ field: $(e.currentTarget).data('mz-facet') }).empty();
        },
        drillDown: function(e) {
            var $target = $(e.currentTarget),
                id = $target.data('mz-hierarchy-id'),
                field = $target.data('mz-facet');
            this.model.setHierarchy(field, id);
            this.model.updateFacets({ force: true, resetIndex: true });
            e.preventDefault();
        },
        setFacetValue: function (e) {
            var $box = $(e.currentTarget);
            this.model.setFacetValue($box.data('mz-facet'), $box.data('mz-facet-value'), $box.is(':checked'));
        }
    });



    return {
        List: ProductListView,
        AnimatedList: AnimatedProductListView,
        FacetingPanel: FacetingPanel
    };
});