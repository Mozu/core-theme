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
        'Taco.view.order.modal.CapturePayment',
        'Taco.view.order.modal.AuthorizePayment',
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

    getAvailableActions: function() {

        var me = this,

            availableActions = me.record.data.availableActions;

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
                handler: me.manualDeclinePayment
            },
            {
                text: 'Credit Payment',
                itemId: 'CreditPayment',
                hidden: me.record.get('amountCollected') <= 0
            },
            {
                text: 'Authorize Payment',
                itemId: 'AuthorizePayment'
            },
            {
                text: 'Auth and Capture',
                itemId: 'AuthAndCapture'
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
                itemId: 'ManualCapturePayment'
            },
            {
                text: 'Credit Payment (Manual)',
                itemId: 'ManualCreditPayment'
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

    //large-type display amount for the total amount collected, displayed, or authorized
    initDisplayAmount: function() {
        var cls = Taco.baseCSSPrefix + 'orderform-payment-amounts-summary',
            lbl = function (label, value) {
                return '<h4><span class="{cls}-label">' + label + '</span> <strong class="{cls}-value">' + value + '</strong></h4>';
            };

        this.displayAmount = Ext.widget('component', {
            cls: cls,
            tpl: [
                '<tpl if="payment.amountCollected == 0 && payment.amountAuthorized == 0 && payment.amountCredited == 0">',
                lbl('Amount Requested: ', '{[values.orderRecord.formatCurrency(values.payment.amountRequested)]}'),
                '</tpl>',
                '<tpl if="payment.amountAuthorized != 0">',
                lbl('Amount Authorized: ', '{[values.orderRecord.formatCurrency(values.payment.amountAuthorized)]}'),
                '</tpl>',
                lbl('Amount Collected: ', '{[values.orderRecord.formatCurrency(values.payment.amountCollected)]}'),
                '<tpl if="payment.amountCredited != 0">',
                lbl('Amount Credited: ', '{[values.orderRecord.formatCurrency(values.payment.amountCredited)]}'),
                '</tpl>',
                '<tpl if="payment.amountRefunded != 0">',
                lbl('Amount Refunded: ', '{[values.orderRecord.formatCurrency(values.payment.amountRefunded)]}'),
                '</tpl>'
            ],
            data: {
                cls: cls,
                orderRecord: this.order, 
                payment: this.record.data
            }
        });
    },

    // shows status and action buttons and field depending on the state of the entity
    initStatusRow: function () {
        var me = this,
            // capture amount is the outstanding balance on the order
            captureAmount = me.order.getCaptureAmountHint(),
            // auth ready is when you have an authorized card with id
            authReady = Ext.Array.contains(me.record.data.availableActions, 'CapturePayment'),
            // can capture is when you are auth ready and your order has a positive capture amount
            canCapture = authReady && captureAmount && captureAmount > 0,
            // order is awaiting approval
            pendingReview = me.order.get('orderStatus') === 'PendingReview';

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
                    html: 'Status: ' + me.record.data.status
                }, {
                    xtype: 'component',
                    itemId: 'orderApprovedNotice',
                    html: 'Order must be approved first',
                    margin: '0 10 0 0',
                    hidden: !pendingReview,
                    style: {
                        'font-size': '14px'
                    }
                },
                {
                    xtype: 'button',
                    ui: 'action',
                    scale: 'medium',
                    margin: '0 2 0 0',
                    text: 'More Actions',
                    itemId: 'moreActionsButton',
                    menu: me.getAvailableActions()
                }, {
                    xtype: 'button',
                    ui: 'action',
                    scale: 'medium',
                    text: 'Capture',
                    width: 180,
                    itemId: 'captureButton',
                    handler: function() {
                        me.openPaymentActionModal((me.record.get('paymentType') === 'Check') ? 'ApplyCheck' : 'CapturePayment');
                    },
                    disabled: !canCapture || pendingReview
                }
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
            btn.setGlyph("xe036");
        } else {
            el.addCls("collapsed");
            // right arrow
            btn.setGlyph("xe034");
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
                                    padding: '6px 0px 5px 6px',
                                    renderTo: btnEl,
                                    width: 30,
                                    // right arrow
                                    glyph: "xe034@mozicons",
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
                tpl: [
                    '<div class="' + collapsableCls + ' collapsed">',
                        '<div class="title">Transaction History</div>',
                        '<div class="body" >',
                            toggleBtnHtml,
                            '<tpl for=".">',
                                '<div class="payment-transaction {[xindex == 1 ? \'recent-transaction\' : \'previous-transaction\']}">',
                                    '<div class="details">',
                                        ' {createDate:date("M d g:ia")} ',
                                        '<span class="seperator">|</span>',
                                            ' Amount: {[Taco.app.context.getCurrent().formatCurrency(values.amount)]} ',
                                        '<span class="seperator">|</span>',
                                            'Type: {interactionType} ',
                                        '<span class="seperator">|</span>',
                                            'Status: {status} ',
                                        '<tpl if="gatewayTransactionId">',
                                            '<tpl if="gatewayTransactionId != 0">',
                                                '<span class="seperator">|</span>',
                                                ' Transaction ID: {gatewayTransactionId}',
                                             '</tpl>',
                                        '</tpl>',
                                        '<tpl if="gatewayResponseCode">',
                                            '<span class="seperator">|</span>',
                                            'Response Code: {gatewayResponseCode} ',
                                        '</tpl>',
                                        '<tpl if="gatewayResponseText">',
                                            '<br />',
                                            'Response Message: {gatewayResponseText} ',
                                        '</tpl>',
                                    '</div>',
                                '</div>',
                            '</tpl>',
                        '</div>',
                    '</div>'
                ],
                data: this.record.data.interactions
            });
        }
    },


    // Textual information about the overall order,  authorized credit card information, and shipping information
    initPaymentDetails: function () {
        var me = this,
            data = Ext.apply({ billingContact: me.order.data.billingContact }, me.record.data);


        me.paymentDetails = Ext.create('Ext.Component', {
            cls: "orderform-payment-paymentDetails",
            columnWidth: 1,
            margin: '10 0 0 0',
            tpl: [

                    '<tpl if="paymentType == \'Check\'">',
                        '<div class="paymentTypeCheck">',
                        '<h4 class="paymentDetailsHeader">Method:</h4>',
                        '<div class="check">Check</div>',
                        '</div>',
                    '<tpl elseif="paymentType == \'StoreCredit\'">',
                        '<div class="paymentTypeStoreCredit">',
                            '<h4 class="paymentDetailsHeader">Method:</h4>',
                            '<div class="credit">Store Credit</div>',
                            '<div class="credit">Code: {storeCreditCode} (<a href="/StoreCredits/edit/{storeCreditCode}">click for details</a>)</div>',
                        '</div>',
                    '<tpl elseif="paymentType == \'PaypalExpress\'">',
                        '<div class="paymentTypePaypalExpress">',
                            '<h4 class="paymentDetailsHeader">Method:</h4>',
                            '<div class="ppx">Paypal Express (Transaction ID: {paymentServiceTransactionId})</div>',
                        '</div>',
                    '<tpl else>',
                        '<div class="authorizedCreditCard">',
                        '<h4 class="paymentDetailsHeader">Method:</h4>',
                                '<div class="creditCard">{cardType}</div>',
                                '<div class="creditCard">{cardNumber}</div>',
                            // if the auth data has an id than its been authorized
                            '<tpl if="id">',
                                    '<div class="authorization">Authorization ID: {id}</div>',
                            '</tpl>',
                        '</div>',
                    '</tpl>',


                    '<tpl if="paymentType != \'StoreCredit\'">',
                        '<div class="billingInformation">',
                            '<h4 class="paymentDetailsHeader">Bill To:</h4>',
                            // bad data check;
                            '<tpl if="!values.billingContact.firstName || !values.billingContact.lastName">',
                                '<div class="fullName">N/A</div>',
                            '<tpl else>',
                                '<div class="fullName">{billingContact.firstName} {billingContact.lastName}</div>',
                                '<div class="address">{billingContact.address1}</div>',
                                '<div class="address">{billingContact.address2}</div>',
                                '<div class="address">',
                                '{billingContact.cityOrTown}',
                                '<tpl if="billingContact.cityOrTown && billingContact.stateOrProvince">, </tpl>',
                                '{billingContact.stateOrProvince}  {billingContact.postalOrZipCode}</div>',
                                '<div class="address">{billingContact.countryCode}</div>',
                                '<div class="phoneNumber">{[ values.billingContact.workPhone ? values.billingContact.workPhone : values.billingContact.homePhone ]}</div>',
                            '</tpl>',
                        '</div>',
                    '</tpl>'
            ],
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
            closable:false,
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
            msg: 'Are you certain you want to void this payment?',
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function(val) {
                if (val !== 'yes') return;

                me.setLoading(true);
                // call the model method to persist the change
                me.order.voidTransaction(config);
            }
        });
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
