define(["jquery", "modules/knockout-plus", "modules/knockout-viewmodel"], function ($, ko, KnockoutVM) {

    var ProductOption = KnockoutVM.extend({
        statics: {
            id: '',
            inputType: '',
            name: '',
        },
        observables: {
            value: {}
        },
        observableArrays: {
            values: {}
        }
    }, function () {
        // choose serialization method at creation time   
        // TODO: is this strategy pattern enough, or should these be subclasses of ProductOption?
        this.toJS = optionSerializers[this.inputType] || optionSerializers.default;


        // process values and add an observable for selectedness, for multi-select
        var values = this.values(),
            selected = [];

        if (!values || !values.length) return;

        $.each(values, function (ix, val) {
            var isSelected = val.isSelected;
            val.isSelected = ko.observable(isSelected);
            if (isSelected) selected.push(val);
        });

        this.values(values);

        if (selected.length === 1) this.value(selected[0].id);
    });

    var optionSerializers = {
        "CheckBox": function () {
            return $.map(this.values(), function (val) {
                return val.isSelected() ? { id: val.id } : undefined;
            }) || undefined;
        },
        "Textbox": function () {
            var val = this.value();
            return val ? { id: this.id, value: val } : undefined;
        },
        default: function () {
            var val = this.value();
            if (!isNaN(Number(val))) { val = Number(val); }
            return val ? { id: val } : undefined;
        }
    };

    var ProductConfiguration = KnockoutVM.extend({
        endpoint: '/product/configure',
        statics: {
            productCode: ''
        },
        observables: {
            purchasableState: {},
            variationProductCode: {},
        },
        observableArrays: {
            options: {}
        },
        //doNotSubmit: ["purchasableState", "variationProductCode"],
        emitAllOptions: function () {
            var vm = this.options();
            if (vm) {
                return $.map(this.options(), function(opt) {
                    return opt.toJS();
                });
            }
            return null;
        },
        toJS: function () {
            return {
                productCode: this.productCode,
                options: this.emitAllOptions()
            }
        }
    }, function constructConfig(conf) {
        var self = this;
        // the public options collection must be computed, to give it a write function that creates ProductOption observables on the way in
        // extract current value
        var options = this.options();
        // private, underlying observablearray
        var _options = ko.observableArray();
        // public proxy observable
        this.options = ko.computed({
            write: function (newArray) {
                if ($.isArray(newArray)) {
                    _options($.map(newArray, function (optionConf) {
                        return new ProductOption(optionConf);
                    }));
                } else {
                    // allow blanking the array out
                    _options(null);
                }
            },
            read: _options
        });

        // now populate it
        this.options(options);

    });

    var ProductPrice = KnockoutVM.extend({
        observables: {
            Price: { numeric: 2 },
            SalePrice: { numeric: 2 },
            DiscountId: {},
            DiscountName: {},
            OfferPrice: { numeric: 2 }
        }
    }, function constructProductPrice() {
        var me = this;
        this.hasSalePrice = ko.computed(function () {
            return !isNaN(me.SalePrice());
        });
        this.hasRange = ko.computed(function () {
            return !isNaN(me.LowerBoundPrice + me.UpperBoundPrice);
        });
    });

    var Product = KnockoutVM.extend({
        mozuType: 'product',
        hasMessages: true,
        statics: {
            ProductCode: ''
        },
        observables: {
            Quantity: { numeric: 0 },
            VariationProductCode: {},
            PurchasableState: {}
        },
        submodels: {
            Price: ProductPrice,
            config: ProductConfiguration
        },
        doNotSubmit: ["price", "config"],
        toJS: function () {
            // server expects the options collection to belong to this model as well
            var j = Product.prototype.toJS.apply(this);
            j.options = this.config.emitAllOptions();
            return {
                Product: j,
                Quantity: this.Quantity()
            };
        },
        submit: function () {
            this.addToCart(this.toJS());
        }
    }, function constructProduct() {
        var self = this;
        this.config.productCode = this.ProductCode;
        this.isPurchasable = ko.computed(function () {
            var pState = self.PurchasableState();
            return pState && pState.IsPurchasable;
        });
    });


    return {
        Option: ProductOption,
        Price: ProductPrice,
        Product: Product,
        Configuration: ProductConfiguration
    };

});