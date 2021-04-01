define([
    "modules/jquery-mozu",
    'modules/api',
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "hyprlivecontext",
    "modules/product-picker/product-modal-view",
    "modules/product-picker/product-picker-view",
    "modules/models-product",
    "modules/models-quotes",
    'modules/models-b2b-account',
    'modules/models-location',
    'modules/modal-dialog',
    'modules/models-customer',
    'modules/b2b-account/add-new-address'
], function ($, api, _, Hypr, Backbone, HyprLiveContext, ProductModalViews,
    ProductPicker, ProductModels, QuoteModels, B2BAccountModels, LocationModels, modalDialog, CustomerModels, Address) {
    var timeout = null;
    var adjustmentSubtract = "Subtract";
    var adjustmentAdd = "Add";
    var defaultAdjustmentType = "$";
    var applyToDraft = 'ApplyToDraft';
    var applyAndCommit = 'ApplyAndCommit';
    var currentCurrencySymbol = require.mozuData('pagecontext').currencyInfo.symbol;
    var addNewAddressViewPopup = new Address.AddNewAddressView({ model: new QuoteModels.Quote(require.mozuData("quote") || {}) });

    var QuoteEditView = Backbone.MozuView.extend({
        templateName: 'modules/b2b-account/quotes/edit-quote',
        initialize: function () {
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
        },
        render: function () {
            var self = this;

            //get adjustments
            self.model.set("quoteUpdatedAdjustments", self.getQuoteAdjustment());

            //populate user details on model
            self.populateWithUsers();

            self.addUserInfoOnModel();

            self.model.set('isShippable', self.isShippable());

            self.model.set("isUserAdmin", require.mozuData('user').behaviors.includes(1000));
            self.model.set("isUserPurchaser", require.mozuData('user').behaviors.includes(1005));

            self.model.set('isSalesRep', require.mozuData('user').isSalesRep);
            self.model.set('hasPricelist', self.hasPricelist());

            self.setModifiedContact();

            //render product picker
            self.renderProductPicker();

            //wire up all the events on controls
           
            var newProductSubtotal = self.model.apiModel.data.subTotal - self.model.apiModel.data.orderLevelProductDiscountTotal - self.model.apiModel.data.itemLevelProductDiscountTotal;
            self.onQuoteAdjustmentChange('#quoteAdjustmentSection', 'adjustment', newProductSubtotal);

            var newShippingSubtotal = self.model.apiModel.data.shippingSubTotal - self.model.apiModel.data.orderLevelShippingDiscountTotal - self.model.apiModel.data.itemLevelShippingDiscountTotal;
            self.onQuoteAdjustmentChange('#shippingAdjustmentSection', 'shippingAdjustment', newShippingSubtotal);

            var newHandlingSubtotal = self.model.apiModel.data.handlingSubTotal - self.model.apiModel.data.orderLevelHandlingDiscountTotal - self.model.apiModel.data.itemLevelHandlingDiscountTotal;
            self.onQuoteAdjustmentChange('#handlingAdjustmentSection', 'handlingAdjustment', newHandlingSubtotal);
            self.onQuantityChange();
            self.onPriceChange();
            self.onFulfillmentMethodChange();
            self.shippingAddressChange();

            //initialize the store picker model
            self.pickerDialog = this.initializeStorePickerDialog();
        },
        populateWithUsers: function () {
            var self = this;
            if (!self.model.get('fullName') || !self.model.get('accountName')) {
                var userId = self.model.get('userId');
                var b2bAccount = new B2BAccountModels.b2bAccount({ id: self.model.get('customerAccountId') });
                b2bAccount.apiGet().then(function (account) {
                    self.model.set('allContacts', account.data.contacts);
                    self.model.set('accountName', account.data.companyOrOrganization);
                    return b2bAccount.apiGetUsers().then(function (users) {
                        if (users && users.data.items) {
                            self.model.set('allB2bUsers', users.data.items);
                            users.data.items.forEach(function (user) {
                                if (user.userId == userId) {
                                    self.model.set('fullName', user.firstName + ' ' + user.lastName);
                                    self.render();
                                }
                            });
                        }
                    }, function (error) {
                        self.showMessageBar(error);
                    });
                }, function (error) {
                    self.model.set('fullName', ' ');
                    self.model.set('accountName', ' ');
                    self.showMessageBar(error);
                });
            }
        },
        renderProductPicker: function () {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var productModalView = new ProductModalViews.ModalView({
                el: self.$el.find("[mz-modal-product-dialog]"),
                model: new ProductModels.Product({}),
                messagesEl: self.$el.find("[mz-modal-product-dialog]").find('[data-mz-message-bar]')
            });
            window.quickOrderModalView = productModalView;

            var productPickerView = new ProductPicker({
                el: self.$el.find('[mz-wishlist-product-picker]'),
                model: self.model
            });
            $('.quotes-summary-product-picker #pickerItemQuantity').val(1);
            productPickerView.render();
        },
        onQuoteAdjustmentChange: function (elementId, field, subTotal) {

            var self = this;
            $(elementId + ' input[type=radio],' + elementId + ' select').change(function () {
                self.calculateQuoteAdjustment(elementId, field, subTotal);
            });

            $(elementId + ' input[type=number]').keyup(function (e) {
                e.preventDefault();
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    self.calculateQuoteAdjustment(elementId, field, subTotal);
                    // set focus back to input and move it to the end of input
                    var input = $(elementId + ' input[type=number]');
                    var adjustmentValue = input.val();
                    input.focus().val('').val(adjustmentValue);
                }, 800);
            });
        },
        onQuantityChange: function () {
            var self = this;
            $('.mz-product-picker-table input[data-mz-value=quantity]').keyup(function (e) {
                e.preventDefault();
                var itemId = $(this).attr('data-mz-quote-item');
                var quantity = parseInt($(this).val(), 10);

                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    if (quantity > 0) {
                        self.updateItemQuantity(itemId, quantity);
                    }
                }, 600);
            });
        },

        onPriceChange: function () {
            var self = this;

            $('.mz-product-picker-table input[data-mz-value=unitPrice]').keyup(function (e) {
                e.preventDefault();
                var value = $(this).val();
                if (value) {
                    //override garbage characters
                    $(this).val(value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'));

                    var itemId = e.currentTarget.getAttribute("data-mz-quote-item");
                    var price = parseFloat($(this).val());

                    clearTimeout(timeout);
                    timeout = setTimeout(function () {
                        $(this).trigger('blur');
                        if (itemId && price > 0) {
                            self.updateItemPrice(itemId, price);
                        }
                    }, 600);
                }
            });

            $('.mz-product-picker-table input[data-mz-value=unitPrice]').focusin(function (e) {
                var value = $(this).val();
                if (value) {
                    $(this).val(value.replace(currentCurrencySymbol, ""));
                }
            });

            $('.mz-product-picker-table input[data-mz-value=unitPrice]').focusout(function (e) {
                var value = $(this).val();
                if (value && !value.includes(currentCurrencySymbol)) {
                    $(this).val(currentCurrencySymbol + value);
                    $(this).trigger('blur');
                }
            });
        },

        onFulfillmentMethodChange: function () {
            var self = this;
            $('.mz-product-picker-table select[data-mz-value=fulfillmentMethod]').change(function () {
                var itemId = $(this).attr('data-mz-quote-item');
                var value = $(this).val();
                self.changeFulfillmentMethod(itemId, value);
            });
        },
        initializeStorePickerDialog: function () {

            var self = this;
            var options = {
                elementId: "mz-location-selector",
                body: "", //to be populated by makeLocationPickerBody
                hasXButton: true,
                width: "400px",
                scroll: true,
                bodyHeight: "600px",
                backdrop: "static"
            };

            //Assures that each store select button has the right behavior
            $('#mz-location-selector').on('click', '.mz-store-select-button', function () {
                self.assignPickupLocation($(this).attr('mz-store-select-data'));
            });

            //Assures that the radio buttons reflect the accurate fulfillment method
            //if the dialog is closed before a store is picked.
            $('.modal-header').on('click', '.close', function () {
                self.render();
            });

            return modalDialog.init(options);

        },
        addProduct: function () {
            var self = this;
            var product = self.model.get('selectedProduct');
            var quantity = $('.quotes-summary-product-picker #pickerItemQuantity').val();
            if (product && quantity) {
                product.quantity = parseInt(quantity, 10);
                if (product.options) {
                    if (!(product instanceof ProductModels.Product)) {
                        if (product.toJSON)
                            product = product.toJSON();
                        product = new ProductModels.Product(product);
                    }

                    this.stopListening();
                    this.listenTo(product, "configurationComplete", function () {
                        self.finalizeAddItemToQuote(product);
                        window.quickOrderModalView.handleDialogClose();
                        self.render();
                    });
                    window.quickOrderModalView.loadAddProductView(product);
                    window.quickOrderModalView.handleDialogOpen();
                    return;
                }
                self.finalizeAddItemToQuote(product);
            }
        },
        finalizeAddItemToQuote: function (product, quantity) {
            var self = this;
            if (product.toJSON)
                product = product.toJSON();
            self.addItemToQuote(product, product.quantity);
            self.model.unset('selectedProduct');
            $('.quotes-summary-product-picker .mz-searchbox-input.tt-input').val('');
            $('.quotes-summary-product-picker #pickerItemQuantity').val(1);
        },
        addItemToQuote: function (product, quantity, updateMode) {
            var self = this;
            var quoteId = self.model.get('id');
            updateMode = updateMode || applyToDraft;
            product.name = product.content.productName;
            var images = product.content.productImages.length > 0 ? product.content.productImages : product.productImages;
            var fulfillmentMethod = (product.goodsType === 'Physical') ? 'Ship' : 'Digital';
            if (images && images.length > 0) {
                product.imageUrl = images[0].imageUrl;
            }
            if (product.options) {
                product.options.forEach(function (option) {
                    option.name = option.attributeDetail.name;
                });
            }

            var item = {
                id: quoteId,
                product: product,
                quantity: quantity,
                fulfillmentMethod: fulfillmentMethod,
                updatemode: updateMode
            };
            self.model.isLoading(true);
            self.model.apiModel.addItemToQuote(item).then(function (response) {
                self.resetModel(response.data);
            }, function (error) {
                self.showMessageBar(error);
            });
        },
        updateItemQuantity: function (itemId, quantity, updateMode) {
            var self = this;
            if (itemId && quantity > 0) {
                updateMode = updateMode || applyToDraft;
                var item = self.getItem(itemId);
                if (item && quantity != item.quantity) {
                    var data = {
                        quoteId: self.model.get('id'),
                        quoteItemId: item.id,
                        updatemode: updateMode,
                        quantity: quantity
                    };
                    self.model.isLoading(true);
                    self.model.apiModel.updateItemQuantity(data).then(function (response) {
                        self.resetModel(response.data);
                    }, function (error) {
                        self.showMessageBar(error);
                    });
                }
            }
        },

        updateItemPrice: function (itemId, price, updateMode) {
            var self = this;
            if (itemId && price > 0) {
                updateMode = updateMode || applyToDraft;
                var item = self.getItem(itemId);
                if (item && price != item.unitPrice.extendedAmount) {
                    var data = {
                        quoteId: self.model.get('id'),
                        quoteItemId: item.id,
                        updatemode: updateMode,
                        price: price
                    };
                    self.model.isLoading(true);
                    self.model.apiModel.updateItemProductPrice(data).then(function (response) {
                        self.resetModel(response.data);
                    }, function (error) {
                        self.showMessageBar(error);
                    });
                }
            }
        },
        removeItem: function (itemId, updateMode) {
            var self = this;
            if (itemId) {
                updateMode = updateMode || applyToDraft;

                var data = {
                    quoteId: self.model.get('id'),
                    quoteItemId: itemId,
                    updatemode: updateMode
                };
                self.model.apiModel.deleteQuoteItem(data).then(function () {
                    self.refreshQuote();
                });
            }
        },
        removeQuoteItem: function (e) {
            var self = this;
            var currentTargetId = e.currentTarget.id;
            var itemId = e.currentTarget.getAttribute("data-mz-quote-item");
            if (itemId) {
                self.removeItem(itemId);
            }
        },
        exitQuote: function () {
            var isSalesRep = require.mozuData('user').isSalesRep;
            if (isSalesRep) {
                window.location.href = "/selleraccount";
            } else {
                window.location.href = "/myaccount#Quotes";
            }
        },
        printQuote: function () {
            var quoteId = this.model.get('id');
            window.open('/back-office/quote/' + quoteId + '/print');
        },
        startEditingQuoteName: function () {
            var self = this;
            self.model.set("isEditQuoteName", true);
            setTimeout(function () {
                $('#quoteName').val(self.model.get('name'));
            }, 500);
            self.render();
        },
        updateQuoteName: function () {
            var self = this;
            var quoteName = $('#quoteName').val();
            self.model.set('name', quoteName);
            self.model.set("isEditQuoteName", false);
            self.updateQuote();
        },
        cancelQuoteNameUpdate: function () {
            var self = this;
            self.model.set("isEditQuoteName", false);
            self.render();
        },
        startEditingExpirationDate: function () {
            var self = this;
            self.model.set("isEditExpirationDate", true);
            self.render();
        },
        updateExpirationDate: function () {
            var self = this;
            var expirationDate = $('#expirationDate').val();

            if (expirationDate) {
                var today = new Date();
                expirationDate = new Date(expirationDate);

                if (expirationDate > today) {
                    self.model.set('expirationDate', expirationDate);
                    self.model.set("isEditExpirationDate", false);
                    self.updateQuote();
                }
                else {
                    self.showMessageBar({
                        message: 'Expiration Date should be greater than today.'
                    });
                }
            }
        },
        cancelExpirationDateUpdate: function () {
            var self = this;
            self.model.set("isEditExpirationDate", false);
            self.render();
        },
        startEditingSubmittedBy: function () {
            var self = this;
            self.model.isLoading(true);
            self.model.set("isEditSubmittedBy", true);
            var customerAccountId = self.model.get('customerAccountId');
            if (!self.model.get('b2bUsers')) {
                var b2bAccount = new B2BAccountModels.b2bAccount({ id: customerAccountId });
                b2bAccount.apiGet().then(function (account) {
                    return b2bAccount.apiGetUsers().then(function (users) {
                        self.model.isLoading(false);
                        self.model.set("b2bUsers", users.data.items);
                        self.render();
                    }, function (error) {
                        self.showMessageBar(error);
                    });
                }, function (error) {
                    self.showMessageBar(error);
                });
            }
            else {
                self.render();
            }
        },
        updateSubmittedBy: function () {
            var self = this;
            var userId = $('#submittedBy').val();
            if (userId) {
                self.model.set('fullName', null);
                self.model.set('userId', userId);
                self.updateQuote();
            }
        },
        cancelSubmittedByUpdate: function () {
            var self = this;
            self.model.set("isEditSubmittedBy", false);
            self.render();
        },
        calculateQuoteAdjustment: function (elementId, field, subTotal) {
            var self = this;
            var action = $(elementId + " select").first().val();
            var actualValue = $(elementId + " input[type=number]").first().val();

            //user is typing a decimal value
            if (actualValue.endsWith("."))
                return;

            actualValue = actualValue && actualValue !== "" ? parseFloat(actualValue) : null;
            var type = $(elementId + " input[name=" + field + "]:checked").first().val();
            var quoteUpdatedAdjustments = self.model.apiModel.data.quoteUpdatedAdjustments;

            if (actualValue !== quoteUpdatedAdjustments[field] || 
                type !== quoteUpdatedAdjustments[field + 'Type'] ||
                action !== quoteUpdatedAdjustments[field + 'Action']) {

                var value = (action === "Add" ? actualValue : -actualValue) || 0;

                if (type === "%") {
                    value = parseFloat(((subTotal * value) / 100).toFixed(2));
                }

                var newSubtotal = subTotal + value;

                quoteUpdatedAdjustments[field] = value;
                quoteUpdatedAdjustments[field + 'Abs'] = Math.abs(value);
                quoteUpdatedAdjustments[field + 'Actual'] = actualValue;
                quoteUpdatedAdjustments[field + 'NewSubtotal'] = newSubtotal;
                quoteUpdatedAdjustments[field + 'Action'] = action;
                quoteUpdatedAdjustments[field + 'Type'] = type;
                self.model.set("quoteUpdatedAdjustments", quoteUpdatedAdjustments);
                self.render();
            }
        },
        editQuoteAdjustments: function (e) {
            var self = this;
            self.model.set("editAdjustments", true);
            self.model.set("quoteUpdatedAdjustments", self.getQuoteAdjustment(true));
            self.render();
        },
        saveQuoteAdjustments: function () {
            var self = this;
            var quoteAdjustmentBefore = self.getQuoteAdjustment(true);
            var quoteAdjustmentAfter = this.model.apiModel.data.quoteUpdatedAdjustments;

            if (quoteAdjustmentAfter) {
                var isChanged = (quoteAdjustmentBefore.adjustment !== quoteAdjustmentAfter.adjustment) ||
                    (quoteAdjustmentBefore.shippingAdjustment !== quoteAdjustmentAfter.shippingAdjustment) ||
                    (quoteAdjustmentBefore.handlingAdjustment !== quoteAdjustmentAfter.handlingAdjustment);
                if (isChanged) {

                    if(quoteAdjustmentAfter.adjustmentNewSubtotal < 0 || quoteAdjustmentAfter.shippingAdjustmentNewSubtotal < 0 || quoteAdjustmentAfter.handlingAdjustmentNewSubtotal < 0){
                        this.showMessageBar({
                            message: 'Adjustment totals cannot be negative.'
                        });
                        return;
                    }

                    quoteAdjustmentAfter.id = self.model.get('id');
                    quoteAdjustmentAfter.updatemode = applyToDraft;

                    self.model.isLoading(true);
                    self.model.apiModel.updateQuoteAdjustment(quoteAdjustmentAfter).then(function (response) {
                        self.model.isLoading(false);
                        self.model.set(response.data);
                        self.model.set("error", null);
                        self.model.set("editAdjustments", false);
                        self.model.set("quoteUpdatedAdjustments", null);
                        self.model.syncApiModel();
                        self.render();


                    }, function (error) {
                        self.showMessageBar(error);
                    });
                }
                else {
                    self.model.set("editAdjustments", false);
                    self.render();
                }
            }
        },
        cancelQuoteAdjustmentsEdit: function (e) {
            var self = this;
            self.model.set("editAdjustments", false);
            self.model.set("quoteUpdatedAdjustments", self.getQuoteAdjustment(true));
            self.render();
        },
        setFlagOnItem: function (itemId, flagName, value) {
            var items = this.model.apiModel.data.items;
            for (var i = 0; i < items.length; i++) {
                if (items[i].id == itemId) {
                    items[i][flagName] = value;
                    break;
                }
            }
            this.model.set("items", items);
        },
        getQuoteAdjustment: function (isOverride) {
            var quote = this.model.apiModel.data;

            if (!quote.quoteUpdatedAdjustments || isOverride) {
                var productDiscounts = quote.orderLevelProductDiscountTotal + quote.itemLevelProductDiscountTotal;
                var shippingDiscounts = quote.orderLevelShippingDiscountTotal + quote.itemLevelShippingDiscountTotal;
                var handlingDiscounts = quote.orderLevelHandlingDiscountTotal + quote.itemLevelHandlingDiscountTotal;

                var adjustment = quote.adjustment ? quote.adjustment.amount : null;
                var shippingAdjustment = quote.shippingAdjustment ? quote.shippingAdjustment.amount : null;
                var handlingAdjustment = quote.handlingAdjustment ? quote.handlingAdjustment.amount : null;
                var taxAndDutyTotal = quote.itemTaxTotal + quote.shippingTaxTotal + quote.handlingTaxTotal + quote.dutyTotal;
                return {
                    "adjustment": adjustment,
                    "adjustmentAbs": adjustment ? Math.abs(adjustment) : null,
                    "adjustmentType": defaultAdjustmentType,
                    "adjustmentAction": adjustment > 0 ? adjustmentAdd : adjustmentSubtract,
                    "adjustmentNewSubtotal": quote.subTotal + adjustment - productDiscounts,

                    "shippingAdjustment": shippingAdjustment,
                    "shippingAdjustmentAbs": shippingAdjustment ? Math.abs(shippingAdjustment) : null,
                    "shippingAdjustmentType": defaultAdjustmentType,
                    "shippingAdjustmentAction": shippingAdjustment > 0 ? adjustmentAdd : adjustmentSubtract,
                    "shippingAdjustmentNewSubtotal": quote.shippingSubTotal + shippingAdjustment - shippingDiscounts, 

                    "handlingAdjustment": handlingAdjustment,
                    "handlingAdjustmentAbs": handlingAdjustment ? Math.abs(handlingAdjustment) : null,
                    "handlingAdjustmentType": defaultAdjustmentType,
                    "handlingAdjustmentAction": handlingAdjustment > 0 ? adjustmentAdd : adjustmentSubtract,
                    "handlingAdjustmentNewSubtotal": quote.handlingSubTotal + handlingAdjustment - handlingDiscounts,

                    "taxAndDutyTotal": taxAndDutyTotal
                };
            }
            else {
                return quote.quoteUpdatedAdjustments;
            }
        },
        toggleAdjustmentBlocks: function (e) {
            var self = this;
            var currentTargetId = e.currentTarget.id;
            var currentImage = $('#' + currentTargetId).attr('src');
            var toggleImage = currentImage.includes('arrow-down') ?
                currentImage.replace('arrow-down', 'arrow-right') :
                currentImage.replace('arrow-right', 'arrow-down');

            $('#' + currentTargetId).attr('src', toggleImage);
            self.$('.' + currentTargetId).toggle('slow');
        },
        updateQuote: function (updateMode) {
            var self = this;
            updateMode = updateMode || applyToDraft;

            self.model.set('updatemode', updateMode);
            self.model.isLoading(true);
            return this.model.apiUpdate().then(function (response) {
                if (updateMode === applyToDraft) {
                    self.model.isLoading(false);
                    self.model.set(response.data);
                    self.model.set("error", null);
                    self.model.set("isEditQuoteName", false);
                    self.model.set("isEditExpirationDate", false);
                    self.model.set("isEditSubmittedBy", false);
                    self.model.set('allAdminUsers', null);
                    self.model.syncApiModel();
                    self.render();
                }
                else {
                    self.exitQuote();
                }
            }, function (error) {
                self.showMessageBar(error);
            });
        },
        discardDraft: function () {
            var self = this;
            var data = {
                id: self.model.get('id'),
                draft: true
            };
            return this.model.apiDelete(data).then(function (response) {
                self.refreshQuote();
            }, function (error) {
                self.showMessageBar(error);
            });
        },
        commitDraft: function () {
            var self = this;
            self.updateQuote(applyAndCommit);
        },
        submitForApproval: function () {
            if (this.validateQuoteBeforeSubmit()) {
                this.commitDraft();
            }
        },
        approveQuote: function () {
            if (this.validateQuoteBeforeSubmit()) {
                this.commitDraft();
            }
        },
        refreshQuote: function () {
            var self = this;
            self.model.isLoading(true);
            self.model.apiGet({ id: self.model.get('id'), draft: true }).then(function (response) {
                self.resetModel(response.data);
            }, function (error) {
                self.showMessageBar(error);
            });
        },
        getItem: function (itemId) {
            var items = this.model.apiModel.data.items;
            for (var i = 0; i < items.length; i++) {
                if (items[i].id == itemId) {
                    return items[i];
                }
            }
        },
        changeFulfillmentMethod: function (quoteItemId, value) {
            var me = this;
            var quoteItem = this.getItem(quoteItemId),
                self = this;

            if (quoteItem.fulfillmentMethod == value) {
                //The user clicked the option for the fulfillment type that
                //was already selected so we can just quit.
                return 0;
            }

            if (value == "Ship") {

                quoteItem.fulfillmentMethod = value;
                quoteItem.fulfillmentLocationName = '';
                quoteItem.fulfillmentLocationCode = '';

                self.updateItemFulfillment(quoteItem);

            } else if (value == "Pickup") {
                var productCode = quoteItem.product.variationProductCode || quoteItem.product.productCode;
                this.pickStore(productCode, quoteItemId);
            }

        },
        assignPickupLocation: function (jsonStoreSelectData) {

            var self = this;
            this.pickerDialog.hide();

            var storeSelectData = JSON.parse(jsonStoreSelectData);
            var quoteItem = this.getItem(storeSelectData.quoteItemId);

            quoteItem.fulfillmentMethod = 'Pickup';
            quoteItem.fulfillmentLocationName = storeSelectData.locationName;
            quoteItem.fulfillmentLocationCode = storeSelectData.locationCode;

            self.updateItemFulfillment(quoteItem);
        },
        pickStore: function (productCode, quoteItemId) {
            var self = this;
            var locationsCollection = new LocationModels.LocationCollection();

            locationsCollection.apiGetForProduct({ productCode: productCode }).then(function (collection) {
                locationsCollection.get('items').forEach(function (item) {
                    self.model.get('storeLocationsCache').addLocation({ code: item.get('code'), name: item.get('name') });
                });

                var $bodyElement = $('#mz-location-selector').find('.modal-body');
                $bodyElement.attr('mz-quote-item', quoteItemId);
                if (collection.length === 0) {
                    self.pickerDialog.setBody(Hypr.getLabel("noNearbyLocationsProd"));
                } else {
                    self.pickerDialog.setBody(self.makeLocationPickerBody(locationsCollection, quoteItemId));
                }
                self.pickerDialog.show();

            }, function (error) {
                //error
            });
        },
        makeLocationPickerBody: function (locationsCollection, quoteItemId) {
            var locations = locationsCollection.toJSON();
            var body = "";

            locations.items.forEach(function (location) {
                var stockLevel = location.quantity;

                //Piece together UI for a single location listing
                var locationSelectDiv = $('<div>', { "class": "location-select-option", "style": "display:flex", "data-mz-quote-item": quoteItemId });
                var leftSideDiv = $('<div>', { "style": "flex:1" });
                var rightSideDiv = $('<div>', { "style": "flex:1" });
                leftSideDiv.append('<h4 style="margin: 6.25px 0 6.25px">' + location.name + '</h4>');

                var address = location.address;

                leftSideDiv.append($('<div>' + address.address1 + '</div>'));
                if (address.address2) { leftSideDiv.append($('<div>' + address.address2 + '</div>')); }
                if (address.address3) { leftSideDiv.append($('<div>' + address.address3 + '</div>')); }
                if (address.address4) { leftSideDiv.append($('<div>' + address.address4 + '</div>')); }
                leftSideDiv.append($('<div>' + address.cityOrTown + ', ' + address.stateOrProvince + ' ' + address.postalOrZipCode + '</div>'));
                var $selectButton;

                if (stockLevel > 0) {
                    leftSideDiv.append("<p class='mz-locationselect-available'>" + Hypr.getLabel("availableNow") + "</p>");
                    var buttonData = {
                        locationCode: location.code,
                        locationName: location.name,
                        quoteItemId: quoteItemId
                    };

                    $selectButton = $("<button>", { "type": "button", "class": "mz-button mz-store-select-button", "style": "margin:25% 0 0 25%", "aria-hidden": "true", "mz-store-select-data": JSON.stringify(buttonData) });
                    $selectButton.text(Hypr.getLabel("selectStore"));
                    rightSideDiv.append($selectButton);

                } else {
                    leftSideDiv.append("<p class='mz-locationselect-unavailable'>" + Hypr.getLabel("outOfStock") + "</p>");
                    $selectButton = $("<button>", { "type": "button", "class": "mz-button is-disabled mz-store-select-button", "aria-hidden": "true", "disabled": "disabled", "style": "margin:25% 0 0 25%" });
                    $selectButton.text(Hypr.getLabel("selectStore"));
                    rightSideDiv.append($selectButton);
                }

                locationSelectDiv.append(leftSideDiv);
                locationSelectDiv.append(rightSideDiv);
                body += locationSelectDiv.prop('outerHTML');

            });

            return body;
        },
        updateItemFulfillment: function (item, updateMode) {
            var self = this;
            if (item) {
                updateMode = updateMode || applyToDraft;

                item.quoteId = self.model.get('id');
                item.quoteItemId = item.id;
                item.updatemode = updateMode;
                self.model.isLoading(true);
                self.model.apiModel.updateItemFulfillment(item).then(function (response) {
                    self.resetModel(response.data);
                }, function (error) {
                    self.showMessageBar(error);
                });
            }
        },
        showMessageBar: function (error) {
            var self = this;
            self.model.set("error", error);
            self.model.isLoading(false);
            self.model.syncApiModel();
            self.render();
        },
        resetModel: function (data) {
            var self = this;
            self.model.isLoading(false);
            self.model.set(data);
            self.model.set('error', null);
            self.model.set('allAdminUsers', null);
            self.model.set('expirationDate', data.expirationDate);
            self.model.syncApiModel();
            self.model.set("quoteUpdatedAdjustments", self.getQuoteAdjustment(true));
            self.render();
        },

        addComment: function () {
            var self = this;
            var quoteId = self.model.get('id');
            var comment = $("#quote-comment").val();
            if (quoteId && comment) {
                var payload = {
                    quoteId: quoteId,
                    text: comment,
                    updatemode: applyToDraft
                };

                self.model.isLoading(true);
                self.model.apiModel.createQuoteComment(payload).then(function (response) {
                    self.model.set('id', quoteId);
                    self.refreshQuote();
                }, function (error) {
                    self.showMessageBar(error);
                });
            }
        },
        shippingAddressChange: function () {
            var self = this;

            $('#selectShippingAddress').change(function () {
                var contactId = $(this).val();
                self.onAddressChange(contactId);
            });

            $('#selectShippingMethod').change(function () {
                self.shippingMethodSelectionChanged();
            });

            $('#selectShippingAddressModal').change(function () {
                var contactId = $(this).val();
                self.selectedAddressChangeOnModal(parseInt(contactId, 10));
            });

            $('#saveEditedAddress').click(function () {
                self.saveEditedContact();
            });

            $('#country').change(function () {
                var country = $(this).val();
                if (country === "US") {
                    $('.state-usa').show();
                    $('.state-not-usa').hide();
                }
                else {
                    $('.state-usa').hide();
                    $('.state-not-usa').show();
                }
            });

            $('#clearSelectedAddress').click(function () {
                self.clearSelectedContact();
            });
        },
        addUserInfoOnModel: function () {
            var self = this;

            var adminUserIds = [];
            self.setUserNameOnComment(self.model.get('comments'), adminUserIds);
            self.setUserInfoOnAuditHistory(self.model.get('auditHistory'), adminUserIds);
            if (adminUserIds.length > 0) {
                self.getAdminUsers(adminUserIds);
            }
        },
        setUserNameOnComment: function (comments, adminUserIds) {
            var allB2bUsers = this.model.get('allB2bUsers');
            if (comments && comments.length > 0 &&
                allB2bUsers && allB2bUsers.length > 0) {

                for (var c = 0; c < comments.length; c++) {
                    for (var u = 0; u < allB2bUsers.length; u++) {
                        if (comments[c].auditInfo.createBy === allB2bUsers[u].userId) {
                            comments[c].auditInfo.createByName = allB2bUsers[u].firstName + ' ' + allB2bUsers[u].lastName;
                        }
                        else if (!this.isAlreadyExists(adminUserIds, comments[c].auditInfo.createBy)) {
                            adminUserIds.push(comments[c].auditInfo.createBy);
                        }
                    }
                    //Need this for hypr filters. Hypr filter not working on complex/nested objects.
                    comments[c].createDate = new Date(comments[c].auditInfo.createDate).toLocaleDateString();
                }
                this.model.set('comments', comments);
            }
        },
        setUserInfoOnAuditHistory: function (auditHistory, adminUserIds) {
            var allB2bUsers = this.model.get('allB2bUsers');

            if (auditHistory && auditHistory.length > 0 &&
                allB2bUsers && allB2bUsers.length > 0) {

                for (var a = 0; a < auditHistory.length; a++) {
                    for (var u = 0; u < allB2bUsers.length; u++) {
                        if (auditHistory[a].auditInfo.createBy === allB2bUsers[u].userId) {
                            auditHistory[a].auditInfo.createByName = allB2bUsers[u].firstName + ' ' + allB2bUsers[u].lastName;
                            auditHistory[a].auditInfo.createByEmail = allB2bUsers[u].emailAddress;
                        }
                        else if (!this.isAlreadyExists(adminUserIds, auditHistory[a].auditInfo.createBy)) {
                            adminUserIds.push(auditHistory[a].auditInfo.createBy);
                        }
                    }
                    //Need this for hypr filters. Hypr filter not working on complex/nested objects.
                    auditHistory[a].createDate = new Date(auditHistory[a].auditInfo.createDate).toLocaleDateString();
                }
                this.model.set('auditHistory', auditHistory);
            }
        },

        getAvailableShippingMethods: function () {
            var self = this;
            var json = JSON.parse(JSON.stringify(
                {
                    "quoteId": self.model.get('id'),
                    "draft": true

                }));
            return self.model.apiModel.getAvailableShippingMethods(json).then(function (response) {
                self.model.set('shippingMethods', response);
                var allShippingMethods = self.model.get('shippingMethods');
                var fulfillmentInfo = self.model.apiModel.data.fulfillmentInfo;
                var selectedShippingMethod =  self.model.get('selectedShippingMethodCode');
                if (allShippingMethods && fulfillmentInfo && !selectedShippingMethod) {
                    for (var methodIndex = 0; methodIndex < allShippingMethods.length; methodIndex++) {
                        if (allShippingMethods[methodIndex].shippingMethodCode == fulfillmentInfo.shippingMethodCode) {
                             self.model.set('selectedShippingMethodCode', fulfillmentInfo.shippingMethodCode);
                             self.model.set('selectedShippingMethod', fulfillmentInfo.shippingMethodName);
                        }
                    }
                }
                
                self.model.syncApiModel();
                self.refreshQuote();  
            }, function(error) {
                self.model.set('shippingMethods', null);
                $('#selectShippingMethod').val('-1');
                $("#selectShippingMethod").prop("disabled", true);
                self.showMessageBar(error);
                self.render();
            });
        },
        shippingMethodSelectionChanged: function () {
            var self = this;
            self.model.set('selectedShippingMethodCode', $("#selectShippingMethod").val());
            self.model.set('selectedShippingMethod', $("#selectShippingMethod :selected").text());
            self.updateFulfillmentInfo();
            self.refreshQuote();
        },
        updateFulfillmentInfo: function (updateMode) {
            var self = this;
            updateMode = updateMode || applyToDraft;
            self.model.set('updatemode', updateMode);
            self.model.isLoading(true);
            var fulfillmentInfo = self.model.get("fulfillmentInfo");
            var json = JSON.parse(JSON.stringify({ }));
            if (fulfillmentInfo) {
                json = JSON.parse(JSON.stringify(
                    {
                        "shippingMethodName": self.model.get('selectedShippingMethod'),
                        "shippingMethodCode": self.model.get('selectedShippingMethodCode'),
                        "fulfillmentContact": {
                            "id": fulfillmentInfo.fulfillmentContact.id,
                            "email": fulfillmentInfo.fulfillmentContact.email,
                            "firstName": fulfillmentInfo.fulfillmentContact.firstName,
                            "lastNameOrSurname": fulfillmentInfo.fulfillmentContact.lastNameOrSurname,
                            "companyOrOrganization": fulfillmentInfo.fulfillmentContact.companyOrOrganization,
                            "phoneNumbers": fulfillmentInfo.fulfillmentContact.phoneNumbers,
                            "address": fulfillmentInfo.fulfillmentContact.address
                        }
                    }));
                }
               
                return self.model.apiModel.updateFulfillmentInfo(json).then(function (response) {
                    if (updateMode === applyToDraft) {
                        self.model.isLoading(false);
                        self.model.set(response.data);
                        self.model.set("error", null);
                        self.model.set("isEditQuoteName", false);
                        self.model.set("isEditExpirationDate", false);
                        self.model.set("isEditSubmittedBy", false);
                        self.model.set('allAdminUsers', null);
   
                    }
                    else {
                        self.exitQuote();
                    }
                  
                   self.getAvailableShippingMethods();
                
                }, function (error) {
                    self.showMessageBar(error);
                });
        },
      
        onAddressChange: function (contactId) {
            var self = this;
            var fulfillmentInfo = self.model.get("fulfillmentInfo");

            if (contactId === "-1") {
                    

                //trying to reset the fulfillmentInfo
                if (fulfillmentInfo) {
                    self.model.set("fulfillmentInfo", null);
                    self.updateFulfillmentInfo();
                }
            }
            else {
                //setting new fulfillmentInfo
                var contact = self.getContactById(contactId);
                if (contact) {

                    fulfillmentInfo = { fulfillmentContact: contact };
                    self.model.set("fulfillmentInfo", fulfillmentInfo);
                    self.updateFulfillmentInfo();
                }
            }
        },
        getContactById: function (contactId) {
            var self = this;
            var allContacts = self.model.get('allContacts');
            if (allContacts) {
                for (var i = 0; i < allContacts.length; i++) {
                    if (allContacts[i].id == contactId) {
                        return allContacts[i];
                    }
                }
            }
        },

        setModifiedContact: function () {
            var contacts = this.getOnlyShippingAddress(this.model.get('allContacts'));
            if (this.model.apiModel.data && this.model.apiModel.data.fulfillmentInfo) {
                if(this.model.apiModel.data.fulfillmentInfo.fulfillmentContact) {
                    var fulfillmentInfo = this.model.apiModel.data.fulfillmentInfo;
                    if (fulfillmentInfo && contacts) {
                        var isUpdated = false;
                        for (var i = 0; i < contacts.length; i++) {
                            if (contacts[i].id == fulfillmentInfo.fulfillmentContact.id) {
                                contacts[i] = fulfillmentInfo.fulfillmentContact;
                                isUpdated = true;
                            }                       
                        }
                        //Add newly created address
                        if (!isUpdated) {
                            if(fulfillmentInfo.fulfillmentContact !== undefined) {
                                if (typeof fulfillmentInfo.fulfillmentContact.types === undefined) {
                                    fulfillmentInfo.fulfillmentContact = Object.assign({}, fulfillmentInfo.fulfillmentContact, { types: [{ name: "Shipping", isPrimary: false }] });
                                }
                                contacts.push(fulfillmentInfo.fulfillmentContact);
                                this.model.set('fulfillmentInfo', fulfillmentInfo);
                            }
                            
                            if (!fulfillmentInfo.shippingMethodCode) {
                                $('#selectShippingMethod').val('-1');
                                this.model.set('shippingMethods', null);
                            }
                        }
                    }
                }
            }
            this.model.set('allContacts', contacts);
        },

        getOnlyShippingAddress: function (contacts) {
            var filteredContacts = [];
            if (contacts) {
                for (var i = 0; i < contacts.length; i++) {
                    var types = contacts[i].types;
                    if (types && types.length > 0) {
                        for (var j = 0; j < types.length; j++) {
                            if (types[j].name === "Shipping") {
                                filteredContacts.push(contacts[i]);
                            }
                        }
                    }
                    if (types === undefined)
                        filteredContacts.push(contacts[i]);
                }
            }
            return filteredContacts;
        },
        isShippable: function () {
            var items = this.model.apiModel.data.items;
            var result = false;
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].fulfillmentMethod === "Ship") {
                        result = true;
                        break;
                    }
                }
            }
            return result;
        },
        addNewAddress: function () {
            var self = this;
            if (this.model.get('fulfillmentInfo'))
                this.model.set('selectedFulfillmentInfo', this.model.apiModel.data.fulfillmentInfo);
            else {
                this.model.set('selectedFulfillmentInfo', { fulfillmentContact: self.getEmptyContact() });
            }

            addNewAddressViewPopup.model = this.model;
            addNewAddressViewPopup.renderView();
            this.reRenderModal();
        },

        selectedAddressChangeOnModal: function (contactId) {
            var self = this;
            if (contactId == "-1") {
                self.clearSelectedContact();
            }
            var contact = self.getContactById(contactId);
            if (contact) {
                var fulfillmentInfo = {
                    fulfillmentContact: contact
                };
                self.model.set("selectedFulfillmentInfo", fulfillmentInfo);
                self.reRenderModal();
            }
        },
        saveEditedContact: function () {
            var self = this;
            var contact = this.getAndValidateEditedContact();
            if (contact) {
                var fulfillmentInfo = contact;
                self.model.set("fulfillmentInfo", fulfillmentInfo);
                self.updateFulfillmentInfo();
                addNewAddressViewPopup.closeModal();
            }
        },
        getAndValidateEditedContact: function () {
            var self = this;
            var firstName = self.requiredFieldValidator('firstname', 'firstNameMissing');
            var lastName = self.requiredFieldValidator('lastNameOrSurname', 'lastNameMissing');
            var address1 = self.requiredFieldValidator('address-line-1', 'streetMissing');
            var address2 = self.requiredFieldValidator('address-line-2', '', true);
            var country = self.requiredFieldValidator('country', 'countryMissing');
            var city = self.requiredFieldValidator('city', 'cityMissing');
            var state = country === "US" ?
                self.requiredFieldValidator('state', 'stateProvMissing') :
                self.requiredFieldValidator('stateOrProvince', 'stateProvMissing');
            var postalCode = self.requiredFieldValidator('postal-code', 'postalCodeMissing');
            var home = self.requiredFieldValidator('phonenumber', 'phoneMissing');
            var addressType = self.requiredFieldValidator('addressType', '', true);
            var isDestinationCommercial = addressType === "Commercial";
            var allContacts = self.model.get('allContacts');
            var selectedContactId = allContacts.length + 2;
            var index = $("#selectShippingAddressModal").prop('selectedIndex');
            var selectedFulfillmentInfo = this.model.get('selectedFulfillmentInfo');
            var generatedId = index < 1 ? selectedContactId : (selectedFulfillmentInfo.fulfillmentContact.id);
            //If contact is validated
            if ($('.editableAddress .mz-validationmessage:visible').length <= 0) {
                return {
                    isDestinationCommercial: isDestinationCommercial,
                    fulfillmentContact: {
                        id: generatedId,
                        firstName: firstName,
                        lastNameOrSurname: lastName,
                        companyOrOrganization: self.model.get('accountName'),
                        phoneNumbers: {
                            home: home
                        },
                        address: {
                            address1: address1,
                            address2: address2,
                            cityOrTown: city,
                            stateOrProvince: state,
                            postalOrZipCode: postalCode,
                            countryCode: country,
                            addressType: addressType
                        },
                        types: [{ name: "Shipping", isPrimary: false }]
                    }
                };
            }
        },

        clearSelectedContact: function () {
            var self = this;
            self.model.set("selectedFulfillmentInfo", {
                isDestinationCommercial: null,
                fulfillmentContact: self.getEmptyContact()
            });
            self.reRenderModal();
            $('#selectShippingAddressModal').val('-1');
        },
        requiredFieldValidator: function (controlSelector, validationMessageKey, skipValidation) {
            var selector = '.editableAddress';
            var value = $(selector + ' #' + controlSelector).val();
            if (!skipValidation) {
                var controlValidatorSelector = selector + ' span[data-mz-validationmessage-for=' + controlSelector + ']';
                if (!value && value === "") {
                    $(controlValidatorSelector).text(Hypr.getLabel(validationMessageKey)).show();
                }
                else {
                    $(controlValidatorSelector).text('').hide();
                }
            }
            return value;
        },
        getEmptyContact: function () {
            return {
                phoneNumbers: {},
                address: {}
            };
        },
        reRenderModal: function () {
            addNewAddressViewPopup.render();
            this.shippingAddressChange();
        },

        getAdminUsers: function (userIds) {
            var self = this;

            var allB2bUsers = this.model.get('allB2bUsers') || [];
            var allAdminUsers = self.model.get('allAdminUsers');

            if (userIds && userIds.length > 0 && !allAdminUsers && allB2bUsers) {
                $.ajax({
                    type: "POST",
                    url: '/adminusers/summaries',
                    data: JSON.stringify(userIds),
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
                        self.model.set('allAdminUsers', response);
                        if (response) {
                            for (var i = 0; i < response.length; i++) {
                                response[i].userId = response[i].id;
                                allB2bUsers.push(response[i]);
                            }
                            self.model.set('allB2bUsers', allB2bUsers);
                            self.render();
                        }
                    },
                    error: function (error) {
                        self.model.set('allAdminUsers', []);
                    }
                });
            }
        },

        isAlreadyExists: function (array, key) {
            if (array) {
                for (var i = 0; i < array.length; i++) {
                    if (key === array[i]) {
                        return true;
                    }
                }
            }
            return false;
        },
        applyCoupon: function () {
            var couponCode = $('input[data-mz-value=couponCode]').val();
            if (couponCode) {
                var self = this;
                var data = {
                    quoteId: self.model.get('id'),
                    couponCode: couponCode,
                    updateMode: applyToDraft
                };
                self.model.isLoading(true);
                self.model.apiModel.applyCoupon(data).then(function (response) {
                    self.resetModel(response.data);
                    var couponIsNotApplied = _.find(response.data.invalidCoupons, function (d) {
                        return d.couponCode && d.couponCode === couponCode;
                    });

                    if (couponIsNotApplied) {
                        var error = { message: couponCode + " " + couponIsNotApplied.reason };
                        self.showMessageBar(error);
                    }

                    var itemLevelProductDiscounts = _.flatten(_.pluck(response.data.items, 'productDiscounts'));
                    var itemLevelShippingDiscounts = _.flatten(_.pluck(response.data.items, 'shippingDiscounts'));
                    var orderDiscounts = response.data.orderDiscounts;
                    var shippingDiscounts = response.data.shippingDiscounts;
                    var allDiscounts = orderDiscounts.concat(shippingDiscounts).concat  (itemLevelProductDiscounts).concat(itemLevelShippingDiscounts);
                    var couponExists = _.find(allDiscounts, function (code) {
                        return code.couponCode === couponCode || code.discount.couponCode === couponCode;
                    });

                    if (!couponIsNotApplied && !couponExists) {
                        var info = { message: Hypr.getLabel("note") + ": \"" + couponCode + "\" " + Hypr.getLabel("couponCodeMessage") };
                        self.model.set("info", info);
                        self.model.isLoading(false);
                        self.model.syncApiModel();
                        self.render();
                    } else {
                        self.model.set("info", "");
                        self.model.isLoading(false);
                        self.model.syncApiModel();
                        self.render();
                    }

                }, function (error) {
                    self.showMessageBar(error.items[0]);
                });
            }
        },
        hasPricelist: function () {
            var items = this.model.apiModel.data.items;
            var result = false;
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].product.price.priceListCode) {
                        result = true;
                        break;
                    }
                }
            }
            return result;
        },
        validateQuoteBeforeSubmit: function () {
            var name = this.model.get('name');
            if (!name) {
                this.showMessageBar({
                    message: 'Quote name is required.'
                });
                return false;
            }

            var userId = this.model.get('userId');
            if (!userId) {
                this.showMessageBar({
                    message: 'Created By is required.'
                });
                return false;
            }

            var items = this.model.get('items');
            if (items.length <= 0) {
                this.showMessageBar({
                    message: 'At least one item must be added to a quote.'
                });
                return false;
            }

            //validate fulfillment address and shipping method code is populated, If direct ship items are present.
            if (!this.validateFulfillmentInfo()) {
                this.showMessageBar({
                    message: 'Shipping address and shipping method is required.'
                });
                return false;
            }

            return true;
        },
        validateFulfillmentInfo: function () {
            if (this.isShippable()) {
                var fulfillmentInfo = this.model.get('fulfillmentInfo');
                if (!fulfillmentInfo || !fulfillmentInfo.fulfillmentContact ||
                    !fulfillmentInfo.fulfillmentContact.address ||
                    !fulfillmentInfo.shippingMethodCode
                ) {
                    return false;
                }
                return true;
            }
            else {
                return true;
            }

            return false;
        }
    });

    $(document).ready(function () {
        var model = new QuoteModels.Quote(require.mozuData("quote") || {});
        var quoteEditView = new QuoteEditView({
            el: $('#mz-edit-quote-page'),
            templateName: 'modules/b2b-account/quotes/edit-quote',
            model: model
        });

        quoteEditView.render();
        quoteEditView.getAvailableShippingMethods();
    });

});
