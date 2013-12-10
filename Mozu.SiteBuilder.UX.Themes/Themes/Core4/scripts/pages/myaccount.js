define(['modules/backbone-mozu', 'hyprlive', 'modules/jquery-mozu', 'shim!vendor/underscore>_', 'modules/models-customer', 'modules/views-paging'], function(Backbone, Hypr, $, _, CustomerModels, PagingViews) {
    
    var EditableView = Backbone.MozuView.extend({
        constructor: function () {
            Backbone.MozuView.apply(this, arguments);
            this.editing = {};
        },
        getRenderContext: function () {
            var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            c.editing = this.editing;
            return c;
        },
        doModelAction: function (action, payload) {
            var self = this,
                renderAlways = function () {
                    self.render();
                };
            var operation = this.model[action](payload);
            if (operation.then) {
                operation.then(renderAlways,renderAlways);
            }
        }
    });
        

    var AccountSettingsView = EditableView.extend({
        templateName: 'modules/my-account/my-account-settings',
        autoUpdate: [
            'firstName',
            'lastName',
            //'primaryBillingContact.phoneNumbers.home',
            'oldPassword',
            'password',
            'confirmPassword',
            'acceptsMarketing'
        ],
        initialize: function () {
            var self = this;
            this.listenTo(this.model, 'change:acceptsMarketing', function (model, value) {
                self.model.apiUpdate({ acceptsMarketing: value });
            });
        },
        startEditName: function () {
            this.editing.name = true;
            this.render();
        },
        cancelEditName: function() {
            this.editing.name = false;
            this.render();
        },
        finishEditName: function () {
            this.doModelAction('updateName');
            this.editing.name = false;
        },
        startEditPassword: function () {
            this.editing.password = true;
            this.render();
        },
        finishEditPassword: function() {
            this.doModelAction('changePassword');
            this.editing.password = false;
        },
        cancelEditPassword: function() {
            this.editing.password = false;
            this.render();
        }
        //startEditPhone: function() {
        //    this.editing.phone = true;
        //    this.render();
        //},
        //finishEditPhone: function() {
        //    this.doModelAction('savePrimaryBillingContact');
        //    this.editing.phone = false;
        //},
        //cancelEditPhone: function() {
        //    this.editing.phone = false;
        //    this.render();
        //}
    });

    var WishListView = EditableView.extend({
        templateName: 'modules/my-account/my-account-wishlist',
        addItemToCart: function (e) {
            var self = this, $target = $(e.currentTarget),
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
        beginRemoveItem: function (e) {
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
            return this.model.apiDeleteItem(id).then(function () {
                self.editing.remove = false;
                return self.model.apiGet();
            })
        }
    });


    var OrderHistoryView = Backbone.MozuView.extend({
        templateName: "modules/common/order-list",
        initialize: function () {
            this.listenTo(this.model, "change:pageSize", _.bind(this.model.changePageSize, this.model));
        }
    });

    var PaymentMethodsView = EditableView.extend({
        templateName: "modules/my-account/my-account-paymentmethods",
        autoUpdate: [
            'editingCard.paymentOrCardType',
            'editingCard.nameOnCard',
            'editingCard.cardNumberPartOrMask',
            'editingCard.expireMonth',
            'editingCard.expireYear',
            'editingCard.cvv',
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
            'editingContact.phoneNumbers.home',
            'editingContact.isBillingContact',
            'editingContact.isPrimaryBillingContact',
            'editingContact.isShippingContact',
            'editingContact.isPrimaryShippingContact'
        ],
        renderOnChange: [
            'editingCard.contactId',
            'editingContact.address.countryCode'
        ],
        beginEditCard: function (e) {
            var id = this.editing.card = e.currentTarget.getAttribute('data-mz-card');
            this.model.beginEditCard(id);
            this.render();
        },
        finishEditCard: function () {
            this.doModelAction('saveCard');
            this.editing.card = false;
        },
        cancelEditCard: function () {
            this.editing.card = false;
            this.model.endEditCard();
            this.render();
        },
        beginDeleteCard: function (e) {
            var self = this,
                id = e.currentTarget.getAttribute('data-mz-card'),
                card = this.model.get('cards').get(id);
            if (confirm(Hypr.getLabel('confirmDeleteCard', card.get('cardNumberPart')))) {
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
            'editingContact.phoneNumbers.home',
            'editingContact.isBillingContact',
            'editingContact.isPrimaryBillingContact',
            'editingContact.isShippingContact',
            'editingContact.isPrimaryShippingContact',
            ],
        renderOnChange: [
            'editingContact.address.countryCode',
            'editingContact.isBillingContact',
            'editingContact.isShippingContact'
        ],
        beginAddContact: function () {
            this.editing.contact = "new";
            this.render();
        },
        beginEditContact: function (e) {
            var id = this.editing.contact = e.currentTarget.getAttribute('data-mz-contact');
            this.model.beginEditContact(id);
            this.render();
        },
        finishEditContact: function () {
            this.doModelAction('saveContact');
            this.editing.contact = false;
        },
        cancelEditContact: function () {
            this.editing.contact = false;
            this.model.endEditContact();
            this.render();
        },
        beginDeleteContact: function (e) {
            var self = this,
                id = e.currentTarget.getAttribute('data-mz-contact'),
                contact = this.model.get('contacts').get(id);
            if (confirm(Hypr.getLabel('confirmDeleteContact', contact.get('address').get('address1')))) {
                this.doModelAction('deleteContact', id);
            }
        }
    });

        
    $(document).ready(function () {

        var accountModel = window.accountModel =  CustomerModels.Customer.fromCurrent();

        var $accountSettingsEl = $('#account-settings'),
            $orderHistoryEl = $('#account-orderhistory'),
            $paymentMethodsEl = $('#account-paymentmethods'),
            $addressBookEl = $('#account-addressbook'),
            $wishListEl = $('#account-wishlist'),
            $messagesEl = $('#account-messages'),
            orderHistory = accountModel.get('orderHistory');

        window.accountViews = {
            settings: new AccountSettingsView({
                el: $accountSettingsEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            orderHistory: new OrderHistoryView({
                el: $orderHistoryEl.find('[data-mz-orderlist]'),
                model: orderHistory
            }),
            orderHistoryPagingControls: new PagingViews.PagingControls({
                el: $orderHistoryEl.find('[data-mz-pagingcontrols]'),
                model: orderHistory
            }),
            orderHistoryPageNumbers: new PagingViews.PageNumbers({
                el: $orderHistoryEl.find('[data-mz-pagenumbers]'),
                model: orderHistory
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
            wishList: new WishListView({
                el: $wishListEl,
                model: accountModel.get('wishlist'),
                messagesEl: $messagesEl
            })
        }

        // TODO: upgrade server-side models enough that there's no delta between server output and this render,
        // thus making an up-front render unnecessary.
        _.invoke(window.accountViews, 'render');

    });
});