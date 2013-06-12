define(["jquery", "modules/knockout-plus", "modules/knockout-viewmodel", "modules/models-price", "modules/function-throttler"], function ($, ko, KnockoutVM, PriceModels, throttle) {

    function sanitize(str) {
        return str.replace(/[\s~'"]+/g, '-');
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
            this.minDate = new Date(Date.parse(this.AttributeDetail.Validation.MinDateValue) + (new Date).getTimezoneOffset() * 60000);
            this.maxDate = new Date(Date.parse(this.AttributeDetail.Validation.MaxDateValue) + (new Date).getTimezoneOffset() * 60000);
        }

        // race condition with change events from setting up datepickers etc. this should cover it
        setTimeout(function () {
            me.Value.subscribe(throttle(function (newVal) {
                parent.configuredOptions[me.id] = !!(newVal || newVal === 0);
                parent.updateConfiguration();
            }, 300, false));
        }, 750);

        // view needs to attach datepickers and other controls, so we need to know when these things are created
        parent.publish('optioncreated', this);

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
            Price: PriceModels.ProductPrice
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
            return ko.utils.arrayMap(ko.utils.arrayFilter(me.Options(), function (opt) { return opt.id in me.configuredOptions; }), function (i) { return i.toJS(); });
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
            me.configure({ Options: this.getConfiguredOptions() });
        }
    }, function constructProduct() {
        var self = this;
        this.isPurchasable = ko.computed(function () {
            var pState = self.PurchasableState();
            return pState && pState.IsPurchasable;
        });

    });


    return {
        Option: ProductOption,
        Product: Product,
        Option: ProductOption
    };

});


