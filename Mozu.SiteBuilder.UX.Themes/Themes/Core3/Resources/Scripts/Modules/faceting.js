define(['modules/jquery-plus', 'knockout', 'modules/api', "modules/models-faceting"], function($, ko, api, FacetingModels){

    $(document).ready(function () {
        
        var $facetingForm = $('[data-mz-role=faceting]'),
            facetingVM = window.facetingVM = new FacetingModels.FacetedProductCollection($facetingForm.mozuData('products'));

        ko.applyBindings(facetingVM, $facetingForm[0]);

        $('#mz-category-loading').remove();
        $facetingForm.noFlickerFadeIn();

        facetingVM.categoryId = $.getMozuData('category');

    });
    

    /*
    var FacetingProperties = {},
        ids = 0,
        vmConfig = (function(){
            // use a copy of facetingproperties with no value, because KVM expects observable config, not values
            var props = {};
            for (var p in FacetingProperties) {
                if (FacetingProperties.hasOwnProperty(p)) props[p] = [];
            }
            return props;
        }()),
        facetingViewModel = new (KVM.extend({
            observableArrays: vmConfig
        }))(_.clone(vmConfig));

    window.fvm = facetingViewModel;

    facetingViewModel.facets = _.collect(FacetingProperties, function(v, n) {
        return {
            name: n,
            available: v,
            selected: facetingViewModel[n],
            empty: ko.computed({
                write: function(val) {
                    facetingViewModel[n].removeAll();
                    return true;
                },
                read: function() {
                    return facetingViewModel[n]().length === 0;
                }
            }),
            emptyId: "empty_" + ids++,
            idAttr: function(val) {
                return "facet_" + ids + "_" + val.toLowerCase().replace(/\s/g,'_');
            }
        };
    });

    facetingViewModel.clearAll = function() {
        _.each(facetingViewModel.facets, function(f) {
            f.empty(0);
        });
        setTimeout(function() {
            $('[data-mz-action=clearfacets]').prop('checked',false);
        }, 200);
    };

    $(document).ready(function() {
        var $facetingForm = $('[data-mz-role=faceting]');
        api.get('products', { pageSize: 50, ResponseGroups: 'Properties', categoryId: $facetingForm.mozuData('category'), recurse: true }).then(function(allProducts){

            facetingViewModel.qualified = ko.computed(function(){
                var p, props = facetingViewModel.toJS();
                for (p in props) {
                    if (props.hasOwnProperty(p) && (!props[p] || props[p].length === 0)) delete props[p];
                }

                if (_.isEmpty(props)) return allProducts;

                return _.select(allProducts, function(product) {
                    var productProperties = product.prop("Properties");
                    return _.all(props, function(prop, propName) {
                        return _.any(prop, function(propValue) {
                            return _.any(productProperties, function(productProperty) {
                                return productProperty.AttributeDetail.Name == propName && productProperty.Values[0].StringValue == propValue;
                            });
                        });
                    });
                });

            });

            ko.applyBindings(facetingViewModel, $facetingForm[0]);
            $('#mz-category-loading').remove();
            $facetingForm.noFlickerFadeIn();

        }).otherwise(function(e) {
            console.error(e.message);
        });
    });
    */
});