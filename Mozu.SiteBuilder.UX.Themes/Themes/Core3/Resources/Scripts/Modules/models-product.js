define(["jquery", "modules/knockout-plus", "modules/knockout-viewmodel", "modules/models-price", "modules/function-debouncer"], function ($, ko, KnockoutVM, PriceModels, debounce) {

    function sanitize(str) {
        return str.replace(/[\s~'"]+/g, '-');
    }

    function zeroPad(str, len) {
        str = str.toString();
        while (str.length < 2) str = '0' + str;
        return str;
    }
    function formatDate(d) {
        var date = new Date(Date.parse(d) + (new Date).getTimezoneOffset() * 60000);
        return [zeroPad(date.getFullYear(),4),zeroPad(date.getMonth() + 1,2), zeroPad(date.getDate(),2)].join('-');
    }

    var ProductOption = KnockoutVM.extend({
        statics: {
            AttributeFQN: '',
            AttributeValueId: ''
        },
        observables: {
            Value: {},
            ShopperEnteredValue: {}
        },
        observableArrays: {
            Values: {}
        },
        beginLiveUpdate: function () {
            var me = this, parent = this.getParentModel();
            me.Value.subscribe(debounce(function (newVal) {
                var newValObj;
                newVal = $.trim(newVal);
                if (newVal) newValObj = ko.utils.arrayFirst(me.Values(), function (v) {
                    return v.Value.toString() === newVal.toString();
                });
                if (newValObj && !newValObj.IsEnabled) parent.configuredOptions = {};
                parent.configuredOptions[me.id] = !!(newVal || newVal === 0);
                parent.updateConfiguration();
            }, 300));
        }
    }, function () {
        var me = this,
            parent = me.getParentModel(),
            values, storedShopperValue;

        this.id = sanitize(this.AttributeFQN);

        parent.configuredOptions = parent.configuredOptions || {};

        if (!this.IsMultiValue) {
            $.each(this.Values(), function (ix, v) {
                if (v.IsSelected) {
                    parent.configuredOptions[me.id] = true;
                    me.Value(v.Value);
                    return false;
                }
            });
        }

        if (this.AttributeDetail.InputType !== "List") {
            values = this.Values();
            storedShopperValue = values[0] && values[0].ShopperEnteredValue;
            if (storedShopperValue || storedShopperValue === 0) this.ShopperEnteredValue(storedShopperValue);
            this.Value = ko.computed(function() {
                return me.ShopperEnteredValue();
            });
        }
        if (this.AttributeDetail.InputType === "Date" && this.AttributeDetail.Validation) {
            this.minDate = formatDate(this.AttributeDetail.Validation.MinDateValue);
            this.maxDate = formatDate(this.AttributeDetail.Validation.MaxDateValue);
        }

    });

    var Product = KnockoutVM.extend({
        mozuType: 'product',
        hasMessages: true,
        statics: {
            ProductCode: ''
        },
        observables: {
            Quantity: {
                numeric: 0,
                required: {
                    message: 'Please enter a product quantity above 0',
                    fn: function (val) {
                        return parseInt(val) > 0;
                    }
                }
            },
            VariationProductCode: {},
            PurchasableState: {}
        },
        submodels: {
            Price: PriceModels.ProductPrice,
            PriceRange: PriceModels.ProductPriceRange
        },
        submodelArrays: {
            Options: ProductOption
        },
        doNotSubmit: ["price", "config"],
        toJS: function () {
            // server expects the options collection to belong to this model as well
            var j = Product.prototype.toJS.apply(this);
            //j.options = this.config.emitAllOptions();
            return j;
        },
        getConfiguredOptions: function() {
            var me = this;
            return ko.utils.arrayMap(ko.utils.arrayFilter(me.Options(), function (opt) { return me.configuredOptions[opt.id]; }), function (i) { return i.toJS(); });
        },
        submit: function () {
            var self = this;
            if (this.validate()) {
                this.submitting(true);
                this.apiModel.prop('Options', this.getConfiguredOptions());
                this.addToCart(this.Quantity()).then(function (item) {
                    self.publish('addedtocart', item);
                });
            }
        },
        updateConfiguration: function () {
            var me = this;
            this.submitting(true);
            me.configure({ Options: this.getConfiguredOptions() }).then(function (conf) {
                me.submitting(false);
                me.Price.hasRange(!conf.data.Price);
            });
        },
    }, function constructProduct(conf) {
        var self = this;
        this.isPurchasable = ko.computed(function () {
            var pState = self.PurchasableState();
            return pState && pState.IsPurchasable;
        });
        self.Price.hasRange(!conf.Price);
    });


    return {
        Option: ProductOption,
        Product: Product,
        Option: ProductOption
    };

});


