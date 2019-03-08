define(['modules/backbone-mozu', 'hyprlive', 'modules/jquery-mozu', 'underscore', 'hyprlivecontext', 'modules/views-modal-dialog', 'modules/api', 'modules/models-product', 'modules/views-location', 'modules/models-location', 'modules/models-discount', "modules/views-productimages", "modules/dropdown"], function (Backbone, Hypr, $, _, HyprLiveContext, ModalDialogView, Api, ProductModels, LocationViews, LocationModels, Discount, ProductImageViews, Dropdown) {

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

    var reduceByOption = function(option, variations) {
        var filteredVriations = _.filter(variations, function(variation){
            return _.find(variation.options, function(o){
                if(option.get('value')) {
                    return o.attributeFQN === option.get('attributeFQN') && o.value === option.get('value');
                }
                return true;
            });
        });
        return filteredVriations;     
    };
    
    var hasOtherOptions = function(variation, options, selectedOptionsMap){
        var newTestVariationList = [];
        _.each(options, function(optionVariations, idx){
            var otherOptions = _.filter(options, function(o, index){
                return idx !== index;
            });
            _.each(optionVariations.value, function(optionVariation, idx){
                var variationAvailable = true;
                _.each(otherOptions, function(variations){
                    var hasVariation = _.find(variations.value, function(variation){
                        return variation.productCode === optionVariation.productCode;
                    });
                    if(!hasVariation) variationAvailable = false;
                });

                if(variationAvailable){
                    newTestVariationList.push(optionVariation);
                }
            });
        });
        return newTestVariationList;
    };

    var markOptions = function(optionName, variationsToMark, selectedOptionsMap){
        var reRunForSelected = false;
        this.model.get('options').each(function(o){
            var clearSelectedOption = false;
            var variationOptionMap = _.map(variationsToMark, function(variation){
                var option = _.findWhere(variation.options, {attributeFQN: optionName});
                if(option) return option.value;
                
            });
            
            o.get('values').forEach(function(opt){
                var hasOption = -1;
                
                if( o.get('attributeFQN') === optionName) {
                    opt.isEnabled = false;
                    hasOption = variationOptionMap.indexOf(opt.value);

                    if(hasOption != -1) {
                        opt.isEnabled = true; 
                    } else {
                        if(o.get('value') === opt.value && selectedOptionsMap.get('attributeFQN') !== o.get('attributeFQN')) {
                            clearSelectedOption = true;
                        }
                    }
                }
            });
            if (clearSelectedOption) {
                o.set('value', "");
                reRunForSelected = true; 
            }
        });
        return reRunForSelected;
    };

    var markEnabledConfigOptions = function(selectedOptionsMap){
        var self = this;
        var variations = this.model.get('variations');
        var avaiableOptionsMap = [];
        if (variations.length) {

            //We loop through options twice in order to ensure we have selected vales accounted for
            //Probably a better way to do this.
            this.model.get('options').each(function(o){
                avaiableOptionsMap.push({'key' : o.get('attributeFQN'), 'value': []});
                self.model.get('options').each(function(o2){
                    if(o2.get('attributeFQN') === o.get('attributeFQN')) {
                        var option = _.find(avaiableOptionsMap, function(ao){
                            return ao.key === o.get('attributeFQN');
                        });
                        option.value = reduceByOption(o, variations);
                    }
                });
            });

            var rerun = false;
            _.each(avaiableOptionsMap, function(ao, index){
                var otherOptions = _.filter(avaiableOptionsMap, function(o, idx){
                    return idx !== index;
                });
                var variation = {};
                var otherOpts = hasOtherOptions(variation, otherOptions, selectedOptionsMap);

                if(markOptions.call(self, ao.key, otherOpts, selectedOptionsMap)) {
                    rerun = true;
                }
            });

            if(rerun) {
                markEnabledConfigOptions.call(self, selectedOptionsMap);
            }
        }
    };

    var AddProductStepView = Backbone.MozuView.extend({
        templateName: "modules/cart/discount-modal/discount-add-product",
        additionalEvents: {
            "change [data-mz-product-option]": "onOptionChange",
            "change [data-mz-value='quantity']": "onQuantityChange",
            "keyup input[data-mz-value='quantity']": "onQuantityChange"
        },
        render: function () {
            var me = this;
            if (!me.postponeRender) {
                if (this.oldOptions) {
                    me.model.get('options').map(function(option){
                        var oldOption = _.find(me.oldOptions, function(old){
                            return old.attributeFQN === option.get('attributeFQN');
                        });
                        if (oldOption) {
                            option.set('values', oldOption.values);
                        }
                    });
                } else {
                    var selectedOptionsMap = me.model.get('options').map(function(o){
                        return { attributeFQN: {value: o .value}};
                    });
                    if(selectedOptionsMap) {
                        markEnabledConfigOptions.call(this, selectedOptionsMap);
                    }
                }
                
                Backbone.MozuView.prototype.render.apply(this);
                this.$('[data-mz-is-datepicker]').each(function (ix, dp) {
                    $(dp).dateinput().css('color', Hypr.getThemeSetting('textColor')).on('change  blur', _.bind(me.onOptionChange, me));
                });
                var productImagesView = new ProductImageViews.ProductPageImagesView({
                    el: $('[data-mz-productimages]'),
                    model: me.model
                });
                Dropdown.init({
                    onSelect: function(e, value){
                        var id = $(e.currentTarget).data('mz-product-option');
                        me.dropdownConfig(id, value);
                    }
                });
            }
        },
        onOptionChange: function (e) {
            return this.configure($(e.currentTarget));
        },
        onBackToProductSelection: function (e) {
            var self = this;
            if (self.model._parent) {
                self.model._parent.render();
            }
        },
        onQuantityChange: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val(), 10);
            if (!isNaN(newQuantity)) {
                this.model.updateQuantity(newQuantity);
            }
        }, 500),
        dropdownConfig: function(id, value){
            var option = this.model.get('options').findWhere({ 'attributeFQN': id });
            if (option) {
                var oldValue = option.get('value');
                if (oldValue !== value && !(oldValue === undefined && value === '')) {
                    option.set('value', value);
                    
                    if(option.get('attributeDetail').usageType !== 'Extra') {
                        markEnabledConfigOptions.call(this, option);
                    }
            
                    this.oldOptions = this.model.get('options').toJSON();
                    this.postponeRender = true;
                }
            }
        },
        configure: function ($optionEl) {
            var newValue = $optionEl.val(),
                oldValue,
                id = $optionEl.data('mz-product-option'),
                optionEl = $optionEl[0],
                isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                option = this.model.get('options').findWhere({ 'attributeFQN': id }),
                self = this;
            if (option) {
                if (option.get('attributeDetail').inputType === "YesNo") {
                    option.set("value", isPicked);
                } else if (isPicked) {
                    oldValue = option.get('value');
                    if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                        option.set('value', newValue);
                        
                        if(option.get('attributeDetail').usageType !== 'Extra') {
                            markEnabledConfigOptions.call(this, option);
                        }
                
                        this.oldOptions = this.model.get('options').toJSON();
                        this.postponeRender = true;
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
            me._variationMap = window.cartView.discountModalView.model.get('discount').get('productCodes');
            var selectedVariations = _.filter(me.model.get('variations'), function(variation){
                return  _.find(me._variationMap, function(productCode){
                    return variation.productCode === productCode;
                });
            });

            this.model.set('variations', selectedVariations);
            me.listenTo(me.model, 'optionsUpdated', function(){
                me.postponeRender = false;
                me.render();
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
