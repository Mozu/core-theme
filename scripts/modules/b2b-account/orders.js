define(["modules/jquery-mozu", 'modules/api', "underscore", "hyprlive", "modules/backbone-mozu", "hyprlivecontext", 'modules/mozu-grid/mozugrid-view', 'modules/mozu-grid/mozugrid-pagedCollection', "modules/views-paging", 'modules/editable-view', 'modules/models-customer', 'modules/models-orders', 'modules/models-cart', 'modules/models-b2b-account', 'pages/myaccount', 'modules/message-handler'], function ($, api, _, Hypr, Backbone, HyprLiveContext, MozuGrid, MozuGridCollection, PagingViews, EditableView, CustomerModels, OrderModels, CartModels, B2BAccountModels, OrderViews, MessageHandler) {
    var DEFAULT_ORDER_FILTER = 'Status ne Created and Status ne Validated and Status ne Pending and Status ne Abandoned and Status ne Errored';
    var USER_ORDER_FILTER = DEFAULT_ORDER_FILTER + ' and userId eq ' + require.mozuData('user').userId;

    var OrdersMozuGrid = MozuGrid.extend({
        render: function () {
            var self = this;
            this.populateWithUsers();
            MozuGrid.prototype.render.apply(self, arguments);
        },
        populateWithUsers: function () {
            var self = this;
            self.model.get('items').models.forEach(function (order) {
                var userInQuestion = window.b2bUsers.find(function (user) {
                    return (user.userId === order.get('userId'));
                });
                order.set('fullName', userInQuestion.firstName + ' ' + userInQuestion.lastName);
            });
            return self.model;
        }
    });
    var OrdersView = Backbone.MozuView.extend({
        templateName: "modules/b2b-account/orders/orders",
        render: function () {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var collection = new OrdersGridCollectionModel({ autoload: false });
            // If the user has permission to view all child orders, we want
            // them to view all child orders by default.
            //   var orderHistory = CustomerModels.Customer.fromCurrent().get('orderHistory');
            //   collection.set(orderHistory);
            this.initializeGrid(collection);
            this.initializeOrderView();
        },
        initialize: function () {
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
            this.model.set('viewingAllOrders', false);
        },
        initializeOrderView: function () {
            var self = this;
            if (this.model.get('currentOrder')) {
                var orderView = new OrderViews.OrderHistoryListingView({
                    templateName: 'modules/my-account/order-history-listing',
                    el: $('.mz-b2b-order-view'),
                    model: this.model.get('currentOrder'),
                    messagesEl: $('#orders-messages')
                });
                orderView.model.set('limitPlaceReturns', self.model.limitPlaceReturns());
                orderView.render();
            }
        },
        initializeGrid: function (collection) {
            var self = this;
            if (!self.model.get('viewingAllOrders')) {
                collection.filterBy(USER_ORDER_FILTER);
            } else {
                collection.reload();
            }
            self._ordersGridView = new OrdersMozuGrid({
                el: $('.mz-b2b-orders-grid'),
                model: collection
            });

            self._ordersGridView.listenTo(self._ordersGridView.model, 'viewOrder', self.viewOrder.bind(self));
            self._ordersGridView.listenTo(self._ordersGridView.model, 'reorder', self.reorder.bind(self));
        },
        toggleViewAllOrders: function (e) {
            var self = this;
            self._ordersGridView.model.setPage(1);
            if (e.currentTarget.checked) {
                self.model.set('viewingAllOrders', true);
                self._ordersGridView.model.filterBy(DEFAULT_ORDER_FILTER);
            } else {
                self.model.set('viewingAllOrders', false);
                self._ordersGridView.model.filterBy(USER_ORDER_FILTER);
            }
        },
        viewOrder: function (row) {
            this.model.set('viewOrder', true);
            this.model.set('currentOrder', row);
            var currentOrder = this.model.get('currentOrder');
            this.render();
        },
        returnToGrid: function () {
            this.model.set('viewOrder', false);
            this.render();
        },
        reorder: function (e, row) {
            var self = this;
            var order = row || new Backbone.MozuModel(self.model.get('currentOrder').attributes);
            var cart = CartModels.Cart.fromCurrent();
            var products = order.get('items');
            $('.mz-b2b-orders-grid').addClass('is-loading');
            cart.apiModel.addBulkProducts({ postdata: products, throwErrorOnInvalidItems: false }).then(function () {
                window.location = (HyprLiveContext.locals.siteContext.siteSubdirectory || '') + "/cart";
            }, function (error) {
                $('.mz-b2b-orders-grid').removeClass('is-loading');
                if (error.items) {
                    var errorMessage = "";
                    _.each(error.items, function (error) {
                        var errorProp = _.find(error.additionalErrorData, function (errorData) {
                            return errorData.name === "Property";
                        });
                        errorMessage += ('</br ><strong>' + errorProp.value + '</strong> : ' + error.message);
                    });
                    MessageHandler.saveMessage('Reorder', 'BulkReorderErrors', errorMessage);
                    MessageHandler.showMessage('Reorder');
                }
            });
        }
    });

    var OrdersModel = CustomerModels.EditableCustomer.extend({
        helpers: ['limitPlaceReturns', 'limitPlaceOrders'],
        // 1009 = initiate returns
        limitPlaceReturns: function () {
            return !this.hasRequiredBehavior(1009);
        },
        limitPlaceOrders: function () {
            return !this.hasRequiredBehavior(1008);
        }
    });

    var OrdersGridCollectionModel = MozuGridCollection.extend({
        mozuType: 'orders',
        baseRequestParams: {
            mode: "synthesized"
        },
        defaultSort: 'submittedDate desc',
        columns: [
            {
                index: 'orderNumber',
                displayName: 'Order Number',
                sortable: true
            },
            {
                index: 'submittedDate',
                displayName: 'Submitted Date',
                sortable: true,
                displayTemplate: function (value) {
                    var date = new Date(value);
                    return date.toLocaleDateString();
                }
            },
            {
                index: 'fulfillmentInfo',
                displayName: 'Ship To',
                sortable: false,
                displayTemplate: function (fulfillmentInfo) {
                    // Form a readable address string.
                    // TODO: WOW. This is all really bad. Try again.
                    var fulfilmentContact = fulfillmentInfo.fulfillmentContact || {};

                    if (fulfilmentContact.address) {
                        var address = fulfillmentInfo.fulfillmentContact.address;
                        var firstLine = address.address1;
                        var tooltip = $('<span />').attr('class', 'tooltiptext').html('tooly');
                        var container = $('<div />').attr('class', 'tooltip').html(firstLine + tooltip.prop('outerHTML'));
                        var tooltipText = address.address1;
                        if (address.address2) tooltipText += '</br>' + address.address2;
                        if (address.address3) tooltipText += '</br>' + address.address3;
                        if (address.address4) tooltipText += '</br>' + address.address4;
                        tooltipText += '</br>' + (address.cityOrTown || '');
                        tooltipText += ', ' + (address.stateOrProvince || '') + ' ';
                        tooltipText += address.postalOrZipCode;
                        tooltipText += '</br>' + (address.countryCode || '');

                        return '<span class="grid-tooltip">' + firstLine + '<span class="tooltiptext">' + tooltipText + '</span></span>';
                    }
                    return "N/A";
                }
            },
            {
                index: 'fullName',
                displayName: 'Created By',
                sortable: false,
                displayTemplate: function (fullName) {
                    return fullName || '';
                }
            },
            {
                index: 'total',
                displayName: 'Order Total',
                sortable: false,
                displayTemplate: function (amount) {
                    return '$' + amount.toFixed(2);
                }
            },
            {
                index: 'status',
                displayName: 'Order Status',
                sortable: false
            }
        ],
        rowActions: [
            {
                displayName: 'View',
                action: 'viewOrder'
            },
            {
                displayName: 'Reorder',
                action: 'reorder',
                isHidden: function () {
                    // 1008 = Can place orders
                    return !this.hasRequiredBehavior(1008);
                }
            }
        ],
        relations: {
            items: Backbone.Collection.extend({
                model: OrderModels.Order
            })
        },
        viewOrder: function (e, row) {
            this.trigger('viewOrder', row);
        },
        reorder: function (e, row) {
            this.trigger('reorder', e, row);
        },
        backToGrid: function () {
            this.set('viewOrder', false);
        }
    });

    return {
        'OrdersView': OrdersView,
        'OrdersModel': OrdersModel
    };

});
