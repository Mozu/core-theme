define(['modules/backbone-mozu', 'hyprlive', 'modules/jquery-mozu', 'underscore', 'hyprlivecontext', 'modules/views-modal-dialog', 'modules/api', 'modules/models-product', 'modules/views-location', 'modules/models-location'], function (Backbone, Hypr, $, _, HyprLiveContext, ModalDialogView, Api, ProductModels, LocationViews, LocationModels) {

    var ProductLocationView = Backbone.MozuView.extend({
        templateName: "modules/cart/discount-modal/discount-product-location",
        render: function () {
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


    var AddProductView = Backbone.MozuView.extend({
        templateName: "modules/product-picker/product",
        additionalEvents: {
            "change [data-mz-product-option]": "onOptionChange",
            "blur [data-mz-product-option]": "onOptionChange",
            "change [data-mz-value='quantity']": "onQuantityChange",
            "keyup input[data-mz-value='quantity']": "onQuantityChange"
        },
        render: function () {
            var me = this;
            // if (this.oldOptions) {
            //     me.model.get('options').map(function (option) {
            //         var oldOption = _.find(me.oldOptions, function (old) {
            //             return old.attributeFQN === option.get('attributeFQN');
            //         });
            //         if (oldOption) {
            //             option.set('values', oldOption.values);
            //         }
            //     });
            // }
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
        onBackToProductSelection: function (e) {
            var self = this;
            if (self.model._parent) {
                self.model._parent.render();
            }
        },
        completeProductConfiguration: function (e) {
            var self = this;
            e.preventDefault();
            self.model.trigger('configurationComplete', self);

            // try {
            //     self.model.addToCart(true).then(function () {
            //         this.model.parent.handleDialogCancel();
            //     });

            // } catch (error) {

            // }
            //Yeah lets intro some events on complete discount for a rerender
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
            var productModel = this.model;
            var pickerItemQuantity = window.views ? window.views.currentPane.model.get('pickerItemQuantity') : this.model.get('quantity');
            this.model.set('quantity', pickerItemQuantity);

              me.$('[data-mz-product-option]').each(function () {
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

            //   me.listenTo(me.model, 'optionsUpdated', function(){
            //       me.postponeRender = false;
            //       me.render();
            //   });
        }
    });


    var ProductModalView = ModalDialogView.extend({
        templateName: "modules/product-picker/product-modal",
        handleDialogOpen: function () {
            this.model.trigger('dialogOpen');
            this.bootstrapInstance.show();
        },
        handleDialogClose: function () {
            var self = this;
            if (self.model.messages) {
                self.model.messages.reset();
            }
            if (self._addProductView){
              self._addProductView.stopListening();
              self._addProductView.undelegateEvents();
            }
            self.bootstrapInstance.hide();
        },
        handleDialogCancel: function () {
            var self = this;
            if (self.model.messages) {
                self.model.messages.reset();
            }
            self._addProductView.stopListening();
            self._addProductView.undelegateEvents();
            self.bootstrapInstance.hide();
        },
        setInit: function () {
            var self = this;
            self.loadAddProductView();
            self.handleDialogOpen();
        },
        modalContentEl: function () {
            return this.$el.find('[data-mz-product-modal-content]');
        },
        loadAddProductView: function (product) {
            var self = this;

            var addProductView = new AddProductView({
                el: $(self.modalContentEl()),
                model: product,
                messagesEl: $(self.modalContentEl()).parent().find('[data-mz-message-bar]')
            });
            self._addProductView = addProductView;
            addProductView.render();
        },
        render: function () {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var self = this;
        }
    });

    return {
        'ModalView': ProductModalView,
        'AddProductView': AddProductView
    };
});
