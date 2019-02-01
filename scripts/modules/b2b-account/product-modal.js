define(['modules/backbone-mozu', 'hyprlive', 'modules/jquery-mozu', 'underscore', 'hyprlivecontext', 'modules/views-modal-dialog', 'modules/api', 'modules/models-product', 'modules/views-location', 'modules/models-location', 'modules/models-discount'], function (Backbone, Hypr, $, _, HyprLiveContext, ModalDialogView, Api, ProductModels, LocationViews, LocationModels, Discount) {

    var ChooseProductStepView = Backbone.MozuView.extend({
        templateName: "modules/cart/discount-modal/discount-choose-product",
        autoUpdate: [
        ],
        renderOnChange: [
        ],
        initialize: function () {
            var self = this;
            this.model.getDiscountProducts().then(function (discount) {
                self.render();
            });
        },
        //Rework for parent modal to be accessable once clicked
        onProductSelect: function (e) {
            var self = this;
            var $target = $(e.currentTarget);
            var productCode = $target.data("mzProductCode");

            var productModel = this.model.get('products').findWhere({ 'productCode': productCode + '' });

            if (productModel) {
                if (self._productStepView) {
                    self._productStepView.removeInner();
                }
                productModel._parent = this;
                var addProductStepView = new AddProductStepView({
                    el: self.el,
                    model: productModel
                });
                self._productStepView = addProductStepView;
                addProductStepView.render();
            }
        }
    });


    var AddProductStepView = Backbone.MozuView.extend({
        templateName: "modules/b2b-account/wishlists/product-modal",
        additionalEvents: {
            "change [data-mz-product-option]": "onOptionChange",
            "blur [data-mz-product-option]": "onOptionChange",
            "change [data-mz-value='quantity']": "onQuantityChange",
            "keyup input[data-mz-value='quantity']": "onQuantityChange"
        },
        render: function () {
            var me = this;
            if (this.oldOptions) {
                me.model.get('options').map(function (option) {
                    var oldOption = _.find(me.oldOptions, function (old) {
                        return old.attributeFQN === option.get('attributeFQN');
                    });
                    if (oldOption) {
                        option.set('values', oldOption.values);
                    }
                });
            }
            Backbone.MozuView.prototype.render.apply(this);
            this.$('[data-mz-is-datepicker]').each(function (ix, dp) {
                $(dp).dateinput().css('color', Hypr.getThemeSetting('textColor')).on('change  blur', _.bind(me.onOptionChange, me));
            });
        },
        onOptionChange: function (e) {
            return this.configure($(e.currentTarget));
        },
        onQuantityChange: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val(), 10);
            if (!isNaN(newQuantity)) {
                this.model.updateQuantity(newQuantity);
            }
        }, 500),
        configure: function ($optionEl) {
            var newValue = $optionEl.val(),
                oldValue,
                id = $optionEl.data('mz-product-option'),
                optionEl = $optionEl[0],
                isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                option = this.model.get('options').findWhere({ 'attributeFQN': id });
            if (option) {
                if (option.get('attributeDetail').inputType === "YesNo") {
                    option.set("value", isPicked);
                } else if (isPicked) {
                    oldValue = option.get('value');
                    if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                        option.set('value', newValue);
                        this.oldOptions = this.model.get('options').toJSON();
                    }
                }
            }
        },
        addToCart: function (e) {
            var self = this;
            e.preventDefault();
            try {
                 self.model.addToCart(true).then(function () {
                     this.model.parent.handleDialogCancel();
                });     
                
            } catch (error) {

            }
            //Yeah lets intro some events on complete discount for a rerender
        },
        addToWishlist: function () {
            this.model.addToWishlist();
        }
    });


    var ModalView = ModalDialogView.extend({
        templateName: "modules/b2b-account/product-modal",
        // initialize: function () {
        //     var self = this;
        //     ModalDialogView.prototype.initialize.apply(this, arguments);
        // },
        handleDialogOpen: function () {
            this.model.trigger('dialogOpen');
            this.bootstrapInstance.show();
        },
        handleDialogCancel: function () {
            this.model.trigger('dialogClose');
            this.bootstrapInstance.hide();
        },
        setInit: function (updatingItemId) {
            var self = this;
            self.loadAddProductView();
            self.handleDialogOpen();   
        },
        modalContentEl: function () {
            return this.$el.find('[data-mz-discount-modal-content]');
        },
        loadProductSelectionView: function () {
            var self = this;
            var chooseProductStepView = new ChooseProductStepView({
                el: $(self.modalContentEl()),
                model: self.model.get('items')
            });
            self._chooseProductView = chooseProductStepView;
            //chooseProductStepView.render();
        },
        loadAddProductView: function (product) {
            var self = this;
            if (!(product instanceof ProductModels.Product)) {
                if (product.toJSON)
                    product = product.toJSON();
                product = new ProductModels.Product(product);
            }
            var addProductStepView = new AddProductStepView({
                el: $(self.modalContentEl()),
                model: product
            });
            self._addProductStepView = addProductStepView;
            addProductStepView.render();
        },
        render: function () {
            //Backbone.MozuView.prototype.render.apply(this, arguments);
            var self = this;
            self.setInit();
        }
    });

    return ModalView;

});