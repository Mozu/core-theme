define(["jquery", "modules/knockout-plus", "modules/knockout-viewmodel", "modules/models-price", "modules/function-throttler"], function ($, ko, KnockoutVM, PriceModels, throttle) {

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
        //// choose serialization method at creation time   
        //// TODO: is this strategy pattern enough, or should these be subclasses of ProductOption?
        //this.toJS = optionSerializers[this.inputType] || optionSerializers.default;

        //// process values and add an observable for selectedness, for multi-select
        //var values = this.values(),
        //    selected = [];

        //if (!values || !values.length) return;

        //$.each(values, function (ix, val) {
        //    var isSelected = val.isSelected;
        //    val.isSelected = ko.observable(isSelected);
        //    if (isSelected) selected.push(val);
        //});

        //this.values(values);

        //if (selected.length === 1) this.value(selected[0].id);
        var parent = me.getParentModel();

        var me = this;
        if (!this.IsMultiValue) {
            $.each(this.Values(), function (ix, v) {
                if (v.IsSelected) {
                    parent.configuredOptions[me.AttributeFQN] = true;
                    me.Value(v.Value);
                    return false;
                }
            });
        }

        if (this.ShopperEnteredValue()) this.Value(this.ShopperEnteredValue());

        this.ShopperEnteredValue.subscribe(function (newVal) {
            me.Value(newVal);
        });

        this.Value.subscribe(throttle(function (newVal) {
            parent.configuredOptions[me.AttributeFQN] = !!(newVal || newVal === 0);
            parent.configure({ Options: ko.utils.arrayMap(ko.utils.arrayFilter(parent.Options(), function(opt) { return opt.AttributeFQN in parent.configuredOptions; }), function(i) { return i.toJS(); }) });
        }, 300, false));
        
    });

    //var optionSerializers = {
    //    "CheckBox": function () {
    //        return $.map(this.values(), function (val) {
    //            return val.isSelected() ? { id: val.id } : undefined;
    //        }) || undefined;
    //    },
    //    "Textbox": function () {
    //        var val = this.value();
    //        return val ? { id: this.id, value: val } : undefined;
    //    },
    //    default: function () {
    //        var val = this.value();
    //        if (!isNaN(Number(val))) { val = Number(val); }
    //        return val ? { id: val } : undefined;
    //    }
    //};

    //var ProductConfiguration = KnockoutVM.extend({
    //    endpoint: '/product/configure',
    //    statics: {
    //        productCode: ''
    //    },
    //    observables: {
    //        purchasableState: {},
    //        variationProductCode: {},
    //    },
    //    observableArrays: {
    //        options: {}
    //    },
    //    //doNotSubmit: ["purchasableState", "variationProductCode"],
    //    emitAllOptions: function () {
    //        var vm = this.options();
    //        if (vm) {
    //            return $.map(this.options(), function(opt) {
    //                return opt.toJS();
    //            });
    //        }
    //        return null;
    //    },
    //    toJS: function () {
    //        return {
    //            productCode: this.productCode,
    //            options: this.emitAllOptions()
    //        }
    //    }
    //}, function constructConfig(conf) {
    //    var self = this;
    //    // the public options collection must be computed, to give it a write function that creates ProductOption observables on the way in
    //    // extract current value
    //    var options = this.options();
    //    // private, underlying observablearray
    //    var _options = ko.observableArray();
    //    // public proxy observable
    //    this.options = ko.computed({
    //        write: function (newArray) {
    //            if ($.isArray(newArray)) {
    //                _options($.map(newArray, function (optionConf) {
    //                    return new ProductOption(optionConf);
    //                }));
    //            } else {
    //                // allow blanking the array out
    //                _options(null);
    //            }
    //        },
    //        read: _options
    //    });

    //    // now populate it
    //    this.options(options);

    //});

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
        submit: function () {
            var self = this;
            if (this.validate()) {
                this.submitting(true);
                this.addToCart(this.Quantity()).then(function (item) {
                    self.publish('addedtocart', item);
                });
            }
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


