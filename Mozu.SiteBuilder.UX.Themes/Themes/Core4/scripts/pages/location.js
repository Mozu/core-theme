require(['modules/jquery-mozu', 'hyprlive', 'modules/backbone-mozu', 'modules/models-location', 'modules/models-product'],
    function($, Hypr, Backbone, LocationModels, ProductModels) {

        var positionErrorLabel = Hypr.getLabel('positionError'),

        LocationsView = Backbone.MozuView.extend({
            templateName: 'modules/location/locations',
            initialize: function () {
                var self = this;
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (pos) {
                        delete self.positionError;
                        self.populate(pos);
                    }, function (err) {
                        if (err.code !== err.PERMISSION_DENIED) {
                            self.positionError = positionErrorLabel;
                        }
                        self.populate();
                    }, {
                        timeout: 10000
                    });
                } else {
                    this.populate();
                }
            },
            populate: function(location) {
                var self = this;
                var show = function() {
                    self.render();
                    $('.mz-locationsearch-pleasewait').fadeOut();
                    self.$el.noFlickerFadeIn();
                };
                if (location) {
                    this.model.apiGetByLatLong({ location: location }).then(show);
                } else {
                    this.model.apiGet().then(show);
                }
            },
            getRenderContext: function () {
                var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
                c.model.positionError = this.positionError;
                return c;
            }
        }),

        LocationsSearchView = LocationsView.extend({
            templateName: 'modules/location/location-search',
            populate: function (location) {
                var self = this;
                this.model.apiGetForProduct({
                    productCode: this.product.get('variationProductCode') || this.product.get('productCode'),
                    location: location
                }).then(function () {
                    self.render();
                    $('.mz-locationsearch-pleasewait').fadeOut();
                    self.$el.noFlickerFadeIn();
                });
            },
            addToCartForPickup: function (e) {
                var self = this,
                    $target = $(e.currentTarget),
                    loc = $target.data('mzLocation');
                $target.parent().addClass('is-loading');
                this.product.addToCartForPickup(loc).then(function (cartItem) {
                    window.location.href = "/cart";
                }).ensure(function () {
                    $target.parent().removeClass('is-loading');
                });
            }
        });

        $(document).ready(function() {
            
            var $locationSearch = $('#location-list'),
                product = ProductModels.Product.fromCurrent(),
                locationsCollection = new LocationModels.LocationCollection(),
                view = new (product.get('productCode') ? LocationsSearchView : LocationsView)({
                    model: locationsCollection,
                    el: $locationSearch
                });

            view.product = product;
            window.lv = view;
        })
    }
);