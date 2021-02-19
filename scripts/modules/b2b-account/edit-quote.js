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
    'modules/modal-dialog'
], function ($, api, _, Hypr, Backbone, HyprLiveContext, ProductModalViews,
    ProductPicker, ProductModels, QuoteModels, B2BAccountModels, LocationModels, modalDialog) {
    var timeout = null;
    var adjustmentSubtract = "Subtract";
    var adjustmentAdd = "Add";
    var defaultAdjustmentType = "$";
    var applyToDraft = 'ApplyToDraft';
    var applyAndCommit = 'ApplyAndCommit';
    var currentCurrencySymbol = require.mozuData('pagecontext').currencyInfo.symbol;

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

            //render product picker
            self.renderProductPicker();

            self.model.set('isSalesRep', require.mozuData('user').isSalesRep);
            //wire up all the events on controls
            self.onQuoteAdjustmentChange('#quoteAdjustmentSection', 'adjustment', self.model.apiModel.data.subTotal);
            self.onQuoteAdjustmentChange('#shippingAdjustmentSection', 'shippingAdjustment', self.model.apiModel.data.shippingSubTotal);
            self.onQuoteAdjustmentChange('#handlingAdjustmentSection', 'handlingAdjustment', self.model.apiModel.data.handlingSubTotal);
            self.onQuantityChange();
            self.onPriceChange();
            self.onFulfillmentMethodChnage();

            //initialize the store picker model
            self.pickerDialog = this.initializeStorePickerDialog();
        },
        populateWithUsers: function () {
            var self = this;
            if (!self.model.get('fullName') || !self.model.get('accountName')) {
                var userId = self.model.get('userId');
                var b2bAccount = new B2BAccountModels.b2bAccount({ id: self.model.get('customerAccountId') });
                b2bAccount.apiGet().then(function (account) {
                    self.model.set('accountName', account.data.companyOrOrganization);
                    return b2bAccount.apiGetUsers().then(function (users) {
                        if (users && users.data.items) {
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

        onFulfillmentMethodChnage: function () {
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
                window.location.href = "/myaccount";
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
                self.model.set('expirationDate', new Date(expirationDate));
                self.model.set("isEditExpirationDate", false);
                self.updateQuote();
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

            if (actualValue !== quoteUpdatedAdjustments[field] || type !== quoteUpdatedAdjustments[field + 'Type']) {

                var value = (action === "Add" ? actualValue : -actualValue) || 0;

                if (type === "%") {
                    value = ((subTotal * value) / 100).toFixed(2);
                }

                quoteUpdatedAdjustments[field] = value;
                quoteUpdatedAdjustments[field + 'Abs'] = Math.abs(value);
                quoteUpdatedAdjustments[field + 'Actual'] = actualValue;
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
                var adjustment = quote.adjustment ? quote.adjustment.amount : null;
                var shippingAdjustment = quote.shippingAdjustment ? quote.shippingAdjustment.amount : null;
                var handlingAdjustment = quote.handlingAdjustment ? quote.handlingAdjustment.amount : null;
                return {
                    "adjustment": adjustment,
                    "adjustmentAbs": adjustment ? Math.abs(adjustment) : null,
                    "adjustmentType": defaultAdjustmentType,
                    "adjustmentAction": adjustment > 0 ? adjustmentAdd : adjustmentSubtract,

                    "shippingAdjustment": shippingAdjustment,
                    "shippingAdjustmentAbs": shippingAdjustment ? Math.abs(shippingAdjustment) : null,
                    "shippingAdjustmentType": defaultAdjustmentType,
                    "shippingAdjustmentAction": shippingAdjustment > 0 ? adjustmentAdd : adjustmentSubtract,

                    "handlingAdjustment": handlingAdjustment,
                    "handlingAdjustmentAbs": handlingAdjustment ? Math.abs(handlingAdjustment) : null,
                    "handlingAdjustmentType": defaultAdjustmentType,
                    "handlingAdjustmentAction": handlingAdjustment > 0 ? adjustmentAdd : adjustmentSubtract
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
                self.model.isLoading(false);
                self.model.set(response.data);
                self.model.set("error", null);
                self.model.set("isEditQuoteName", false);
                self.model.set("isEditExpirationDate", false);
                self.model.set("isEditSubmittedBy", false);
                self.model.syncApiModel();
                self.render();
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
            self.model.syncApiModel();
            self.render();
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
    });

});
