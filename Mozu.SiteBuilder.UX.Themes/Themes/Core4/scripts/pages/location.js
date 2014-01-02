require(['modules/jquery-mozu', 'hyprlive', 'modules/backbone-mozu', 'modules/models-location', 'modules/models-product'],
    function($, Hypr, Backbone, LocationModels, ProductModels) {

        //var locationsModel = new Backbone.Model(data);

        //var LocationView = Backbone.MozuView.extend({
        //    templateName: 'modules/location/location',
        //    events: {
        //        'click a': 'onClickStoreInfo'
        //    },

        //    onClickStoreInfo: function(e) {
        //        var code = $(e.currentTarget).data('mz-loc-code'),
        //            $container = $('<div>').appendTo('body'),
        //            view,
        //            loc;

        //        e.preventDefault();
        //        console.log('Store Details', e, locationsModel);

        //        loc = _.find(locationsModel.get('items'), function(item) {
        //            return code.toString() === item.code.toString();
        //        });

        //        if (!loc) return;

        //        view = new StoreInfoView({
        //            model: new Backbone.Model(loc),
        //            el: $container
        //        })

        //        view.render();
        //    }
        //});

        //var StoreInfoView = Backbone.MozuView.extend({
        //    templateName: 'modules/location/store-info',
        //    events: {
        //        'click .mz-loc-dialog-cover': 'onClickCover'
        //    },

        //    onClickCover: function(e) {
        //        if (!$(e.target).is('.mz-loc-dialog-cover')) return;
        //        this.remove();
        //        this.render();
        //    }
        //});

        var LocationsView = Backbone.MozuView.extend({
            templateName: 'modules/location/locations',
            initialize: function () {
                var self = this;
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (pos) {
                        self.populate(pos);
                    }, function () {
                        self.populate();
                    }, {
                        timeout: 10000
                    });
                } else {
                    this.populate();
                }
            },
            populate: function() {
                var self = this;
                this.model.apiGet().then(function() {
                    self.render();
                    $('.mz-locationsearch-pleasewait').fadeOut();
                    self.$el.noFlickerFadeIn();
                });
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
            window.lm = LocationModels;
        })
    }
);