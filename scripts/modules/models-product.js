define(["modules/jquery-mozu", "underscore", "modules/backbone-mozu", "hyprlive", "modules/models-price", "modules/api",
    "hyprlivecontext"], function($, _, Backbone, Hypr, PriceModels, api,
        HyprLiveContext) {

    function zeroPad(str, len) {
        str = str.toString();
        while (str.length < 2) str = '0' + str;
        return str;
    }
    function formatDate(d) {
        var date = new Date(Date.parse(d) + (new Date()).getTimezoneOffset() * 60000);
        return [zeroPad(date.getFullYear(), 4), zeroPad(date.getMonth() + 1, 2), zeroPad(date.getDate(), 2)].join('-');
    }


    var ProductOption = Backbone.MozuModel.extend({
        idAttribute: "attributeFQN",
        helpers: ['isChecked'],
        initialize: function() {
            var me = this;
            _.defer(function() {
                me.listenTo(me.collection, 'invalidoptionselected', me.handleInvalid, me);
            });

            var equalsThisValue = function(fvalue, newVal) {
                return fvalue.value.toString() === newVal.toString();
            },
            containsThisValue = function(existingOptionValueListing, newVal) {
                return _.some(newVal, function(val) {
                    return equalsThisValue(existingOptionValueListing, val);
                });
            },
            attributeDetail = me.get('attributeDetail');
            if (attributeDetail) {
                if (attributeDetail.valueType === ProductOption.Constants.ValueTypes.Predefined) {
                    this.legalValues = _.chain(this.get('values')).pluck('value').map(function(v) { return !_.isUndefined(v) && !_.isNull(v) ? v.toString() : v; }).value();
                }
                if (attributeDetail.inputType === ProductOption.Constants.InputTypes.YesNo) {
                    me.on('change:value', function(model, newVal) {
                        var values;
                        if (me.previous('value') !== newVal) {
                            values = me.get('values');
                            _.first(values).isSelected = newVal;
                            me.set({
                                value: newVal,
                                shopperEnteredValue: newVal,
                                values: values
                            }, {
                                silent: true
                            });
                            me.trigger('optionchange', newVal, me);
                        }
                    });
                } else {
                    me.on("change:value", function(model, newVal) {
                        var newValObj, values = me.get("values"),
                            comparator = this.get('isMultiValue') ? containsThisValue : equalsThisValue;
                        if (typeof newVal === "string") newVal = $.trim(newVal);
                        if (newVal || newVal === false || newVal === 0 || newVal === '') {
                            _.each(values, function(fvalue) {
                                if (comparator(fvalue, newVal)) {
                                    newValObj = fvalue;
                                    fvalue.isSelected = true;
                                    me.set("value", newVal, { silent: true });
                                } else {
                                    fvalue.isSelected = false;
                                }
                            });
                            me.set("values", values);
                            if (me.get("attributeDetail").valueType === ProductOption.Constants.ValueTypes.ShopperEntered) {
                                me.set("shopperEnteredValue", newVal, { silent: true });
                            }
                        } else {
                            me.unset('value');
                            me.unset("shopperEnteredValue");
                        }
                        if (newValObj && !newValObj.isEnabled) me.collection.trigger('invalidoptionselected', newValObj, me);
                        me.trigger('optionchange', newVal, me);
                    });
                }
            }
        },
        handleInvalid: function(newValObj, opt) {
            if (this !== opt) {
                this.unset("value");
                _.each(this.get("values"), function(value) {
                    value.isSelected = false;
                });
            }
        },
        parse: function(raw) {
            var selectedValue, vals, storedShopperValue;
            if (raw.isMultiValue) {
                vals = _.pluck(_.where(raw.values, { isSelected: true }), 'value');
                if (vals && vals.length > 0) raw.value = vals;
            } else {
                selectedValue = _.findWhere(raw.values, { isSelected: true });
                if (selectedValue) raw.value = selectedValue.value;
            }
            if (raw.attributeDetail) {
                if (raw.attributeDetail.valueType !== ProductOption.Constants.ValueTypes.Predefined) {
                    storedShopperValue = raw.values[0] && raw.values[0].shopperEnteredValue;
                    if (storedShopperValue || storedShopperValue === 0) {
                        raw.shopperEnteredValue = storedShopperValue;
                        raw.value = storedShopperValue;
                    }
                }
                if (raw.attributeDetail.inputType === ProductOption.Constants.InputTypes.Date && raw.attributeDetail.validation) {
                    raw.minDate = formatDate(raw.attributeDetail.validation.minDateValue);
                    raw.maxDate = formatDate(raw.attributeDetail.validation.maxDateValue);
                }
            }
            return raw;
        },
        isChecked: function() {
            var attributeDetail = this.get('attributeDetail'),
                values = this.get('values');

            return !!(attributeDetail && attributeDetail.inputType === ProductOption.Constants.InputTypes.YesNo && values && this.get('shopperEnteredValue'));
        },
        isValidValue: function() {
            var value = this.getValueOrShopperEnteredValue();
            return value !== undefined && value !== '' && (this.get('attributeDetail').valueType !== ProductOption.Constants.ValueTypes.Predefined || (this.get('isMultiValue') ? !_.difference(_.map(value, function(v) { return v.toString(); }), this.legalValues).length : _.contains(this.legalValues, value.toString())));
        },
        getValueOrShopperEnteredValue: function() {
            return this.get('value') || (this.get('value') === 0) ? this.get('value') : this.get('shopperEnteredValue');
        },
        isConfigured: function() {
            var attributeDetail = this.get('attributeDetail');
            if (!attributeDetail) return true; // if attributeDetail is missing, this is a preconfigured product
            return attributeDetail.inputType === ProductOption.Constants.InputTypes.YesNo ? this.isChecked() : this.isValidValue();
        },
        toJSON: function(options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (j && j.attributeDetail && j.attributeDetail.valueType !== ProductOption.Constants.ValueTypes.Predefined && this.isConfigured()) {
                var val = j.value || j.shopperEnteredValue;
                if (j.attributeDetail.dataType === "Number") val = parseFloat(val);
                j.shopperEnteredValue = j.value = val;
            }

            return j;
        },
        addConfiguration: function(biscuit, options) {
            var fqn, value, attributeDetail, valueKey, pushConfigObject;
            if (this.isConfigured()) {
                if (options && options.unabridged) {
                    biscuit.push(this.toJSON());
                } else {
                    fqn = this.get('attributeFQN');
                    value = this.getValueOrShopperEnteredValue();
                    attributeDetail = this.get('attributeDetail');
                    valueKey = attributeDetail.valueType === ProductOption.Constants.ValueTypes.ShopperEntered ? "shopperEnteredValue" : "value";
                    if (attributeDetail.dataType === "Number") value = parseFloat(value);
                    pushConfigObject = function(val) {
                        var o = {
                            attributeFQN: fqn
                        };
                        o[valueKey] = val;
                        biscuit.push(o);
                    };
                    if (_.isArray(value)) {
                        _.each(value, pushConfigObject);
                    } else {
                        pushConfigObject(value);
                    }
                }
            }
        }
    }, {
        Constants: {
            ValueTypes: {
                Predefined: "Predefined",
                ShopperEntered: "ShopperEntered",
                AdminEntered: "AdminEntered"
            },
            InputTypes: {
                List: "List",
                YesNo: "YesNo",
                Date: "Date"
            }
        }
    }),

    ProductContent = Backbone.MozuModel.extend({}),

    Product = Backbone.MozuModel.extend({
        mozuType: 'product',
        idAttribute: 'productCode',
        handlesMessages: true,
        helpers: ['mainImage', 'notDoneConfiguring', 'hasPriceRange', 'supportsInStorePickup', 'isPurchasable','hasVolumePricing'],
        defaults: {
            purchasableState: {},
            quantity: 1
        },
        dataTypes: {
            quantity: Backbone.MozuModel.DataTypes.Int
        },
        validation: {
            quantity: {
                min: 1,
                msg: Hypr.getLabel('enterProductQuantity')
            }
        },
        relations: {
            content: ProductContent,
            price: PriceModels.ProductPrice,
            priceRange: PriceModels.ProductPriceRange,
            options: Backbone.Collection.extend({
                model: ProductOption
            })
        },
        getBundledProductProperties: function(opts) {
            var self = this,
                loud = !opts || !opts.silent;
            if (loud) {
                this.isLoading(true);
                this.trigger('request');
            }

            var bundledProducts = this.get('bundledProducts'),
                numReqs = bundledProducts.length,
                deferred = api.defer();
            _.each(bundledProducts, function(bp) {
                var op = api.get('product', bp.productCode);
                op.ensure(function() {
                    if (--numReqs === 0) {
                        _.defer(function() {
                            self.set('bundledProducts', bundledProducts);
                            if (loud) {
                                this.trigger('sync', bundledProducts);
                                this.isLoading(false);
                            }
                            deferred.resolve(bundledProducts);
                        });
                    }
                });
                op.then(function(p) {
                    _.each(p.prop('properties'), function(prop) {
                        if (!prop.values || prop.values.length === 0 || prop.values[0].value === '' || prop.values[0].stringValue === '') {
                            prop.isEmpty = true;
                        }
                    });
                    _.extend(bp, p.data);
                });
            });

            return deferred.promise;
        },
        hasPriceRange: function() {
            return this._hasPriceRange;
        },
        hasVolumePricing: function() {
            return this._hasVolumePricing;
        },
        calculateHasPriceRange: function(json) {
            this._hasPriceRange = json && !!json.priceRange;
        },
        initialize: function(conf) {
            var slug = this.get('content').get('seoFriendlyUrl');
            _.bindAll(this, 'calculateHasPriceRange', 'onOptionChange');
            this.listenTo(this.get("options"), "optionchange", this.onOptionChange);
            this._hasVolumePricing = false;
            this._minQty = 1;
            if (this.get('volumePriceBands') && this.get('volumePriceBands').length > 0) {
                this._hasVolumePricing = true;
                this._minQty = _.first(this.get('volumePriceBands')).minQty;
                if (this._minQty > 1) {
                    if (this.get('quantity') <= 1) {
                        this.set('quantity', this._minQty);
                    }
                    this.validation.quantity.msg = Hypr.getLabel('enterMinProductQuantity', this._minQty);
                }
            }
            this.updateConfiguration = _.debounce(this.updateConfiguration, 300);
            this.set({ url: (HyprLiveContext.locals.siteContext.siteSubdirectory || '') + (slug ? "/" + slug : "") +  "/p/" + this.get("productCode")});
            this.lastConfiguration = [];
            this.calculateHasPriceRange(conf);
            this.on('sync', this.calculateHasPriceRange);
        },
        mainImage: function() {
            var productImages = this.get('content.productImages');
            return productImages && productImages[0];
        },
        notDoneConfiguring: function() {
            return this.get('productUsage') === Product.Constants.ProductUsage.Configurable && !this.get('variationProductCode');
        },
        isPurchasable: function() {
            var purchaseState = this.get('purchasableState');
            if (purchaseState.isPurchasable){
                return true;
            }
            if (this._hasVolumePricing && purchaseState.messages && purchaseState.messages.length === 1 && purchaseState.messages[0].validationType === 'MinQtyNotMet') {
                return true;
            }
            return false;
        },
        supportsInStorePickup: function() {
            return _.contains(this.get('fulfillmentTypesSupported'), Product.Constants.FulfillmentTypes.IN_STORE_PICKUP);
        },
        getConfiguredOptions: function(options) {
            return this.get('options').reduce(function(biscuit, opt) {
                opt.addConfiguration(biscuit, options);
                return biscuit;
            }, []);
        },


        addToCart: function () {
            var me = this;
            this.whenReady(function () {
                if (!me.validate()) {
                    var fulfillMethod = me.get('fulfillmentMethod');
                    if (!fulfillMethod) {
                        fulfillMethod = (me.get('goodsType') === 'Physical') ? Product.Constants.FulfillmentMethods.SHIP : Product.Constants.FulfillmentMethods.DIGITAL;
                    }
                    me.apiAddToCart({
                        options: me.getConfiguredOptions(),
                        fulfillmentMethod: fulfillMethod,
                        quantity: me.get("quantity")
                    }).then(function (item) {
                        me.trigger('addedtocart', item);
                    });
                }
            });
        },
        addToWishlist: function() {
            var me = this;
            this.whenReady(function() {
                if (!me.validate()) {
                    me.apiAddToWishlist({
                        customerAccountId: require.mozuData('user').accountId,
                        quantity: me.get("quantity")
                    }).then(function(item) {
                        me.trigger('addedtowishlist', item);
                    });
                }
            });
        },
        addToCartForPickup: function(locationCode, quantity) {
            var me = this;
            this.whenReady(function() {
                return me.apiAddToCartForPickup({
                    fulfillmentLocationCode: locationCode,
                    fulfillmentMethod: Product.Constants.FulfillmentMethods.PICKUP,
                    quantity: quantity || 1
                }).then(function(item) {
                    me.trigger('addedtocart', item);
                });
            });
        },
        onOptionChange: function() {
            this.isLoading(true);
            this.updateConfiguration();
        },
        updateQuantity: function (newQty) {
            if (this.get('quantity') === newQty) return;
            this.set('quantity', newQty);
            if (!this._hasVolumePricing) return;
            if (newQty < this._minQty) {
                return this.showBelowQuantityWarning();
            }
            this.isLoading(true);
            this.apiConfigure({ options: this.getConfiguredOptions() }, { useExistingInstances: true });
        },
        showBelowQuantityWarning: function () {
            this.validation.quantity.min = this._minQty;
            this.validate();
            this.validation.quantity.min = 1;
        },
        handleMixedVolumePricingTransitions: function (data) {
            if (!data || !data.volumePriceBands || data.volumePriceBands.length === 0) return;
            if (this._minQty === data.volumePriceBands[0].minQty) return;
            this._minQty = data.volumePriceBands[0].minQty;
            this.validation.quantity.msg = Hypr.getLabel('enterMinProductQuantity', this._minQty);
            if (this.get('quantity') < this._minQty) {
                this.updateQuantity(this._minQty);
            }
        },
        updateConfiguration: function() {
            var me = this,
              newConfiguration = this.getConfiguredOptions();
            if (JSON.stringify(this.lastConfiguration) !== JSON.stringify(newConfiguration)) {
                this.lastConfiguration = newConfiguration;
                this.apiConfigure({ options: newConfiguration }, { useExistingInstances: true })
                    .then(function (apiModel) {
                        if (me._hasVolumePricing) {
                            me.handleMixedVolumePricingTransitions(apiModel.data);
                        }
                     });
            } else {
                this.isLoading(false);
            }
        },
        parse: function(prodJSON) {
            if (prodJSON && prodJSON.productCode && !prodJSON.variationProductCode) {
                this.unset('variationProductCode');
            }
            return prodJSON;
        },
        toJSON: function(options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers) {
                j.options = this.getConfiguredOptions({ unabridged: true });
            }
            if (options && options.helpers) {
                if (typeof j.mfgPartNumber == "string") j.mfgPartNumber = [j.mfgPartNumber];
                if (typeof j.upc == "string") j.upc = [j.upc];
                if (j.bundledProducts && j.bundledProducts.length === 0) delete j.bundledProducts;
            }
            return j;
        }
    }, {
        Constants: {
            FulfillmentMethods: {
                SHIP: "Ship",
                PICKUP: "Pickup",
                DIGITAL: "Digital"
            },
            // for catalog instead of commerce
            FulfillmentTypes: {
                IN_STORE_PICKUP: "InStorePickup"
            },
            ProductUsage: {
                Configurable: 'Configurable'
            }
        }
    }),

    ProductCollection = Backbone.MozuModel.extend({
        relations: {
            items: Backbone.Collection.extend({
                model: Product
            })
        }
    });

    return {
        Product: Product,
        Option: ProductOption,
        ProductCollection: ProductCollection
    };

});


