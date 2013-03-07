define(["jquery", "modules/knockout-plus", "modules/knockout-viewmodel", "i18n!nls/messages"], function ($, ko, KnockoutVM, genericMsg) {

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
            price: { numeric: 2 },
            salePrice: { numeric: 2 },
            discountId: {},
            discountName: {},
            hasSalePrice: {},
            hasDiscount: {},
            hasRange: {},
            offerPrice: { numeric: 2 }
        }
    });

    var Product = KnockoutVM.extend({
        mozuType: 'product',
        endpoint: '/cart/addproduct',
        statics: {
            ProductCode: ''
        },
        observables: {
            quantity: { numeric: 0 },
            variationProductCode: {}
        },
        submodels: {
            price: ProductPrice,
            config: ProductConfiguration
        },
        doNotSubmit: ["price", "config"],
        toJS: function () {
            // server expects the options collection to belong to this model as well
            var j = Product.prototype.toJS.apply(this);
            j.options = this.config.emitAllOptions();
            return j;
        },
        submit: function() {
            var me = this;
            this.addtocart({ Product: this.toJS(), Quantity: this.quantity() }).then(function (cartitem) {
                $.each(me.updateCallbacks, function (ix, fn) {
                    fn.call(me, cartitem);
                });
            });
        },
        unknownError: function () {
            this.messages.push({ message: genericMsg.UnexpectedError });
        }
    }, function constructProduct() {
        var self = this;
        this.config.productCode = this.productCode;
        this.isPurchasable = ko.computed(function () {
            var pState = self.config.purchasableState();
            return pState && pState.isPurchasable;
        });

        var messages = this.messages = ko.observableArray([]);
        this.removeMessage = function (msg) {
            messages.remove(msg);
        };

    });


    return {
        Option: ProductOption,
        Price: ProductPrice,
        Product: Product,
        Configuration: ProductConfiguration
    };

});