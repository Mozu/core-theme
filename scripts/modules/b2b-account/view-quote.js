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
    var QuoteView = Backbone.MozuView.extend({
        templateName: 'modules/b2b-account/quotes/view-quote',
        initialize: function () {
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
        },
        render: function () {
            var self = this;
            //get adjustments
            self.model.set("quoteUpdatedAdjustments", self.getQuoteAdjustment());
            //populate user details on model
            self.populateAccountAndUsers();
            self.addUserInfoOnModel();
            self.model.set('isShippable', self.isShippable());
            self.model.set("isUserAdmin", require.mozuData('user').behaviors.includes(1000));
            self.model.set("isUserPurchaser", require.mozuData('user').behaviors.includes(1005));
            self.model.set('isSalesRep', require.mozuData('user').isSalesRep);
            self.model.set('hasPricelist', self.hasPricelist());
            self.setModifiedContact();
            //render product picker
            self.renderProductPicker();
            //initialize the store picker model
            self.pickerDialog = this.initializeStorePickerDialog();
        },
        populateAccountAndUsers: function () {
            var self = this;
            // Return early if we've already queried the APIs
            if (self.model.get('allContacts') && self.model.get('allB2bUsers')) {
                return;
            }
            var userId = self.model.get('userId');
            var b2bAccount = new B2BAccountModels.b2bAccount({ id: self.model.get('customerAccountId') });
            b2bAccount.apiGet().then(function (account) {
                self.model.set('accountName', account.data.companyOrOrganization || ' ');
                self.model.set('allContacts', account.data.contacts || []);
                return b2bAccount.apiGetUsers().then(function (users) {
                    var items = [];
                    if (users && users.data.items) {
                        items = users.data.items;
                        items.forEach(function (user) {
                            if (user.userId == userId) {
                                self.model.set('fullName', user.firstName + ' ' + user.lastName);
                            }
                        });
                    }
                    self.model.set('allB2bUsers', items);
                    self.render();
                }, function (error) {
                    self.showMessageBar(error);
                });
            }, function (error) {
                self.model.set('fullName', ' ');
                self.model.set('accountName', ' ');
                self.showMessageBar(error);
            });
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
        finalizeAddItemToQuote: function (product, quantity) {
            var self = this;
            if (product.toJSON)
                product = product.toJSON();
            self.addItemToQuote(product, product.quantity);
            self.model.unset('selectedProduct');
            $('.quotes-summary-product-picker .mz-searchbox-input.tt-input').val('');
            $('.quotes-summary-product-picker #pickerItemQuantity').val(1);
        },
        exitQuote: function () {
            var isSalesRep = require.mozuData('user').isSalesRep;
            if (isSalesRep) {
                window.location.href = "/selleraccount";
            } else {
                window.location.href = "/myaccount#Quotes";
            }
        },
        editQuote: function (e, row) {
            var quoteId = this.model.get('id');
            var isSalesRep = require.mozuData('user').isSalesRep;
            if (isSalesRep) {
                window.location = '/selleraccount/quote/' + quoteId + '/edit';
            } else {
                window.location = '/myaccount/quote/' + quoteId + '/edit';
            }
        },
        printQuote: function () {
            var quoteId = this.model.get('id');
            window.open('/back-office/quote/' + quoteId + '/print');
        },
        backToQuotes: function () {
            var isSalesRep = require.mozuData('user').isSalesRep;
            if (isSalesRep) {
                window.location.href = "/selleraccount#Quotes";
            } else {
                window.location.href = "/myaccount#Quotes";
            }
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
        getItem: function (itemId) {
            var items = this.model.apiModel.data.items;
            for (var i = 0; i < items.length; i++) {
                if (items[i].id == itemId) {
                    return items[i];
                }
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
        },
        addUserInfoOnModel: function () {
            var self = this;
            var adminUserIds = [];
            this.model.set('createDateLocale', this.getDateInLocaleFormat(self.model.apiModel.data.auditInfo.createDate));
            if (self.model.apiModel.data.expirationDate) {
                this.model.set('expirationDateLocale', this.getDateInLocaleFormat(self.model.apiModel.data.expirationDate));
            }
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
                    comments[c].createDate = comments[c].auditInfo.createDate;
                    comments[c].createDateLocale = this.getDateInLocaleFormat(comments[c].auditInfo.createDate);
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
                    auditHistory[a].createDate = auditHistory[a].auditInfo.createDate;
                    auditHistory[a].createDateLocale = this.getDateInLocaleFormat(auditHistory[a].auditInfo.createDate);
                }
                this.model.set('auditHistory', auditHistory);
            }
        },
        getDateInLocaleFormat: function (dateToConvert) {
            return (dateToConvert ? new Date(dateToConvert).toLocaleDateString() : "");
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
            if (this.model.apiModel.data &&
                this.model.apiModel.data.fulfillmentInfo) {
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
                        if (typeof fulfillmentInfo.fulfillmentContact.types === undefined) {
                            fulfillmentInfo.fulfillmentContact = Object.assign({}, fulfillmentInfo.fulfillmentContact, { types: [{ name: "Shipping", isPrimary: false }] });
                        }
                        contacts.push(fulfillmentInfo.fulfillmentContact);
                        this.model.set('fulfillmentInfo', fulfillmentInfo);
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
        selectedAddressChangeOnModal: function (contactId) {
            var self = this;
            var contact = self.getContactById(contactId);
            if (contact) {
                var destination = {
                    destinationContact: contact
                };
                self.model.set("selectedDestination", destination);
                self.reRenderModal();
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
            var selectedContactId = $('#selectShippingAddressModal').val();
            //If contact is validated
            if ($('.editableAddress .mz-validationmessage:visible').length <= 0) {
                return {
                    isDestinationCommercial: isDestinationCommercial,
                    destinationContact: {
                        id: selectedContactId == "-1" ? null : selectedContactId,
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
                        }
                    }
                };
            }
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

        clearSelectedContact: function () {
            var self = this;
            self.model.set("selectedDestination", {
                isDestinationCommercial: null,
                destinationContact: self.getEmptyContact()
            });
            self.reRenderModal();
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
        }
    });
    $(document).ready(function () {
        var model = new QuoteModels.Quote(require.mozuData("quote") || {});
        var quoteView = new QuoteView({
            el: $('#mz-view-quote-page'),
            templateName: 'modules/b2b-account/quotes/view-quote',
            model: model
        });
        quoteView.render();
    });
});
