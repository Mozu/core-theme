define(["jquery", "modules/knockout-plus", "modules/ko-component", "i18n!nls/messages"], function ($, ko, KOComponent, genericMsg) {

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
        "default": function () {
            var val = this.value();
            if (!isNaN(Number(val))) { val = Number(val); }
            return val ? { id: val } : undefined;
        }
    };

    var ProductOption = KOComponent.extend({
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

    var Product = KOComponent.extend({
        endpoint: '/product',
        observables: {
            quantity: { numeric: 0 },
            productCode: '',
            purchasableState: {},
            price: {
                nested: {
                    price: { numeric: 2 },
                    salePrice: { numeric: 2 },
                    discountId: {},
                    discountName: {},
                    hasSalePrice: {},
                    hasDiscount: {},
                    hasRange: {},
                    offerPrice: { numeric: 2 }
                }
            }
        },
        submodels: {
            options: ProductOption
        },
        unknownError: function () {
            this.messages.push({ message: genericMsg.UnexpectedError });
        },
        getUri: function () {
            return this.endpoint + "/" + this.productCode() + "?" + $.param({ options: $.map(this.options(), function (opt) { return this.toJS(); }) });
        },
        addToCart: function () {
            var self = this,
                cartAction = this.getLink('addtocart');

            if (!cartAction) return this.messages.push({ message: genericMsg.AddToCartForbidden });

            return this.create({
                url: cartAction.href
            }).done(function () {
                self.trigger('addtocart');
            });
        }
    }, function constructProduct() {
        var self = this;
        this.hasOptions = ko.computed(function () {
            return self.options().length > 0;
        });
    });

    return {
        Option: ProductOption,
        Product: Product
    };

});