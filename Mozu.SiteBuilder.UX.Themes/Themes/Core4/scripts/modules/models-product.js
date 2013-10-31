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
        idAttribute: "attributeFQN",
        initialize: function () {
            var me = this;
            _.defer(function () {
                me.listenTo(me.collection, 'invalidoptionselected', this.handleInvalid, this);
            });
            me.on("change:value", _.debounce(function (model, newVal) {
                var newValObj, values = me.get("values");
                newVal = $.trim(newVal);
                if (newVal) {
                    _.each(values, function (fvalue) {
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
                }
                else {
                    me.unset('value');
                    me.unset("shopperEnteredValue");
                }
                if (newValObj && !newValObj.isEnabled) me.trigger('invalidoptionselected', newValObj, me);
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
        parse: function (raw) {
            var selectedValue, storedShopperValue;
            if (!raw.isMultiValue) {
                selectedValue = _.findWhere(raw.values, { isSelected: true });
                if (selectedValue) raw.value = selectedValue.value;
            }
            if (raw.attributeDetail.inputType !== "List") {
                storedShopperValue = raw.values[0] && raw.values[0].shopperEnteredValue;
                if (storedShopperValue || storedShopperValue === 0) this.set({
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
        helpers: ['mainImage'],
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
                msg: require.mozuLabel('enterProductQuantity')
            }
        },
        relations: {
            content: ProductContent,
            price: PriceModels.ProductPrice,
            options: Backbone.Collection.extend({
                model: ProductOption
            })
        },
        initialize: function() {
            this.listenTo(this.get("options"), "optionchange", this.updateConfiguration, this);
            this.set({ url: "/product/" + this.get("productCode") });
            this.lastConfiguration = [];
        },
        mainImage: function () {
            var imgs = this.get('content').get("productImages"),
                img = imgs && imgs[0];
            return img || { imageUrl: 'http://placehold.it/160&text=' + require.mozuLabel('noImages') }
        },
        getConfiguredOptions: function() {
            return _.invoke(this.get("options").filter(function(opt) {
                return opt.has("value") || opt.has("shopperEnteredValue");
            }), 'toJSON');
        },
        addToCart: function() {
            var me = this;
            if (!this.validate()) {
                this.apiModel.prop("options", this.getConfiguredOptions());
                this.apiAddToCart(this.get("quantity")).then(function(item) {
                    me.trigger('addedtocart', item);
                });
            }
        },
        updateConfiguration: _.debounce(function () {
            var newConfiguration = this.getConfiguredOptions();
            if (JSON.stringify(this.lastConfiguration) !== JSON.stringify(newConfiguration)) {
                this.lastConfiguration = newConfiguration;
                this.apiConfigure({ options: newConfiguration });
            }
        },400)
    });

    return {
        Product: Product,
        Option: ProductOption
    };

});


