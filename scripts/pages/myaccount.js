define(['modules/backbone-mozu', "modules/api", 'hyprlive', 'hyprlivecontext', 'modules/jquery-mozu', 'underscore', 'modules/models-customer', 'modules/views-paging', 'modules/editable-view'], function(Backbone, Api, Hypr, HyprLiveContext, $, _, CustomerModels, PagingViews, EditableView) {

    var AccountSettingsView = EditableView.extend({
        templateName: 'modules/my-account/my-account-settings',
        autoUpdate: [
            'firstName',
            'lastName',
            'emailAddress',
            'acceptsMarketing'
        ],
        constructor: function() {
            EditableView.apply(this, arguments);
            this.editing = false;
            this.invalidFields = {};
        },
        initialize: function() {
            return this.model.getAttributes().then(function(customer) {
                customer.get('attributes').each(function(attribute) {
                    attribute.set('attributeDefinitionId', attribute.get('id'));
                });
                return customer;
            });
        },
        updateAttribute: function(e) {
            var self = this;
            var attributeFQN = e.currentTarget.getAttribute('data-mz-attribute');
            var attribute = this.model.get('attributes').findWhere({
                attributeFQN: attributeFQN
            });
            var nextValue = attribute.get('inputType') === 'YesNo' ? $(e.currentTarget).prop('checked') : $(e.currentTarget).val();

            attribute.set('values', [nextValue]);
            attribute.validate('values', {
                valid: function(view, attr, error) {
                    self.$('[data-mz-attribute="' + attributeFQN + '"]').removeClass('is-invalid')
                        .next('[data-mz-validationmessage-for="' + attr + '"]').text('');
                },
                invalid: function(view, attr, error) {
                    self.$('[data-mz-attribute="' + attributeFQN + '"]').addClass('is-invalid')
                        .next('[data-mz-validationmessage-for="' + attr + '"]').text(error);
                }
            });
        },
        startEdit: function(event) {
            event.preventDefault();
            this.editing = true;
            this.render();
        },
        cancelEdit: function() {
            this.editing = false;
            this.afterEdit();
        },
        finishEdit: function() {
            var self = this;

            this.doModelAction('apiUpdate').then(function() {
                self.editing = false;
            }).otherwise(function() {
                self.editing = true;
            }).ensure(function() {
                self.afterEdit();
            });
        },
        afterEdit: function() {
            var self = this;

            self.initialize().ensure(function() {
                self.render();
            });
        }
    });

    var PasswordView = EditableView.extend({
        templateName: 'modules/my-account/my-account-password',
        autoUpdate: [
            'oldPassword',
            'password',
            'confirmPassword'
        ],
        startEditPassword: function() {
            this.editing.password = true;
            this.render();
        },
        finishEditPassword: function() {
            var self = this;
            this.doModelAction('changePassword').then(function() {
                _.delay(function() {
                    self.$('[data-mz-validationmessage-for="passwordChanged"]').show().text(Hypr.getLabel('passwordChanged')).fadeOut(3000);
                }, 250);
            }, function() {
                self.editing.password = true;
            });
            this.editing.password = false;
        },
        cancelEditPassword: function() {
            this.editing.password = false;
            this.render();
        }
    });

    var WishListView = EditableView.extend({
        templateName: 'modules/my-account/my-account-wishlist',
        addItemToCart: function(e) {
            var self = this,
                $target = $(e.currentTarget),
                id = $target.data('mzItemId');
            if (id) {
                this.editing.added = id;
                return this.doModelAction('addItemToCart', id);
            }
        },
        doNotRemove: function() {
            this.editing.added = false;
            this.editing.remove = false;
            this.render();
        },
        beginRemoveItem: function(e) {
            var self = this;
            var id = $(e.currentTarget).data('mzItemId');
            if (id) {
                this.editing.remove = id;
                this.render();
            }
        },
        finishRemoveItem: function(e) {
            var self = this;
            var id = $(e.currentTarget).data('mzItemId');
            if (id) {
                var removeWishId = id;
                return this.model.apiDeleteItem(id).then(function() {
                    self.editing.remove = false;
                    var itemToRemove = self.model.get('items').where({
                        id: removeWishId
                    });
                    if (itemToRemove) {
                        self.model.get('items').remove(itemToRemove);
                        self.render();
                    }
                });
            }
        }
    });


    var OrderHistoryView = Backbone.MozuView.extend({
        templateName: "modules/my-account/order-history-list",
        getRenderContext: function() {
            var context = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            context.returning = this.returning;
            if (!this.returning) {
                context.returning = [];
            }
            context.returningPackage = this.returningPackage;
            return context;
        },
        render: function() {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);

            $.each(this.$el.find('[data-mz-order-history-listing]'), function(index, val) {

                var orderId = $(this).data('mzOrderId');
                var myOrder = self.model.get('items').get(orderId);
                var orderHistoryListingView = new OrderHistoryListingView({
                    el: $(this).find('.listing'),
                    model: myOrder,
                    messagesEl: $(this).find('[data-order-message-bar]')
                });
                orderHistoryListingView.render();
            });
        },
        selectReturnItems: function() {
            if (typeof this.returning == 'object') {
                $.each(this.returning, function(index, value) {
                    $('[data-mz-start-return="' + value + '"]').prop('checked', 'checked');
                });
            }
        },
        addReturnItem: function(itemId) {
            if (typeof this.returning == 'object') {
                this.returning.push(itemId);
                return;
            }
            this.returning = [itemId];
        },
        removeReturnItem: function(itemId) {
            if (typeof this.returning == 'object') {
                if (this.returning.length === 0) {
                    delete this.returning;
                } else {
                    var itemIdx = this.returning.indexOf(itemId);
                    if (itemIdx != -1) {
                        this.returning.splice(itemIdx, 1);
                    }
                }
            }
        }
    });

    var OrderHistoryListingView = Backbone.MozuView.extend({
        templateName: "modules/my-account/order-history-listing",
        initialize: function() {
            this._views = {
                standardView: this,
                returnView: null
            };
        },
        views: function() {
            return this._views;
        },
        getRenderContext: function() {
            var context = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            context.returning = this.returning;
            if (!this.returning) {
                context.returning = [];
            }
            context.returningPackage = this.returningPackage;
            return context;
        },
        render: function() {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);

            if (!this._views.returnView) {
                this._views.returnView = new ReturnOrderListingView({
                    el: self.el,
                    model: self.model
                });
                this.views().returnView.on('renderMessage', this.renderMessage, this);
                this.views().returnView.on('returnCancel', this.returnCancel, this);
                this.views().returnView.on('returnSuccess', this.returnSuccess, this);
                this.views().returnView.on('returnFailure', this.returnFailure, this);
            }   
        },
        renderMessage: function(message) {
            var self = this;
            if (message) {
                if (message.messageType) {
                    message.autoFade = true;
                    this.model.messages.reset([message]);
                    this.messageView.render();
                }
            }
        },
        returnSuccess: function() {
            this.renderMessage({
                messageType: 'returnSuccess'
            });
            this.render();
        },
        returnFailure: function() {
            this.renderMessage({
                messageType: 'returnFailure'
            });
            this.render();
        },
        returnCancel: function() {
            this.render();
        },
        selectReturnItems: function() {
            if (typeof this.returning == 'object') {
                $.each(this.returning, function(index, value) {
                    $('[data-mz-start-return="' + value + '"]').prop('checked', 'checked');
                });
            }
        },
        addReturnItem: function(itemId) {
            if (typeof this.returning == 'object') {
                this.returning.push(itemId);
                return;
            }
            this.returning = [itemId];
        },
        removeReturnItem: function(itemId) {
            if (typeof this.returning == 'object') {
                if (this.returning.length === 0) {
                    delete this.returning;
                } else {
                    var itemIdx = this.returning.indexOf(itemId);
                    if (itemIdx != -1) {
                        this.returning.splice(itemIdx, 1);
                    }
                }
            }
        },
        startOrderReturn: function(e) {
            this.model.clearReturn();
            this.views().returnView.render();
        }
    });

    var ReturnOrderListingView = Backbone.MozuView.extend({
        templateName: "modules/my-account/order-history-listing-return",
        getRenderContext: function() {
            var context = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            var order = this.model;
            if (order) {
                this.order = order;
                context.order = order.toJSON();
            }
            return context;
        },
        render: function() {
            var self = this;
            var returnItemViews = [];

            self.model.fetchReturnableItems().then(function(data) {
                var returnableItems = self.model.returnableItems(data.items);
                if (self.model.getReturnableItems().length < 1) {
                    self.trigger('renderMessage', {
                        messageType: 'noReturnableItems'
                    });
                    //self.$el.find('[data-mz-message-for="noReturnableItems"]').show().text(Hypr.getLabel('noReturnableItems')).fadeOut(6000);
                    return false;
                }
                Backbone.MozuView.prototype.render.apply(self, arguments);

                $.each(self.$el.find('[data-mz-order-history-listing-return-item]'), function(index, val) {
                    var packageItem = returnableItems.find(function(model) {
                        if($(val).data('mzOrderLineId') === model.get('orderLineId')){
                            if ($(val).data('mzOptionAttributeFqn')) {
                                return (model.get('orderItemOptionAttributeFQN') === $(val).data('mzOptionAttributeFqn') && model.uniqueProductCode() === $(val).data('mzProductCode'));
                            }
                            return (model.uniqueProductCode() === $(val).data('mzProductCode'));
                        }
                        return false;
                    });

                    returnItemViews.push(new ReturnOrderItemView({
                        el: this,
                        model: packageItem
                    }));
                });

                _.invoke(returnItemViews, 'render');

            });

        },
        clearOrderReturn: function() {
            this.model.clearReturn();
            this.$el.find('[data-mz-value="isSelectedForReturn"]:checked').click();
        },
        cancelOrderReturn: function() {
            this.clearOrderReturn();
            this.trigger('returnCancel');
        },
        finishOrderReturn: function() {
            var self = this,
                op = this.model.finishReturn();
            if (op) {
                return op.then(function(data) {
                    self.model.isLoading(false);
                    self.clearOrderReturn();
                    self.trigger('returnSuccess');
                }, function() {
                    self.model.isLoading(false);
                    self.clearOrderReturn();
                    this.trigger('returnFailure');
                });
            }
        }
    });

    var ReturnOrderItemView = Backbone.MozuView.extend({
        templateName: "modules/my-account/order-history-listing-return-item",
        autoUpdate: [
            'isSelectedForReturn',
            'rmaReturnType',
            'rmaReason',
            'rmaQuantity',
            'rmaComments'
        ],
        dataTypes: {
            'isSelectedForReturn': Backbone.MozuModel.DataTypes.Boolean
        },
        startReturnItem: function(e) {
            var $target = $(e.currentTarget);

            if (this.model.uniqueProductCode()) {
                if (!e.currentTarget.checked) {
                    this.model.set('isSelectedForReturn', false);
                    //var itemDetails = packageItem.getItemDetails();
                    this.model.cancelReturn();
                    this.render();

                    return;
                }

                this.model.set('isSelectedForReturn', true);
                this.model.startReturn();
                this.render();
            }
        },
        render: function() {
            Backbone.MozuView.prototype.render.apply(this, arguments);
        }
    });

    var ReturnHistoryView = Backbone.MozuView.extend({
        templateName: "modules/my-account/return-history-list",
        initialize: function() {
            var self = this;
            this.listenTo(this.model, "change:pageSize", _.bind(this.model.changePageSize, this.model));
            this.listenTo(this.model, 'returndisplayed', function(id) {
                var $retView = self.$('[data-mz-id="' + id + '"]');
                if ($retView.length === 0) $retView = self.$el;
                $retView.ScrollTo({
                    axis: 'y'
                });
            });
        },
        printReturnLabel: function(e) {
            var self = this,
                $target = $(e.currentTarget);

            //Get Whatever Info we need to our shipping label
            var returnId = $target.data('mzReturnid'),
                returnObj = self.model.get('items').findWhere({
                    id: returnId
                });

            var printReturnLabelView = new PrintView({
                model: returnObj
            });

            var _totalRequestCompleted = 0;

            _.each(returnObj.get('packages'), function(value, key, list) {
                window.accountModel.apiGetReturnLabel({
                    'returnId': returnId,
                    'packageId': value.id,
                    'returnAsBase64Png': true
                }).then(function(data) {
                    value.labelImageSrc = 'data:image/png;base64,' + data;
                    _totalRequestCompleted++;
                    if (_totalRequestCompleted == list.length) {
                        printReturnLabelView.render();
                        printReturnLabelView.loadPrintWindow();
                    }
                });
            });

        }
    });

    var PrintView = Backbone.MozuView.extend({
        templateName: "modules/my-account/my-account-print-window",
        el: $('#mz-printReturnLabelView'),
        initialize: function() {},
        loadPrintWindow: function() {
            var host = HyprLiveContext.locals.siteContext.cdnPrefix,
                printScript = host + "/scripts/modules/print-window.js",
                printStyles = host + "/stylesheets/modules/my-account/print-window.css";

            var my_window,
                self = this,
                width = window.screen.width - (window.screen.width / 2),
                height = window.screen.height - (window.screen.height / 2),
                offsetTop = 200,
                offset = window.screen.width * 0.25;


            my_window = window.open("", 'mywindow' + Math.random() + ' ', 'width=' + width + ',height=' + height + ',top=' + offsetTop + ',left=' + offset + ',status=1');
            my_window.document.write('<html><head>');
            my_window.document.write('<link rel="stylesheet" href="' + printStyles + '" type="text/css">');
            my_window.document.write('</head>');

            my_window.document.write('<body>');
            my_window.document.write($('#mz-printReturnLabelView').html());

            my_window.document.write('<script src="' + printScript + '"></script>');

            my_window.document.write('</body></html>');
        }
    });

    //var scrollBackUp = _.debounce(function () {
    //    $('#orderhistory').ScrollTo({ axis: 'y', offsetTop: Hypr.getThemeSetting('gutterWidth') });
    //}, 100);
    //var OrderHistoryPageNumbers = PagingViews.PageNumbers.extend({
    //    previous: function () {
    //        var op = PagingViews.PageNumbers.prototype.previous.apply(this, arguments);
    //        if (op) op.then(scrollBackUp);
    //    },
    //    next: function () {
    //        var op = PagingViews.PageNumbers.prototype.next.apply(this, arguments);
    //        if (op) op.then(scrollBackUp);
    //    },
    //    page: function () {
    //        var op = PagingViews.PageNumbers.prototype.page.apply(this, arguments);
    //        if (op) op.then(scrollBackUp);
    //    }
    //});

    var PaymentMethodsView = EditableView.extend({
        templateName: "modules/my-account/my-account-paymentmethods",
        autoUpdate: [
            'editingCard.isDefaultPayMethod',
            'editingCard.paymentOrCardType',
            'editingCard.nameOnCard',
            'editingCard.cardNumberPartOrMask',
            'editingCard.expireMonth',
            'editingCard.expireYear',
            'editingCard.cvv',
            'editingCard.isCvvOptional',
            'editingCard.contactId',
            'editingContact.firstName',
            'editingContact.lastNameOrSurname',
            'editingContact.address.address1',
            'editingContact.address.address2',
            'editingContact.address.address3',
            'editingContact.address.cityOrTown',
            'editingContact.address.countryCode',
            'editingContact.address.stateOrProvince',
            'editingContact.address.postalOrZipCode',
            'editingContact.address.addressType',
            'editingContact.phoneNumbers.home',
            'editingContact.isBillingContact',
            'editingContact.isPrimaryBillingContact',
            'editingContact.isShippingContact',
            'editingContact.isPrimaryShippingContact'
        ],
        renderOnChange: [
            'editingCard.isDefaultPayMethod',
            'editingCard.contactId',
            'editingContact.address.countryCode'
        ],
        beginEditCard: function(e) {
            var id = this.editing.card = e.currentTarget.getAttribute('data-mz-card');
            this.model.beginEditCard(id);
            this.render();
        },
        finishEditCard: function() {
            var self = this;
            var operation = this.doModelAction('saveCard');
            if (operation) {
                operation.otherwise(function() {
                    self.editing.card = true;
                });
                this.editing.card = false;
            }
        },
        cancelEditCard: function() {
            this.editing.card = false;
            this.model.endEditCard();
            this.render();
        },
        beginDeleteCard: function(e) {
            var self = this,
                id = e.currentTarget.getAttribute('data-mz-card'),
                card = this.model.get('cards').get(id);
            if (window.confirm(Hypr.getLabel('confirmDeleteCard', card.get('cardNumberPart')))) {
                this.doModelAction('deleteCard', id);
            }
        }
    });

    var AddressBookView = EditableView.extend({
        templateName: "modules/my-account/my-account-addressbook",
        autoUpdate: [
            'editingContact.firstName',
            'editingContact.lastNameOrSurname',
            'editingContact.address.address1',
            'editingContact.address.address2',
            'editingContact.address.address3',
            'editingContact.address.cityOrTown',
            'editingContact.address.countryCode',
            'editingContact.address.stateOrProvince',
            'editingContact.address.postalOrZipCode',
            'editingContact.address.addressType',
            'editingContact.phoneNumbers.home',
            'editingContact.isBillingContact',
            'editingContact.isPrimaryBillingContact',
            'editingContact.isShippingContact',
            'editingContact.isPrimaryShippingContact'
        ],
        renderOnChange: [
            'editingContact.address.countryCode',
            'editingContact.isBillingContact',
            'editingContact.isShippingContact'
        ],
        beginAddContact: function() {
            this.editing.contact = "new";
            this.render();
        },
        beginEditContact: function(e) {
            var id = this.editing.contact = e.currentTarget.getAttribute('data-mz-contact');
            this.model.beginEditContact(id);
            this.render();
        },
        finishEditContact: function() {
            var self = this,
                isAddressValidationEnabled = HyprLiveContext.locals.siteContext.generalSettings.isAddressValidationEnabled;
            var operation = this.doModelAction('saveContact', {
                forceIsValid: isAddressValidationEnabled
            }); // hack in advance of doing real validation in the myaccount page, tells the model to add isValidated: true
            if (operation) {
                operation.otherwise(function() {
                    self.editing.contact = true;
                });
                this.editing.contact = false;
            }
        },
        cancelEditContact: function() {
            this.editing.contact = false;
            this.model.endEditContact();
            this.render();
        },
        beginDeleteContact: function(e) {
            var self = this,
                contact = this.model.get('contacts').get(e.currentTarget.getAttribute('data-mz-contact')),
                associatedCards = this.model.get('cards').where({
                    contactId: contact.id
                }),
                windowMessage = Hypr.getLabel('confirmDeleteContact', contact.get('address').get('address1')),
                doDeleteContact = function() {
                    return self.doModelAction('deleteContact', contact.id);
                },
                go = doDeleteContact;


            if (associatedCards.length > 0) {
                windowMessage += ' ' + Hypr.getLabel('confirmDeleteContact2');
                go = function() {
                    return self.doModelAction('deleteMultipleCards', _.pluck(associatedCards, 'id')).then(doDeleteContact);
                };

            }

            if (window.confirm(windowMessage)) {
                return go();
            }
        }
    });

    var StoreCreditView = Backbone.MozuView.extend({
        templateName: 'modules/my-account/my-account-storecredit',
        addStoreCredit: function(e) {
            var self = this;
            var id = this.$('[data-mz-entering-credit]').val();
            if (id) return this.model.addStoreCredit(id).then(function() {
                return self.model.getStoreCredits();
            });
        }
    });


    $(document).ready(function() {

        var accountModel = window.accountModel = CustomerModels.EditableCustomer.fromCurrent();

        var $accountSettingsEl = $('#account-settings'),
            $passwordEl = $('#password-section'),
            $orderHistoryEl = $('#account-orderhistory'),
            $returnHistoryEl = $('#account-returnhistory'),
            $paymentMethodsEl = $('#account-paymentmethods'),
            $addressBookEl = $('#account-addressbook'),
            $wishListEl = $('#account-wishlist'),
            $messagesEl = $('#account-messages'),
            $storeCreditEl = $('#account-storecredit'),
            orderHistory = accountModel.get('orderHistory'),
            returnHistory = accountModel.get('returnHistory');

        var accountViews = window.accountViews = {
            settings: new AccountSettingsView({
                el: $accountSettingsEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            password: new PasswordView({
                el: $passwordEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),

            orderHistory: new OrderHistoryView({
                el: $orderHistoryEl.find('[data-mz-orderlist]'),
                model: orderHistory
            }),
            orderHistoryPagingControls: new PagingViews.PagingControls({
                templateName: 'modules/my-account/order-history-paging-controls',
                el: $orderHistoryEl.find('[data-mz-pagingcontrols]'),
                model: orderHistory
            }),
            orderHistoryPageNumbers: new PagingViews.PageNumbers({
                el: $orderHistoryEl.find('[data-mz-pagenumbers]'),
                model: orderHistory
            }),
            returnHistory: new ReturnHistoryView({
                el: $returnHistoryEl.find('[data-mz-orderlist]'),
                model: returnHistory
            }),
            returnHistoryPagingControls: new PagingViews.PagingControls({
                templateName: 'modules/my-account/order-history-paging-controls',
                el: $returnHistoryEl.find('[data-mz-pagingcontrols]'),
                model: returnHistory
            }),
            returnHistoryPageNumbers: new PagingViews.PageNumbers({
                el: $returnHistoryEl.find('[data-mz-pagenumbers]'),
                model: returnHistory
            }),
            paymentMethods: new PaymentMethodsView({
                el: $paymentMethodsEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            addressBook: new AddressBookView({
                el: $addressBookEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            storeCredit: new StoreCreditView({
                el: $storeCreditEl,
                model: accountModel,
                messagesEl: $messagesEl
            })
        };


        if (HyprLiveContext.locals.siteContext.generalSettings.isWishlistCreationEnabled) accountViews.wishList = new WishListView({
            el: $wishListEl,
            model: accountModel.get('wishlist'),
            messagesEl: $messagesEl
        });

        // TODO: upgrade server-side models enough that there's no delta between server output and this render,
        // thus making an up-front render unnecessary.
        _.invoke(window.accountViews, 'render');

    });
});