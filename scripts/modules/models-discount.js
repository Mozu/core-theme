define(["backbone", 'underscore', 'hyprlive', 'modules/api', 'modules/models-product', 'modules/models-dialog'], function (Backbone, _, Hypr, api, ProductModels, Dialog) {

    var discountModel = Backbone.MozuModel.extend({
        mozuType: 'discounts',
        relations: {
            products: Backbone.Collection.extend({
                model: ProductModels.Product
            })
        },
        defaults: {
            productCode: "",
            hasMultipleProducts: false
        },
        getProductDetails: function (productCode) {
            var self = this;
            productCode = productCode || this.get('productCode');

            if (!productCode || productCode === "") {
                this.trigger('error', 'No Product Code Found');
                throw 'No Product Code Found';
            }

            var productModel = new ProductModels.Product({ productCode: productCode });
            return productModel.apiGet({ productCode: productCode, acceptVariantProductCode: true }).then(function (data) {
                //self.get('products').reset([data.data]);
                return data.data;
            });
        },
        getDiscountDetails: function () {
            var self = this;
            return self.apiGet();
        },
        tagVariationOptions: function (productCode, data) {
            var variation = _.find(data.variations, function (v) {
                return v.productCode === productCode;
            });

            if (variation) {
                _.each(variation.options, function (variationOption) {
                    _.each(data.options, function (option, optionIdx) {
                        if (option.attributeFQN === variationOption.attributeFQN) {
                            var valueIdx = _.findIndex(option.values, function (v) {
                                return v.value === variationOption.value;
                            });
                            data.options[optionIdx].values[valueIdx].autoAddEnabled = true;
                            return false;
                        }
                    });
                });
            }
            data.variationCollection = true;
            return data;
        },
        getDiscountProducts: function () {
            var self = this;
            var deferred = api.defer();
            var products = [];

            var hasBaseProduct = function (products, variationCode) {
                return _.findIndex(products, function (product) {
                    return _.find(product.variations, function (variation) {
                        return variation.productCode === variationCode;
                    });
                });
            };

            var getVariationBase = function (productCode) {
                    return self.getProductDetails(productCode).then(function (data) {
                        data = self.tagVariationOptions(productCode, data);
                        products.push(data);
                        self.get('products').add(data);
                        return data;
                    });
            };

            var removeVaritionsWithBase = function (unFoundProducts) {
                _.each(unFoundProducts, function (productCode) {
                    var foundProductIdx = hasBaseProduct(unFoundProducts, productCode);
                    if (foundProductIdx) {
                        unFoundProducts = unFoundProducts.splice(foundProductIdx, 1);
                    }
                });
                return unFoundProducts;
            };

            self.getAllProductDetails().then(function (data) {

                products = data;
                self.get('products').add(data);

                var unFoundProducts = _.reject(self.get('productCodes'), function (productCode) {
                    return _.find(products, function (product) {
                        return product.productCode === productCode;
                    });
                });

                var getVariationBases = function(){
                    var baseProductIdx = hasBaseProduct(products, unFoundProducts[unFoundProducts.length - 1]);
                    if (baseProductIdx === -1 && unFoundProducts.length) {
                        getVariationBase(unFoundProducts[unFoundProducts.length - 1]).then(function () {
                            unFoundProducts.splice(unFoundProducts.length-1, 1);
                                //unFoundProducts = removeVaritionsWithBase(unFoundProducts);
                                return getVariationBases();
                        });
                        return;
                    } else if (baseProductIdx != -1 && unFoundProducts.length) {
                            self.tagVariationOptions(unFoundProducts[unFoundProducts.length - 1], products[baseProductIdx]);
                            unFoundProducts.splice(unFoundProducts.length - 1, 1);
                            return getVariationBases();
                    }
                    return deferred.resolve(products);
                };
                getVariationBases();
                return data;
            });
            return deferred.promise;
        },
        getAllProductDetails: function () {
            var self = this;
            var filter = '';
            _.forEach(self.get('productCodes'), function (code, idx) {
                if (idx === 0) {
                    filter += 'productCode eq ' + code;
                    return;
                }
                filter += ' or productCode eq ' + code;
            });

            return api.get('products', { filter: filter }).then(function (data) {
                var mappedProducts = _.map(data, function (product) {
                    return product.data;
                });

                _.forEach(mappedProducts, function (product, idx) {
                    if (product.isVariation) {
                        var foundBaseProduct = _.findWhere(mappedProducts, { productCode: product.baseProductCode });
                        if (foundBaseProduct) {
                            foundBaseProduct.options.add(product.option);
                            delete mappedProducts[idx];
                            return;
                        }
                        mappedProducts[idx].productCode = product.baseProductCode;
                        mappedProducts[idx].productCode.options = [product.option];
                    }
                });

                self.get('products').reset(mappedProducts);
                return mappedProducts;
            });
        }
    });
    return discountModel;
});