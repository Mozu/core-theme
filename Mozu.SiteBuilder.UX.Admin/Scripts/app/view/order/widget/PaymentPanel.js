/**
 * @class Taco.view.order.widget.PaymentPanel
 */
Ext.define('Taco.view.order.widget.PaymentPanel', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Taco.view.order.modal.IssueCredit',
        'Taco.view.order.modal.RequestCheck',
        'Taco.view.order.modal.CheckPayment',
        'Taco.view.order.modal.CapturePayment',
        'Taco.view.order.modal.EditTransaction'
    ],
    cls: 'orderform-payment-transaction',
    initComponent: function (eOpts) {
        var me = this;

        me.initStatusRow();
        me.initPaymentDetails();
        me.initTransactionList();

        me.items = [
                me.statusRow,
                me.paymentDetails,
                me.transactionList
        ];

        this.callParent(arguments);
    },

    getAvailableActionsStore: function () {
        var me = this,
            retval = [];

        var labels = {
            'ApplyCheck': 'Receive Check',
            'DeclineCheck': 'Decline Check',
            'CapturePayment': 'Capture Payment',
            'CreditPayment': 'Credit Payment',
            'VoidPayment': 'Void Payment',

            'ManualCapturePayment': 'Capture Payment (Manual)',
            'ManualCreditPayment': 'Credit Payment (Manual)',
            'ManualVoidPayment': 'Void Payment (Manual)',
        };

        var actionsWithLabels = Ext.Array.map(me.record.data.availableActions, function (action) {
            if (!labels[action])
                throw "unmapped action: " + action;
            return { "val": action, "lbl": labels[action] };
        });

        return Ext.create('Ext.data.Store', {
            fields: ['val', 'lbl'],
            data: actionsWithLabels
        });
    },

    // shows status and action buttons and field depending on the state of the entity
    initStatusRow: function () {
        var me = this,
            // capture amount is the outstanding balance on the order
            captureAmount = me.order.data.authorizationInfo.captureAmount,
            // auth ready is when you have an authorized card with id
            authReady = Ext.Array.contains(me.record.data.availableActions, 'CapturePayment'),
            // can capture is when you are auth ready and your order has a positive capture amount
            canCapture = authReady && captureAmount && captureAmount > 0;


        

        me.statusRow = Ext.create('Ext.container.Container', {
            cls: "orderform-payment-statusRow",
            layout: {
                type: 'hbox',
                align: 'stretch',
                pack: 'start'
            },
            childEls: [
                'captureField'
            ],
            items: [
                {
                    xtype: 'component',
                    flex: 1,
                    itemId: "statusField",
                    cls: "statusField",
                    tpl: '{.}',
                    data: me.record.data.status
                },{
                    xtype: 'combo',
                    store: me.getAvailableActionsStore(),
                    disabled: !(me.record.data.availableActions.length > 0),
                    displayField: 'lbl',
                    valueField: 'val',
                    emptyText: 'Actions',
                    handler: me.addTransaction,
                    transId: 1,
                    record: me.record,
                    parent: this,
                    listeners: {
                        select: me.handleAction
                    },
                    scope: me
                }
            ]
        });

        // assign scoped references
        this.statusField = me.statusRow.getComponent('statusField');
        this.captureField = me.statusRow.getComponent('captureField');
        this.captureButton = me.statusRow.getComponent('captureButton');
    },

    // initialize the views and actions menu

    initTransactionList: function () {
        var me = this;

        //todo:rework below to work off of interactions.
        //todo: remove issue credit from here.
        this.interactionsStore = me.record.interactionsStore;
        me.transactionList = Ext.create('Ext.view.View', {
            cls: "orderform-payment-transactionlist",
            listeners: {
                itemclick: {
                    fn: function (view, record, item, index, e, eOpts) {
                        var isButtonClick = (e.target.localName == 'button'),
                            btnEl = isButtonClick ? Ext.get(e.target) : null;

                        // handle Delete click.
                        if (isButtonClick && btnEl.hasCls('orderform-transaction-delete-btn'))
                        {
                            Ext.Msg.show({
                                title: 'Delete',
                                cls: 'taco-orderform-delete-confirm',
                                msg: 'Are you sure you want to delete this transaction?',
                                buttons: Ext.Msg.OKCANCEL,
                                fn: function (rec) {
                                    if (rec === 'ok') {
                                        //delete the rec
                                    }
                                }
                            });
                        }
                        // handle Edit click
                        else if (isButtonClick && btnEl.hasCls('orderform-transaction-edit-btn'))
                        {
                            var modal = Ext.create('Taco.view.order.modal.EditTransaction', {
                                // record is the PaymentInteraction
                                record: record,
                                // payment is the payment that owns this transaction
                                payment: me.record,
                                // order is the order that owns this payment
                                order: me.order
                            });
                        }
                    },
                    scope: me
                }
            },
            itemSelector: "div.payment-transaction",
            tpl: [
                '<tpl for=".">',
                    //'<tpl if="amountCollected!==0">',
                    '<div class="payment-transaction">',
                        '<div class="details">',
                            ' {createDate:date("M d g:ia")} ',
                        '<span class="seperator">|</span>',
                            ' id: {id} ',
                        '<span class="seperator">|</span>',
                            ' Amount: ${amount} ',
                        '<span class="seperator">|</span>',
                            'Type: {interactionType} ',
                        '<tpl if="gatewayTransactionId">',
                            '<span class="seperator">|</span>',
                                ' Transaction ID: {gatewayTransactionId}',
                        '</tpl>',
                        '<tpl if="canEdit">',
                            '<button class= "taco-action taco-action-secondary taco-action-default orderform-transaction-delete-btn">Delete</button>',
                        '</tpl>',
                        '<tpl if="canDelete">',
                            '<button class= "taco-action taco-action-secondary taco-action-default orderform-transaction-edit-btn">Edit</button>',
                        '</tpl>',
                        '</div>',
                    '</div>',
                '</tpl>'
            ],
            store: this.interactionsStore
        });



    },


    // Textual information about the overall order,  authorized credit card information, and shipping information
    initPaymentDetails: function () {
        var me = this,
            data = Ext.apply({ billingContact: me.order.data.billingContact }, me.record.data);

        me.paymentDetails = Ext.create('Ext.Component', {
            cls: "orderform-payment-paymentDetails",
            tpl: [

                    '<tpl if="paymentType == \'Check\'">',
                        '<div class="paymentTypeCheck">Check</div>',
                    '<tpl else>',
                        '<div class="authorizedCreditCard">',
                                '<span class="creditCard">{cardType} {cardNumber}</span>',
                            // if the auth data has an id than its been authorized
                            '<tpl if="id">',
                                '<span class="seperator">|</span>',
                                    '<span class="authorization">Authorization ID: {id}</span>',
                            '</tpl>',
                        '</div>',
                    '</tpl>',


                '<div class="billingInformation">',
                    '<span class="fullName">Bill to: {billingContact.firstName} {billingContact.lastName}</span>',
                    '<span class="seperator">|</span>',
                    '<span class="address">{billingContact.address1} {billingContact.address2} {billingContact.cityOrTown} {billingContact.state}  {billingContact.zipCode} {billingContact.countryCode}  </span>',
                    '<span class="seperator">|</span>',
                    '<span class="phoneNumber">{[ values.billingContact.workPhone ? values.billingContact.workPhone : values.billingContact.homePhone ]}</span>',
                '</div>'
            ],
            data: data
        });

    },

    // removes the authorized transaction (first item in the payments collection). Will call service, reload the record, and update the ui;
    voidTransaction: function () {
        var me = this,
            config = {
                jsonData: {
                    orderId: me.order.getId(),
                    paymentId: me.record.getId()
                },
                success: function (response) {
                    // success handling here
                    me.setLoading(false);

                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        // service didn't return data properly
                        return;
                    }
                    me.order.reload();
                },
                failure: function (response) {
                    me.setLoading(false);
                    // error handling here
                },
                scope: this
            };

        me.setLoading(true);
        // call the model method to persist the change
        me.order.voidTransaction(config);
    },
    applyCheck: function (config) {
        alert('create check');
    },
    issueCredit: function (config) {
        var me = this,
            amountCollected = me.record.get('amountCollected');

        // check to make sure the record is appropriate. needs to have an amountCollected greater than zero
        if (!amountCollected || amountCollected <= 0) {
            return;
        }

        var issueCreditModal = Ext.create('Taco.view.order.modal.IssueCredit', {
            record: me.record,
            listeners: {
                aftersave: function () {
                    me.order.reload();

                },
                scope: me
            }
        });

        issueCreditModal.show();
    },


    handleAction: function (config) {
        var me = this,
            record = me.record;

        /*
         * 'ApplyCheck'
         * 'DeclineCheck'
         *  'VoidPayment'
         *  'IssueCredit'
         */

        switch (me.getValue()) {
            case 'ApplyCheck':
                var modal = Ext.create('Taco.view.order.modal.CheckPayment', {
                    record: record
                });

                modal.show();
                break;
            case 'DeclineCheck':
                alert('todo: decline check.');
                break;
            case 'VoidPayment':
                me.parent.voidTransaction();
                break;
            case 'CapturePayment':
                me.parent.capturePayment();
                break;
            case 'CreditPayment':
                me.parent.issueCredit();
                break;
        }
    },

    // call the service via the model and save the captured amount
    capturePayment: function () {
        var me = this;
        
        var capturePayment = Ext.create('Taco.view.order.modal.CapturePayment', {
            order: me.order,
            record: me.record
        });

        capturePayment.show();
    }

    // called when the record has been updated
//    onRecordChange: function () {
//        var me = this;
//
//        // clear out the ui components
//        me.statusRow.destroy();
//        me.paymentDetails.destroy();
//        me.transactionList.destroy();
//
//        //not sure why i need to do this but oh well....debug later
//        //doesnt work
//        //me.record.paymentsStore.loadRawData(me.record.data.payments);
//    }
});
