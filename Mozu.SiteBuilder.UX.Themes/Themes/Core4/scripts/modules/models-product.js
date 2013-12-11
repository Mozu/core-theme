define(["modules/jquery-mozu", "shim!vendor/underscore>_", "modules/backbone-mozu", "hyprlive", "modules/models-price", "modules/api"], function ($, _, Backbone, Hypr, PriceModels, api) {

    function zeroPad(str, len) {
        str = str.toString();
        while (str.length < 2) str = '0' + str;
        return str;
    }
    function formatDate(d) {
        var date = new Date(Date.parse(d) + (new Date).getTimezoneOffset() * 60000);
        return [zeroPad(date.getFullYear(),4),zeroPad(date.getMonth() + 1,2), zeroPad(date.getDate(),2)].join('-');
    }


    var ProductOption = Backbone.MozuModel.extend({
        idAttribute: "attributeFQN",
        initialize: function() {
            var me = this;
            _.defer(function() {
                me.listenTo(me.collection, 'invalidoptionselected', me.handleInvalid, me);
            });
            me.on("change:value", _.debounce(function(model, newVal) {
                var newValObj, values = me.get("values");
                newVal = $.trim(newVal);
                if (newVal) {
                    _.each(values, function(fvalue) {
                        if (fvalue.value.toString() === newVal.toString()) {
                            newValObj = fvalue;
                            fvalue.isSelected = true;
                            me.set("value", newVal);
                        } else {
                            fvalue.isSelected = false;
                        }
                    });
                    me.set("values", values);
                    if (me.get("attributeDetail").inputType !== "List") {
                        me.set("shopperEnteredValue", newVal);
                    }
                } else {
                    me.unset('value');
                    me.unset("shopperEnteredValue");
                }
                if (newValObj && !newValObj.isEnabled) me.collection.trigger('invalidoptionselected', newValObj, me);
                me.trigger('optionchange', newVal, me);
            }, 300));
        },
        handleInvalid: function(newValObj, opt) {
            if (!(this === opt)) {
                this.unset("value");
                _.each(this.get("values"), function(value) {
                    value.isSelected = false;
                });
            }
        },
        parse: function(raw) {
            var selectedValue, storedShopperValue;
            if (!raw.isMultiValue) {
                selectedValue = _.findWhere(raw.values, { isSelected: true });
                if (selectedValue) raw.value = selectedValue.value;
            }
            if (raw.attributeDetail.inputType !== "List") {
                storedShopperValue = raw.values[0] && raw.values[0].shopperEnteredValue;
                if (storedShopperValue || storedShopperValue === 0)
                    this.set({
                        shopperEnteredValue: storedShopperValue,
                        value: storedShopperValue
                    });
            }
            if (raw.attributeDetail.inputType === "Date" && raw.attributeDetail.validation) {
                raw.minDate = formatDate(this.attributeDetail.validation.minDateValue);
                raw.maxDate = formatDate(this.attributeDetail.validation.maxDateValue);
            }
            return raw;
        }
    }),

    ProductContent = Backbone.MozuModel.extend({}),

    Product = Backbone.MozuModel.extend({
        mozuType: 'product',
        idAttribute: 'productCode',
        handlesMessages: true,
        helpers: ['mainImage', 'notDoneConfiguring', 'hasPriceRange'],
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
        hasPriceRange: function() {
            return this._hasPriceRange;
        },
        calculateHasPriceRange: function(json) {
            this._hasPriceRange = json && !!json.priceRange;
        },
        initialize: function (conf) {
            var slug = this.get('content').get('seoFriendlyUrl');
            this.listenTo(this.get("options"), "optionchange", this.updateConfiguration, this);
            this.set({ url: slug ? "/"+ slug + "/p/"+ this.get("productCode") :  "/p/" + this.get("productCode") });
            this.lastConfiguration = [];
            var self = this;
            _.bindAll(this, 'calculateHasPriceRange');
            this.calculateHasPriceRange(conf);
            this.on('sync', this.calculateHasPriceRange);
        },
        mainImage: function() {
            var imgs = this.get('content').get("productImages"),
                img = imgs && imgs[0];
            return img || { imageUrl: 'http://placehold.it/160&text=' + Hypr.getLabel('noImages') }
        },
        notDoneConfiguring: function() {
            var purchasableState = this.get('purchasableState');
            return purchasableState.isPurchasable === false && purchasableState.messages && purchasableState.messages[0] && purchasableState.messages[0].message === "Not done configuring";
        },
        getConfiguredOptions: function() {
            return _.invoke(this.get("options").filter(function(opt) {
                var value = opt.get('value'),
                    shopperEnteredValue = opt.get('shopperEnteredValue');
                return (value !== undefined && value !== '') || (shopperEnteredValue !== undefined && shopperEnteredValue !== '');
            }), 'toJSON');
        },
        addToCart: function() {
            var me = this;
            if (!this.validate()) {
                this.apiAddToCart(this.get("quantity")).then(function(item) {
                    me.trigger('addedtocart', item);
                });
            }
        },
        addToWishlist: function () {
            var me = this;
            if (!this.validate()) {
                this.apiAddToWishlist({
                    customerAccountId: require.mozuData('user').accountId,
                    quantity: this.get("quantity")
                }).then(function (item) {
                    me.trigger('addedtowishlist', item);
                });
            }
        },
        updateConfiguration: _.debounce(function() {
            var newConfiguration = this.getConfiguredOptions();
            if (JSON.stringify(this.lastConfiguration) !== JSON.stringify(newConfiguration)) {
                this.lastConfiguration = newConfiguration;
                this.apiConfigure({ options: newConfiguration });
            }
        }, 400),
        toJSON: function (options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers) j.options = this.getConfiguredOptions();
            return j;
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


