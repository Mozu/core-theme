define(['modules/backbone-mozu', 'hyprlive', 'modules/jquery-mozu', 'underscore', 'hyprlivecontext', 'modules/views-modal-dialog', 'modules/api', 'modules/models-product', 'modules/views-location', 'modules/models-location', 'modules/models-discount'], function (Backbone, Hypr, $, _, HyprLiveContext, ModalDialogView, Api, ProductModels, LocationViews, LocationModels, Discount) {

    var ChooseProductStepView = Backbone.MozuView.extend({
        templateName: "modules/cart/discount-modal/discount-choose-product",
        autoUpdate: [
        ],
        renderOnChange: [
        ],
        initialize: function () {
            var self = this;
            this.model.getDiscountProducts().then(function(discount){
                self.render();
            });
        },
        onProductSelect: function(e){
            var self = this;
            var $target = $(e.currentTarget);
            var productCode = $target.data("mzProductCode");

            var productModel = this.model.get('products').findWhere({ 'productCode': productCode + ''});

            if (productModel)
            {
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

    var ProductLocationView = Backbone.MozuView.extend({
        templateName: "modules/cart/discount-modal/discount-product-location",
        render: function(){
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var $locationSearch = $('#location-list'),
                product = this.model,
                productPresent = !!this.model.get('productCode'),
                locationsCollection = new LocationModels.LocationCollection(),
                ViewClass = productPresent ? LocationViews.LocationsSearchView : LocationViews.LocationsView,
                view = new ViewClass({
                    model: locationsCollection,
                    el: $locationSearch
                });

            if (productPresent) view.setProduct(product);
            window.lv = view;
        }

    });


    var AddProductStepView = Backbone.MozuView.extend({
        templateName: "modules/cart/discount-modal/discount-add-product",
        additionalEvents: {
            "change [data-mz-product-option]": "onOptionChange",
            "blur [data-mz-product-option]": "onOptionChange",
            "change [data-mz-value='quantity']": "onQuantityChange",
            "keyup input[data-mz-value='quantity']": "onQuantityChange"
        },
        render: function () {
            var me = this; 
            if (this.oldOptions) {
                me.model.get('options').map(function(option){
                    var oldOption = _.find(me.oldOptions, function(old){
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
                var discountModel = self.model.collection.parent.parent;
                if (discountModel) {
                    var cartItem = discountModel.get('selectedCartItem');
                    if (cartItem) {
                        discountModel.parent.removeItem(cartItem).then(function () {
                            self.model.addToCart(true).then(function () {
                                discountModel.completeDiscount();
                                discountModel.trigger('newDiscountSet');
                            });
                        });
                        return;
                    }
                    self.model.addToCart(true).then(function () {
                        discountModel.completeDiscount();
                        discountModel.trigger('newDiscountSet');
                    });
                }
            } catch(error) {}
        },
        addToWishlist: function () {
            this.model.addToWishlist();
        },
        checkLocalStores: function (e) {
            var me = this;
            e.preventDefault();
            this.model.whenReady(function () {
                var productLocationView = new ProductLocationView({
                    el: $('.mz-product-locations'),
                    model: me.model
                });

                productLocationView.render();
            });

        },
        initialize: function () {
            // handle preset selects, etc
            var me = this;
            this.$('[data-mz-product-option]').each(function () {
                var $this = $(this), isChecked, wasChecked;
                if ($this.val()) {
                    switch ($this.attr('type')) {
                        case "checkbox":
                        case "radio":
                            isChecked = $this.prop('checked');
                            wasChecked = !!$this.attr('checked');
                            if ((isChecked && !wasChecked) || (wasChecked && !isChecked)) {
                                me.configure($this);
                            }
                            break;
                        default:
                            me.configure($this);
                    }
                }
            });
        }
    });


	var DiscountModalView = ModalDialogView.extend({
        templateName: "modules/cart/discount-modal/discount-modal",
        initialize: function () {
            var self = this;
            this.listenTo(this.model, 'newDiscountSet', function () {
                self.render();
            });
            ModalDialogView.prototype.initialize.apply(this, arguments);
        },
        handleDialogOpen : function(){
            this.model.trigger('dialogOpen');
            this.bootstrapInstance.show();
        },
        handleDialogCancel: function(){
            var self = this;

            this.model.completeDiscount();
            if (this._productStepView) {
                this._productStepView.removeInner();
            }
            window.cartView.cartView.model.set('discountId', self.model.get('discount').get('discountId'));
            window.cartView.cartView.model.apiRejectSuggestedDiscount();
            this.render();
            
        },
        setInit: function (updatingItemId){
            var self = this;
            if (this.model.hasNextDiscount()) {
                this.model.loadNextDiscount().then(function(){
                    if (!self.model.hasMultipleProducts() && self.model.productHasOptions()) {
                        self.loadAddProductView();
                        self.handleDialogOpen();
                    } else if (self.model.hasMultipleProducts()) {
                        self.loadProductSelectionView();
                        self.handleDialogOpen();
                    } else if (self.model.isDiscountAutoAdd()) {
                        self.model.autoAddProduct().ensure(function(data){
                            self.model.completeDiscount();
                            self.render();
                        });
                    }
                });
            } else {
                this.model.trigger('dialogCancel');
                window.cartView.cartView.model.fetch().then(function () {
                    window.cartView.cartView.render();
                });
                this.bootstrapInstance.hide();
            }
        },
        modalContentEl: function () {
            return this.$el.find('[data-mz-discount-modal-content]');
        },
        loadProductSelectionView: function () {
            var self = this;
            if (self._chooseProductView) {
                self._chooseProductView.removeInner();
            }
            var chooseProductStepView = new ChooseProductStepView({
                el: $(self.modalContentEl()),
                model: self.model.get('discount')
            });
            self._chooseProductView = chooseProductStepView;
        },
        loadAddProductView: function () {
            var self = this;
            if(self._productStepView) {
                self._productStepView.removeInner();
            }
            var addProductStepView = new AddProductStepView({
                el: $(self.modalContentEl()),
                model: self.model.get('discount').get('products').at(0)
            });
            self._productStepView = addProductStepView;
            addProductStepView.render();
        },
        updateSelectedAutoAddItem : function(cartItemId, discountId) {
            var self = this;
            Api.action('discounts', 'get', {
                discountId: discountId
            }).then(function (discount) {
                var newDiscount = new Discount({
                    discountId: discount.discountId,
                    autoAdd: true,
                    hasMultipleProducts: true,
                    hasOptions: false
                });
                self.model.set('discounts', new Backbone.Collection([newDiscount]));
                self.model.set('selectedCartItem', cartItemId);
                self.handleDialogOpen();
                self.setInit();
            });
        },
        render : function() {
            var self = this;
            self.setInit();
        }
	});

	return DiscountModalView;
});
