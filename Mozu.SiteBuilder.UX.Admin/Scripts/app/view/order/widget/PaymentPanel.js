/**
 * @class Taco.view.order.widget.PaymentPanel
 */
Ext.define('Taco.view.order.widget.PaymentPanel', {
    extend: 'Ext.panel.Panel',
    ui: 'subform-section-child',

    margin: '10 0 10 0',
    bodyPadding: '0',

    requires: [
        'Ext.MessageBox',
        'Taco.view.order.modal.CreditPayment',
        'Taco.view.order.modal.RequestCheck',
        'Taco.view.order.modal.ApplyCheck',
        'Taco.view.order.modal.AddPurchaseOrder',
        'Taco.view.order.modal.CapturePayment',
        'Taco.view.order.modal.AuthAndCapture',
        'Taco.view.order.modal.ManualCapturePayment',
        'Taco.view.order.modal.ManualDeclinePayment',
        'Taco.view.order.modal.ManualVoidPayment',
        'Taco.view.order.modal.ManualCreditPayment',
        'Taco.view.order.modal.DeclineCheck',
        'Ext.window.MessageBox'
    ],
    cls: 'orderform-payment-transaction',
    initComponent: function (eOpts) {
        var me = this;
        me.setIsAutoCaptureEnabled();
        me.getavailableActionsLength();
        me.initStatusRow();
        me.initPaymentDetails();
        me.initDisplayAmount();
        me.initTransactionList();
    
        me.items = [
            me.statusRow,
            {
                xtype: 'container',
                cls: 'orderform-payment-main',
                layout: 'column',
                items: [
                    me.paymentDetails,
                    me.displayAmount
                ]
            }
        ];

        if (me.transactionList) {
            me.items.push(me.transactionList)
        }

        this.callParent(arguments);
    },

    setIsAutoCaptureEnabled: function() {
        this.isAutoCaptureEnabled = false 
        
        if (this.order.PaymentSettings.get('jobSettings').autoCaptureJob) {
          return this.isAutoCaptureEnabled = this.order.PaymentSettings.get('jobSettings').autoCaptureJob.isEnabled || false;  
        }
    },

    getavailableActionsLength: function () {
        var me = this;
            data = me.record.data;
        if (this.isAutoCaptureEnabled) {
            return ((data && data.availableActions).length == 0) ? true : false
          }
      },

    getAvailableActions: function() {
        var me = this,
            data = me.record.data,
            isDeclined = data && data.status === 'Declined',
            availableActions = data && data.availableActions;

        me.paymentActions = {};

        return Ext.Array.map([
            {
                text: 'Apply Check',
                itemId: 'ApplyCheck'
            },
            {
                text: 'Decline Check',
                itemId: 'DeclineCheck'
            },
            {
                text: 'Decline Payment',
                itemId: 'ManualDeclinePayment',
                //TODO: when service supports the data from the manual decline modal, comment out the below line
                handler: me.manualDeclinePayment,
                hidden: me.isAutoCaptureEnabled
            },
            {
                text: 'Credit Payment',
                itemId: 'CreditPayment',
                hidden: me.record.get('amountCollected') <= 0
            },
            {
                text: 'Auth and Capture',
                itemId: 'AuthAndCapture',
                disabled: isDeclined
            },
            {
                text: 'Rollback',
                itemId: 'Rollback',
                handler: me.rollBackTransaction
            },
            {
                text: 'Rollback Capture',
                itemId: 'RollbackCapture',
                handler: me.rollBackTransaction
            },
            {
                text: 'Rollback Credit',
                itemId: 'RollbackCredit',
                handler: me.rollBackTransaction
            },
            {
                text: 'Rollback Void',
                itemId: 'RollbackVoid',
                handler: me.rollBackTransaction
            },
            {
                text: 'Capture Payment (Manual)',
                itemId: 'ManualCapturePayment',
                hidden: me.isAutoCaptureEnabled
            },
            {
                text: 'Credit Payment (Manual)',
                itemId: 'ManualCreditPayment',
               // hidden: me.isAutoCaptureEnabled
            },
            {
                text: 'Void Payment',
                itemId: 'VoidPayment',
                handler: me.voidTransaction
            },
            {
                text: 'Void Payment (Manual)',
                itemId: 'ManualVoidPayment'
            }
        ], function(actionConf) {
            actionConf.hidden = actionConf.hidden || !Ext.Array.contains(availableActions, actionConf.itemId);
            Ext.applyIf(actionConf, {
                scope: me,
                handler: me.openPaymentActionModal
            });
            return me.paymentActions[actionConf.itemId] = new Ext.Action(actionConf);
        });

    },

    //Some of the fields on this panel rely on subpayment information. 
    //We use this function to determine whether there is a viable subpayment for this order
    //And return an accurate payment data object. 

    getPaymentData: function () {
        var me = this,
            payment = this.record.data,
            paymentData = payment;

        if (payment.subpayments) {
            var subpaymentForThisOrder = payment.subpayments.filter(function (subpayment) {
                return subpayment.target.targetId == me.order.data.id;
            })[0];

            if (subpaymentForThisOrder) {
                // Attributes that will be replaced with the subpayment's attribute include: 
                // status, amountCollected, amountCredited, amountRequested, amountRefunded
                paymentData = Ext.apply(payment, subpaymentForThisOrder);
                // NGCOM-1139 - Our subpayments don't hold onto any amountAuthorized, so if the original payment
                // data has an amountAuthorized value, it will be retained. We don't want this to appear in the UI
                // in cases where the subpayment status is Collected. 
                if (paymentData.status === "Collected") {
                    paymentData.amountAuthorized = 0;
                }
            }
        }
        return paymentData;
    },
    //large-type display amount for the total amount collected, displayed, or authorized

    initDisplayAmount: function () {
        var me = this;
        var cls = Taco.baseCSSPrefix + 'orderform-payment-amounts-summary',
            lbl = function (label, value) {
                return '<h4><span class="{cls}-label">' + label + '</span> <strong class="{cls}-value">' + value + '</strong></h4>';
            };

        var paymentData = this.getPaymentData();
        this.displayAmount = Ext.create('Ext.Component', {
            cls: cls,
            tpl: Ext.create('Ext.XTemplate',
                '<tpl if="this.displayAmountRequested(payment)">',
                lbl('Amount Requested: ', '{[values.orderRecord.formatCurrency(values.payment.amountRequested)]}'),
                '</tpl>',
                '<tpl if="payment.amountAuthorized != 0">',
                lbl('Amount Authorized: ', '{[values.orderRecord.formatCurrency(values.payment.amountAuthorized)]}'),
                '</tpl>',
                lbl('Amount Collected: ', '{[values.orderRecord.formatCurrency(values.payment.amountCollected)]}'),
                '<tpl if="payment.paymentType == \'PurchaseOrder\' && payment.status != \'Voided\'">',
                lbl('Amount Remaining: ', '{[values.orderRecord.formatCurrency(values.payment.amountRequested - values.payment.amountCollected)]}'),
                '</tpl>',
                '<tpl if="payment.amountCredited != 0">',
                lbl('Amount Credited: ', '{[values.orderRecord.formatCurrency(values.payment.amountCredited)]}'),
                '</tpl>',
                '<tpl if="payment.amountRefunded != 0">',
                lbl('Amount Refunded: ', '{[values.orderRecord.formatCurrency(values.payment.amountRefunded)]}'),
                '</tpl>',
                {
                    displayAmountRequested: function (payment) {
                        var paymentAmountsUntouched = (payment.amountCollected == 0 && payment.amountAuthorized == 0 && payment.amountCredited == 0);
                        var isPurchaseOrder = (payment.paymentType === 'PurchaseOrder');
                        var hasSubpayment = !!payment.subpayments;
                        if ((hasSubpayment || paymentAmountsUntouched) && !isPurchaseOrder) {
                            return true;
                        } else {
                            return false;
                        } 
                    }
                }
            ),
            data: {
                cls: cls,
                orderRecord: this.order,
                payment: paymentData
            }
        });
    },

    // shows status and action buttons and field depending on the state of the entity
    initStatusRow: function () {
        var me = this,
            // capture amount is the outstanding balance on the order
            captureAmount = me.order.data.authorizationInfo.totalAmount - me.order.data.authorizationInfo.amountCollected,
            // auth ready is when you have an authorized card with id
            authReady = Ext.Array.contains(me.record.data.availableActions, 'CapturePayment'),
            // can capture is when you are auth ready and your order has a positive capture amount
            canCapture = authReady && captureAmount && captureAmount > 0,
            // order is awaiting approval
            pendingReview = me.order.get('orderStatus') === 'PendingReview';
            
      
        var paymentStatus = this.getPaymentData().status;
        var packageStatus;

        var buttonLeft = null,
            buttonRight = null,
            purchaseOrderNumber = '';

        if (me.record.get('paymentType') === 'PurchaseOrder') {
            purchaseOrderNumber = '<br />Purchase Order #' + me.record.get('purchaseOrderInfo').purchaseOrderNumber;
        }

        if (me.record.get('paymentType') == 'PurchaseOrder') {
            if (paymentStatus === 'PaymentRequested') {
                buttonLeft = {
                    xtype: 'button',
                    ui: 'action',
                    scale: 'medium',
                    text: 'Authorize',
                    requiredBehaviors: [{
                        model: 'Taco.model.Order',
                        behavior: 'update'
                    },
                    {
                        model: 'Taco.model.Order',
                        behavior: 'paymentUpdate'
                    }],
                    width: 77,
                    itemId: 'authorizeButton',
                    handler: function () {
                        var data,
                            cfg,
                            msg;

                        data = {
                            orderId: me.order.getId(),
                            paymentId: me.record.getId(),
                            amount: me.record.get('amountRequested')
                        };

                        cfg = {
                            jsonData: data,
                            success: function (response) {
                                me.setLoading(false, me.body);

                                var json = Ext.decode(response.responseText, true);

                                if (!json || !json.success) {
                                    return;
                                }

                                me.order.reload();
                            },
                            failure: function () {
                                me.setLoading(false, me.body);
                            },
                            scope: this
                        };

                        var parentCheckoutNumber = me.order.get('parentCheckoutNumber');
                        var subpayments = me.record.data.subpayments;

                        if (subpayments && subpayments.length > 1) {
                            msg = "All child orders associated with Order Reference # "
                                + parentCheckoutNumber +
                                " will change to an authorized state. Are you sure you would like to proceed?";

                            this.actionModal = Ext.MessageBox.show({
                                title: 'Authorize Purchase Order',
                                rightJustifyButtons: true,
                                reverseOrder: true,
                                cls: 'auth-purchase-order',
                                msg: msg,
                                height: 200,
                                closable: false,
                                buttons: Ext.Msg.YESNO,
                                fn: function (val) {
                                    if (val !== 'yes') return;

                                    me.setLoading({
                                        msg: "Saving"
                                    }, me.body);

                                    // call the model method to persist the change
                                    me.order.authorize(cfg);
                                }
                            });
                        } else {
                            me.setLoading({
                                msg: "Saving"
                            }, me.body);

                            me.order.authorize(cfg);

                        }

                    }
                };
            } else if (paymentStatus === 'Authorized') {
                buttonLeft = {
                    xtype: 'button',
                    ui: 'action',
                    scale: 'medium',
                    text: 'Mark as Invoiced',
                    width: 115,
                    margin: '0 10 0 0',
                    itemId: 'invoicedButton',
                    handler: function () {
                        var data = {
                            orderId: me.order.getId(),
                            paymentId: me.record.getId()
                        },
                            cfg = {
                                jsonData: data,
                                success: function (response) {
                                    var json = Ext.decode(response.responseText, true);

                                    if (!json || !json.success) {
                                        return;
                                    }

                                    me.setLoading(false, me.body);
                                    me.order.reload();
                                },
                                failure: function () {
                                    me.setLoading(false, me.body)
                                },
                                scope: this
                            };

                        var parentCheckoutNumber = me.order.get('parentCheckoutNumber');
                        var subpayments = me.record.data.subpayments;

                        if (subpayments && subpayments.length > 1) {
                            var msg = "All child orders associated with Order Reference # "
                                + parentCheckoutNumber +
                                " will change to an invoiced state. Are you sure you would like to proceed?";

                            this.actionModal = Ext.MessageBox.show({
                                title: 'Invoice Purchase Order',
                                rightJustifyButtons: true,
                                reverseOrder: true,
                                cls: 'invoice-purchase-order',
                                msg: msg,
                                height: 200,
                                closable: false,
                                buttons: Ext.Msg.YESNO,
                                fn: function (val) {
                                    if (val !== 'yes') return;

                                    me.setLoading({
                                        msg: 'Saving'
                                    }, me.body);

                                    me.order.markAsInvoiced(cfg);
                                }
                            });
                        } else {
                            me.setLoading({
                                msg: 'Saving'
                            }, me.body);

                            me.order.markAsInvoiced(cfg);
                        } 
                    },
                    disabled: !canCapture || pendingReview,
                    requiredBehaviors: [{
                        model: 'Taco.model.Order',
                        behavior: 'update'
                    },
                    {
                        model: 'Taco.model.Order',
                        behavior: 'paymentUpdate'
                    }]
                };
                buttonRight = {
                    xtype: 'button',
                    ui: 'action',
                    scale: 'medium',
                    text: 'Capture',
                    width: 70,
                    itemId: 'captureButton',
                    handler: function () {
                        me.openPaymentActionModal((me.record.get('paymentType') === 'Check') ? 'ApplyCheck' : 'CapturePayment');
                    },
                    disabled: !canCapture || pendingReview,
                    requiredBehaviors: [{
                        model: 'Taco.model.Order',
                        behavior: 'update'
                    },
                    {
                        model: 'Taco.model.Order',
                        behavior: 'paymentUpdate'
                    }]
                };
            } else if (paymentStatus === 'Invoiced') {
                buttonLeft = {
                    xtype: 'button',
                    ui: 'action',
                    scale: 'medium',
                    text: 'Capture',
                    requiredBehaviors: [{
                        model: 'Taco.model.Order',
                        behavior: 'update'
                    },
                                {
                                    model: 'Taco.model.Order',
                                    behavior: 'paymentUpdate'
                                }],
                    width: 70,
                    itemId: 'captureButton',
                    handler: function () {
                        me.openPaymentActionModal((me.record.get('paymentType') === 'Check') ? 'ApplyCheck' : 'CapturePayment');
                    }
                };
                buttonRight = null;
            } else if (paymentStatus === 'Collected') {
                buttonLeft = null;
                buttonRight = null;
            }
        } else {
            buttonRight = {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'Capture',
                hidden: me.record.get('paymentType')!=='Check' && me.isAutoCaptureEnabled,
                requiredBehaviors: [{
                    model: 'Taco.model.Order',
                    behavior: 'update'
                },
                                {
                                    model: 'Taco.model.Order',
                                    behavior: 'paymentUpdate'
                                }],
                width: 70,
                itemId: 'captureButton',
                handler: function () {
                    me.openPaymentActionModal((me.record.get('paymentType') === 'Check') ? 'ApplyCheck' : 'CapturePayment');
                },
                disabled: !canCapture || pendingReview
            };
        }

        if (paymentStatus === 'Authorized') {
            packageStatus = '<span class="x-column-content-pill x-column-content-pill-true">Authorized</span>';
        } else {
            packageStatus = '<span class="x-column-content-pill x-column-content-pill-false">' + paymentStatus + '</span>';
        }

        me.statusRow = Ext.create('Ext.container.Container', {
            cls: "orderform-payment-statusRow",
            layout: {
                type: 'hbox',
                align: 'middle',
                pack: 'start'
            },
            items: [
                {
                    xtype: 'component',
                    flex: 1,
                    itemId: "statusField",
                    cls: "statusField",
                    html: '<span class="label">Status: </label>' + packageStatus +
                        purchaseOrderNumber
                },
                {
                    xtype: 'component',
                    itemId: 'orderApprovedNotice',
                    html: 'Order must be approved first',
                    margin: '0 10 0 0',
                    hidden: !pendingReview,
                    style: {
                        'font-size': '14px'
                    }
                },
                buttonLeft,
                buttonRight,
                {
                    xtype: 'button',
                    ui: 'action',
                    requiredBehaviors: [{
                        model: 'Taco.model.Order',
                        behavior: 'update'
                    },
                                {
                                    model: 'Taco.model.Order',
                                    behavior: 'paymentUpdate'
                                }],
                    scale: 'medium',
                    menuAlign: 'tr-br?',
                    cls: 'payments-actions',
                    glyph: 'XE90B@mozicons',
                    itemId: 'moreActionsButton',
                    menu: me.getAvailableActions(),
                    hidden: me.getavailableActionsLength(),
                    width: 18,
                    height: 24,
                    margin: '0 0 0 10'
                },
            ]
        });

        // assign scoped references
        this.statusField = me.statusRow.getComponent('statusField');
        this.captureButton = me.statusRow.getComponent('captureButton');
    },

    // expand or collapse the transaction list history.
    toggleTransactionList: function (btn, e) {
        var me = this,
            el = this.transactionList.el.down(".taco-history-collapsable"),
            isCollapsed = (el.hasCls("collapsed"));

        if (isCollapsed) {
            el.removeCls("collapsed")
            // down arrow
            btn.setGlyph("XE92A");
        } else {
            el.addCls("collapsed");
            // right arrow
            btn.setGlyph("XE927");
        }

        this.transactionList.doLayout();
    },

    initTransactionList: function () {
        var me = this;

        this.interactionsStore = me.record.interactionsStore;
        if (this.interactionsStore.count()) {
            var collapsableCls = "",
                toggleBtnHtml = '';

            if (this.interactionsStore.count() > 1){
                collapsableCls =  "taco-history-collapsable";
                toggleBtnHtml = '<div class="togglebtn"></div>';
            }

            me.transactionList = Ext.create('Ext.container.Container', {
                cls: "orderform-payment-transactionlist",
                listeners: {
                    boxready: {
                        fn: function () {
                            if (me.interactionsStore.count()>1) {
                                // create an extjs button in place
                                var btnEl = me.transactionList.el.down(".togglebtn");
                                this.toggleButton = Ext.widget({
                                    xtype: "button",
                                    cls: 'transaction-toggle',
                                    padding: '6px 0px 5px 6px',
                                    renderTo: btnEl,
                                    width: 30,
                                    // right arrow
                                    glyph: "XE927@mozicons",
                                    ui: 'action',
                                    scale: 'medium',
                                    handler: this.toggleTransactionList,
                                    scope: me
                                });
                            }
                        },
                        scope: me
                    }
                },
                tpl: Ext.create('Ext.XTemplate',
                    '<div class="' + collapsableCls + ' collapsed">',
                        '<div class="title">Transaction History</div>',
                        '<div class="body" >',
                            toggleBtnHtml,
                            '<tpl for=".">',
                                '<div class="payment-transaction {[xindex == 1 ? \'recent-transaction\' : \'previous-transaction\']}">',
                                    '<div class="details">',
                                        '<tpl if="target">',
                                        'From: ',
                                            '<tpl if="this.forThisOrder(target)">',
                                              '<span class="x-column-content-pill x-column-content-pill-true">This Order</span>',
                                            '<tpl else>',
                                                '<tpl switch="target.targetType.toLowerCase()">',
                                                  '<tpl case="checkout">',
                                                              'Order Reference #{[ values.target.targetNumber ? values.target.targetNumber : values.target.targetId ]}',
                                                  '<tpl case="order" case="return">',
                                                              'Order {[ values.target.targetNumber ? values.target.targetNumber : values.target.targetId ]}',
                                                  '<tpl default>',
                                                              'Order {[ values.target.targetNumber ? values.target.targetNumber : values.target.targetId ]}',
                                                '</tpl>',
                                              '</tpl>',
                                              '</br>',
                                          '</tpl>',
                                        'Date: {createDate:date("M d g:ia")} ',
                                            '<span class="seperator"></span>',
                                        'Amount: {[Taco.app.context.getCurrent().formatCurrency(values.amount)]} ',
                                            '<br />',
                                        'Type: {interactionType} ',
                                            '<span class="seperator"></span>',
                                        'Status: {status} ',
                                        '<tpl if="gatewayTransactionId != 0">',
                                            '<br />',
                                            'Transaction ID: {gatewayTransactionId}',
                                        '</tpl>',
                                        '<tpl if="gatewayResponseCode">',
                                            '<br />',
                                        '<tpl elseif= "gatewayResponseText">',
                                            '<br />',
                                        '</tpl>',
                                        '<tpl if="gatewayResponseCode">',
                                            'Response Code: {gatewayResponseCode} ',
                                            '<span class="seperator"></span>',
                                        '</tpl>',
                                        '<tpl if="gatewayResponseText">',
                                            'Response Message: {gatewayResponseText} ',
                                        '</tpl>',
                                        '<tpl if="gatewayAVSResponse">',
                                            '<br />',
                                        '<tpl elseif= "gatewayCVV2Response">',
                                            '<br />',
                                        '</tpl>',
                                        '<tpl if="gatewayAVSResponse">',
                                            'AVS Response: {gatewayAVSResponse} ',
                                            '<span class="seperator"></span>',
                                        '</tpl>',
                                        '<tpl if="gatewayCVV2Response">',
                                            'CVV2 Response: {gatewayCVV2Response} ',
                                        '</tpl>',
                                        '<tpl if="note">',
                                            '<br />',
                                            'Note: {note} ',
                                        '</tpl>',
                                    '</div>',
                                '</div>',
                            '</tpl>',
                        '</div>',
                    '</div>',
                        {
                            forThisOrder: function (target) {
                                if (target.targetId == me.order.data.id) {
                                    return true;
                                } else {
                                    return false;
                                }

                            }
                        }
                ),
                data: this.record.data.interactions
            });
        }
    },


    // Textual information about the overall order,  authorized credit card information, and shipping information
    initPaymentDetails: function () {
        var me = this,
            billingContact = me.order.data.billingContact,
            purchaseOrder = me.order.data.purchaseOrderInfo,

            phone = billingContact ? (billingContact.workPhone ? billingContact.workPhone : billingContact.homePhone) : '',

            safePhone = Ext.util.Format.htmlEncode(phone),

            data = Ext.apply({ billingContact: billingContact, safePhone: safePhone }, me.record.data);

        me.paymentDetails = Ext.create('Ext.Component', {
            cls: "orderform-payment-paymentDetails",
            columnWidth: 1,
            margin: '10 0 0 0',
            tpl: Ext.create('Ext.XTemplate',
                    '<tpl if="paymentType != \'StoreCredit\'">',
                '<div class="billingInformation">',

                            '<h4 class="paymentDetailsHeader">Bill To:</h4>',
                            // bad data check;
                            '<tpl if="!values.billingContact.firstName || !values.billingContact.lastName">',
                                '<div class="fullName">N/A</div>',
                            '<tpl elseif="values.billingContact.firstName">',
                                '<div class="fullName">{billingContact.firstName:htmlEncode} {billingContact.lastName:htmlEncode}</div>',
                                '<div class="address">{billingContact.address1:htmlEncode}</div>',
                                '<div class="address">{billingContact.address2:htmlEncode}</div>',
                                '<div class="address">',
                                '{billingContact.cityOrTown:htmlEncode}',
                                '<tpl if="billingContact.cityOrTown && billingContact.stateOrProvince">, </tpl>',
                                '{billingContact.stateOrProvince:htmlEncode}  {billingContact.postalOrZipCode:htmlEncode}</div>',
                                '<div class="address">{billingContact.countryCode:htmlEncode}</div>',
                                '<div class="phoneNumber">{[ this.getPhoneNumber(values.billingContact) ]}</div>',
                            '</tpl>',
                        '</div>',
                    '</tpl>',

                    '<tpl if="paymentType == \'Check\'">',
                        '<div class="paymentTypeCheck">',
                            '<h4 class="paymentDetailsHeader">Method:</h4>',
                            '<div class="check">Check</div>',
                        '</div>',
                    '<tpl elseif="paymentType == \'StoreCredit\'">',
                        '<div class="paymentTypeStoreCredit">',
                            '<h4 class="paymentDetailsHeader">Method:</h4>',
                            '<div class="credit">Store Credit</div>',
                                '<tpl if="storeCreditType && storeCreditType != \'StoreCredit\' && storeCreditType != \'GiftCard\'" >',
                                     '<div class="credit">Code: {storeCreditCode}</div>',
                                     '<div class="credit">Type: {storeCreditType} - {customCreditType}</div>',
                                '<tpl else>',
                                     '<div class="credit">Code: {storeCreditCode} (<a href="/StoreCredits/edit/{storeCreditCode}">click for details</a>)</div>',
                                '</tpl>',
                        '</div>',
                    '<tpl elseif="paymentType == \'PaypalExpress\'">',
                        '<div class="paymentTypePaypalExpress">',
                            '<h4 class="paymentDetailsHeader">Method:</h4>',
                            '<div class="ppx">Paypal Express (Transaction ID: {paymentServiceTransactionId})</div>',
                        '</div>',
                    '<tpl elseif="paymentType == \'PurchaseOrder\'">',
                        '<div class="paymentTypePurchaseOrder">',
                            '<h4 class="paymentDetailsHeader">Payment Terms:</h4>',
                            '<div class="paymentterms">{purchaseOrderInfo.paymentTerm.description}</div>',
                            '<br />',
                            '<tpl if="purchaseOrderInfo.customFields.length < 6">',
                                '<tpl for="purchaseOrderInfo.customFields">',
                                    '<h4 class="paymentDetailsHeader">{label}:</h4>',
                                    '<div>{value}</div>',
                                    '<br />',
                                '</tpl>',
                            '<tpl else>',
                                '<tpl for="purchaseOrderInfo.customFields">',
                                    '<h4 class="paymentDetailsHeader">{label}:</h4>',
                                    '<div>{value}</div>',
                                    '<br />',
                                '</tpl>',
                            '</tpl>',
                        '</div>',
                    '<tpl else>',
                        '<div class="authorizedCreditCard">',
                            '<h4 class="paymentDetailsHeader">Method:</h4>',
                                '<tpl if="paymentType==\'token\'">',
                                    '<div class="creditCard"><span class="paymentType">{tokenType}</span></div>',
                                '<tpl else>',
                                    '<div class="creditCard">{cardType} <span class="paymentType">{paymentType}</span> <span class="creditCard">{cardNumber}</span></div>',
                                '</tpl>',
                            // if the auth data has an id than its been authorized
                            '<tpl if="id">',
                                '<div class="authorization">',
                                    '<h4 class="paymentDetailsHeader">Authorization ID:</h4>',
                                    '{id}',
                                '</div>',
                            '</tpl>',
                        '</div>',
                    '</tpl>',

                    '<tpl>',
                        '<div class="auth-and-workflow">',
                            '<div class="referenceId">',
                                '<h4 class="paymentDetailsHeader">Reference ID:</h4>',
                                '<tpl if="externalTransactionId">',
                                    '{externalTransactionId}',
                                '<tpl else>',
                                    '<div>None</div>',
                                '</tpl>',
                            '</div>',
                            '<div class="workflow">',
                                '<h4 class="paymentDetailsHeader">Workflow:</h4>',
                                '<div class="workflow">{paymentWorkflow}</div>',
                            '</div>',
                        '</div>',
                    '</tpl>',
                {
                    getPhoneNumber: function(contact) {
                        var phone = contact.workPhone || contact.homePhone;
                        return Ext.util.Format.htmlEncode(phone);
                    }
                }
            ),
            data: data,
            listeners: {
                boxready: function() {
                    this.getEl().on('click', function(e,t) {
                        var href = t.getAttribute('href');
                        if (href && t.tagName.toLowerCase() === "a") {
                            e.preventDefault();
                            Taco.core.StateManager.attemptNavigate(href);
                        }
                    });
                }
            }
        });

    },



    rollBackTransaction: function (item) {
        var me = this,
            actionName = item.itemId,
            actionSimpleName = actionName.replace('Rollback', '');

        this.actionModal = Ext.MessageBox.show({
            title: 'Rollback',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: 'Are you sure you want to rollback this ' + actionSimpleName + ' transaction?',
            closable: false,
            buttons: Ext.Msg.OKCANCEL,
            fn: function (rec) {
                if (rec === 'ok') {
                    me.setLoading(true);
                    me.order.rollbackTransaction({
                        jsonData: {
                            actionName: actionName,
                            orderId: me.order.getId(),
                            paymentId: me.record.getId()
                        },
                        success: function (response) {
                            me.setLoading(false);
                            var json = Ext.decode(response.responseText, true);
                            if (!json || !json.success) {
                                Taco.app.fireEvent('setmessage', "Error rolling back.", 'error');
                                return;
                            }

                            me.order.reload();
                            delete me.actionModal;
                        },
                        failure: function (response) {
                            me.setLoading(false);
                            var json = Ext.decode(response.responseText, true),
                                msg = (json && json.message) ? json.message : "Error rolling back.";
                            Taco.app.fireEvent('setmessage', msg, 'error');
                            delete me.actionModal;
                        }
                    });
                }
            }
        });
    },

    openPaymentActionModal: function(item) {
        var me = this,
            clsName = (typeof item === "string") ? item : item.itemId,
            modal = this.actionModal = Ext.create('Taco.view.order.modal.' + clsName, {
                order: me.order,
                record: me.record
            });

        me.mon(modal, 'close', function() {
            delete me.actionModal;
        });

        modal.show();

        return modal;
    },



    // removes the authorized transaction (first item in the payments collection). Will call service, reload the record, and update the ui;
    voidTransaction: function() {
        var me = this,
            msg = me.record.get('paymentType') === 'PurchaseOrder'
                  ? '<p>Amount voided will be applied to the customer\'s line of credit for purchase orders.</p>'
                  + '<br />'
                  + '<p>Void Amount</p>'
                  + '<h2>' + me.order.formatCurrency(me.getPaymentData().amountRequested) + '</h2>'
                  + '<br />'
                  + '<p>Are you certain you want to void this payment?</p>'
                  : 'Are you certain you want to void this payment?',
            config = {
                jsonData: {
                    orderId: me.order.getId(),
                    paymentId: me.record.getId()
                },
                success: function(response) {
                    // success handling here
                    me.setLoading(false);

                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        // service didn't return data properly
                        return;
                    }
                    me.order.reload();
                },
                failure: function(response) {
                    me.setLoading(false);
                    // error handling here
                },
                scope: this
            };

        this.actionModal = Ext.MessageBox.show({
            title: 'Void Payment',
            rightJustifyButtons: true,
            reverseOrder: true,
            cls: 'void-purchase-order',
            msg: msg,
            height: 260,
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function(val) {
                if (val !== 'yes') return;

                me.setLoading(true);
                // call the model method to persist the change
                me.order.voidTransaction(config);
            }
        });

        this.actionModal.height = 400;
    },

    manualDeclinePayment: function() {
        var me = this,
            config = {
                jsonData: {
                    orderId: me.order.getId(),
                    paymentId: me.record.getId()
                },
                success: function(response) {
                    // success handling here
                    me.setLoading(false);

                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        // service didn't return data properly
                        return;
                    }
                    me.order.reload();
                },
                failure: function(response) {
                    me.setLoading(false);
                    // error handling here
                },
                scope: this
            };

        this.actionModal = Ext.MessageBox.show({
            title: 'Manually Decline Payment',
            rightJustifyButtons: true,
            reverseOrder: true,
            msg: 'Are you certain you want to manually record this payment as declined?',
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function(val) {
                if (val !== 'yes') return;

                me.setLoading(true);
                // call the model method to persist the change
                me.order.declinePaymentManual(config);
            }
        });
    },

    onDestroy: function () {
        var me = this;

        var toBeDestroyed = [
            "toggleButton",
            "captureButton",
            "displayAmount",
            //"interactionsStore",
            "paymentActions",
            "paymentDetails",
            "statusField",
            "statusRow",
            "transactionList"
        ];

        Ext.Array.forEach(toBeDestroyed, function (item) {

            if (me[item]){
                if (me[item].destroy){
                    me[item].destroy();
                }
                delete me[item]
            }
        })

        this.callParent(arguments);
    }

    

    //creditPayment: function(config) {
    //    // check to make sure the record is appropriate. needs to have an amountCollected greater than zero
    //    if (this.record.get('amountCollected') > 0) {
    //        this.mon(this.openPaymentActionModal('CreditPayment'), 'savesuccess', this.order.reload, this.order);
    //    }
    //}

});
