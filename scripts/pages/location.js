require(['modules/jquery-mozu', 'hyprlive', 'modules/backbone-mozu', 'modules/models-location', 'modules/models-product', 'modules/views-location'],
    function($, Hypr, Backbone, LocationModels, ProductModels, LocationViews) {

        var positionErrorLabel = Hypr.getLabel('positionError');


        $(document).ready(function() {

            var $locationSearch = $('#location-list'),
                product = ProductModels.Product.fromCurrent(),
                productPresent = !!product.get('productCode'),
                locationsCollection = new LocationModels.LocationCollection(),
                ViewClass = productPresent ? LocationViews.LocationsSearchView : LocationViews.LocationsView,
                view = new ViewClass({
                    model: locationsCollection,
                    el: $locationSearch
                });

            if (productPresent) view.setProduct(product);
            window.lv = view;
        });
    }
);
