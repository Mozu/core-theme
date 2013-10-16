define(["modules/jquery-mozu", "shim!vendor/underscore>_", "modules/backbone-mozu", "modules/models-price"], function ($, _, Backbone, PriceModels) {

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
        idAttribute: "AttributeFQN",
        initialize: function () {
            var me = this;
            _.defer(function () {
                me.listenTo(me.collection, 'invalidoptionselected', this.handleInvalid, this);
            });
            me.on("change:Value", _.debounce(function (model, newVal) {
                var newValObj, values = me.get("Values");
                newVal = $.trim(newVal);
                if (newVal) {
                    _.each(values, function (value) {
                        if (value.Value.toString() === newVal.toString()) {
                            newValObj = value;
                            value.IsSelected = true;
                            me.set("Value", newVal);
                        } else {
                            value.IsSelected = false;
                        }
                    });
                    me.set("Values", values);
                    if (me.get("AttributeDetail").InputType !== "List") {
                        me.set("ShopperEnteredValue", newVal);
                    }
                }
                else {
                    me.unset('Value');
                    me.unset("ShopperEnteredValue");
                }
                if (newValObj && !newValObj.IsEnabled) me.trigger('invalidoptionselected', newValObj, me);
                me.trigger('optionchange', newVal, me);
            }, 300));
        },
        handleInvalid: function(newValObj, opt) {
            if (!(this === opt)) {
                this.unset("Value");
                _.each(this.get("Values"), function(value) {
                    value.IsSelected = false;
                });
            }
        },
        parse: function (raw) {
            var selectedValue, storedShopperValue;
            if (!raw.IsMultiValue) {
                selectedValue = _.findWhere(raw.Values, { IsSelected: true });
                if (selectedValue) raw.Value = selectedValue.Value;
            }
            if (raw.AttributeDetail.InputType !== "List") {
                storedShopperValue = raw.Values[0] && raw.Values[0].ShopperEnteredValue;
                if (storedShopperValue || storedShopperValue === 0) this.set({
                    ShopperEnteredValue: storedShopperValue,
                    Value: storedShopperValue
                });
            }
            if (raw.AttributeDetail.InputType === "Date" && raw.AttributeDetail.Validation) {
                raw.MinDate = formatDate(this.AttributeDetail.Validation.MinDateValue);
                raw.MaxDate = formatDate(this.AttributeDetail.Validation.MaxDateValue);
            }
            return raw;
        }
    }),

    ProductContent = Backbone.MozuModel.extend({
        helpers: ['MainImage'],
        MainImage: function () {
            var imgs = this.get("ProductImages"),
                img = imgs && imgs[0];
            return img || { ImageUrl: 'http://placehold.it/160&text=Missing+Photo' }
        }
    }),

    Product = Backbone.MozuModel.extend({
        mozuType: 'product',
        idAttribute: 'ProductCode',
        handlesMessages: true,
        helpers: ['hasPriceRange'],
        defaults: {
            PurchasableState: {},
            Quantity: 1
        },
        dataTypes: {
            Quantity: Backbone.MozuModel.DataTypes.Int
        },
        validation: {
            Quantity: {
                min: 1,
                msg: 'Please enter a product quantity above 0'
            }
        },
        relations: {
            Content: ProductContent,
            Price: PriceModels.ProductPrice,
            Options: Backbone.Collection.extend({
                model: ProductOption
            })
        },
        initialize: function() {
            this.listenTo(this.get("Options"), "optionchange", this.updateConfiguration, this);
            this.set({ Url: "/product/" + this.get("ProductCode") });
            this.lastConfiguration = [];
        },
        hasPriceRange: function() {
            return !!this.apiModel.prop('PriceRange');
        },
        getConfiguredOptions: function() {
            return _.invoke(this.get("Options").filter(function(opt) {
                return opt.has("Value") || opt.has("ShopperEnteredValue");
            }), 'toJSON');
        },
        addToCart: function() {
            var me = this;
            if (!this.validate()) {
                this.apiModel.prop("Options", this.getConfiguredOptions());
                this.apiAddToCart(this.get("Quantity")).then(function(item) {
                    me.trigger('addedtocart', item);
                });
            }
        },
        updateConfiguration: _.debounce(function () {
            var newConfiguration = this.getConfiguredOptions();
            if (JSON.stringify(this.lastConfiguration) !== JSON.stringify(newConfiguration)) {
                this.lastConfiguration = newConfiguration;
                this.apiConfigure({ Options: newConfiguration });
            }
        },400)
    });

    return {
        Product: Product,
        Option: ProductOption
    };

});


