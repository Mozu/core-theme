/**
 * @class Taco.view.order.subform.Payment
 */
Ext.define('Taco.view.order.subform.PaymentPanel', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Taco.view.order.modal.IssueCredit',
        'Taco.view.order.modal.RequestCheck',
        'Taco.view.order.modal.CheckPayment'
    ],
    config: {
        style: 'border: 1px; border-style: solid; margin-bottom: 5px; padding: 3px;'
    },

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
                        /* if (e.target.className == "paymentAction") {
                             var action = e.target.getAttribute("paymentAction");
                             //if user clicks on an action link in the item, execute the action and pass the record
                             if (this[action]) {
                                 this[action]({
                                     record: record
                                 });
                             }
                         }*/
                        if (e.target.localName == 'button') {

                            console.log(e.target.parentElement.parentElement.attributes.paymentId.value); //payment Id
                            console.log(e.target.parentElement.childNodes[0].data); //date
                            console.log(e.target.parentElement.childNodes[2].data); //id
                            console.log(e.target.parentElement.childNodes[4].data); //amount
                            console.log(e.target.parentElement.childNodes[6].data); //status
                            var date = new Date(e.target.parentElement.childNodes[0].data.trim());


                            var modal = Ext.create('Taco.view.order.modal.AddPaymentTransaction', {
                                paymentId: e.target.parentElement.parentElement.attributes.paymentId.value,
                                transDate: e.target.parentElement.parentElement.attributes.createDate.value,
                                transId: e.target.parentElement.childNodes[2].data.trim().split(' ')[1],
                                transGatewayId: e.target.parentElement.childNodes[8].data.trim().split(' ')[2],
                                transAmount: e.target.parentElement.childNodes[4].data.trim().split(' ')[1].substring(1),
                                transStatus: e.target.parentElement.childNodes[6].data.trim().split(' ')[1],
                                record: me.record
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
                    '<div paymentId="{id}"  createDate= "{createDate}" class="payment-transaction">',

//                        '<tpl if="values.amountCollected &gt; 0">',
//                            '<a class="paymentAction" paymentAction="issueCredit">Issue Credit</a>',
//,                        '</tpl>',

                        '<div class="details">',
                            ' {createDate:date("M d g:ia")} ',
                        '<span class="seperator">|</span>',
                            ' id: {id} ',
                        '<span class="seperator">|</span>',
                            ' Amount: ${amount} ',
                        '<span class="seperator">|</span>',
                            'Type: {interactionType} ',
                        '<span class="seperator">|</span>',
                            ' Transaction ID: {gatewayTransactionId}',

                        '<button class= "taco-action taco-action-secondary taco-action-default" style="float: right; padding: 0px;">Edit</button>',
                        '</div>',


                    '</div>',
                    //'</tpl>',
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

    // shows status and action buttons and field depending on the state of the entity
    initStatusRow: function () {
        var me = this,
            // capture amount is the outstanding balance on the order
            captureAmount = me.order.data.authorizationInfo.captureAmount,
            // auth ready is when you have an authorized card with id
            authReady = Ext.Array.contains(me.record.data.availableActions, 'CapturePayment'),
            // can capture is when you are auth ready and your order has a positive capture amount
            canCapture = authReady && captureAmount && captureAmount > 0;


        var options = Ext.create('Ext.data.Store', {
            fields: ['val', 'lbl'],
            data: [
                { "val": "credit", "lbl": "Issue Credit" },
                { "val": "void", "lbl": "Void Transaction" },
                { "val": "add", "lbl": "Add Manual Interaction" },
                { "val": "check", "lbl": "Collect Check" }
            ]
        });

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
                }, {
                    xtype: 'unitfield',
                    width: 120,
                    hidden: !canCapture,
                    itemId: "captureField",
                    padding: "0 10",
                    unitString: "$",
                    unitAtEnd: false,
                    value: captureAmount,
                    allowBlank: true,
                    minValue: 0,
                    maxValue: 100000
                }, {
                    xtype: "taco.button",
                    text: "Capture Payment",
                    hidden: !canCapture,
                    itemId: "captureButton",
                    handler: me.capturePayment,
                    scope: me
                },/* {
                    xtype: "taco.button",
                    text: "Payment Recieved",
                    hidden: (!(me.record.data.paymentType == "Check") || me.order.get("paymentStatus") == "Paid"),
                    itemId: "paymentReceivedButton",
                    handler: me.paymentRecieved,
                    scope: me
                }, */{
                    xtype: 'combo',
                    store: options,
                    displayField: 'lbl',
                    valueField: 'val',
                    emptyText: 'Actions',
                    //handler: me.addTransaction,
                    transId: 1,
                    record: me.record,
                    parent: this,
                    listeners: {
                        select: me.transactionAction
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
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        // service didnt' return data properly
                        return;
                    }
                    this.record.reload();
                },
                failure: function (response) {
                    // error handling here
                },
                scope: this
            };

        // call the model method to persist the change
        this.record.voidTransaction(config);
    },
    applyCheck: function (config) {
        // var me = this;
        //public class ApplyCheckArgs
        //{
        //    public string OrderId { get; set; }
        //    public OrderPayment Payment { get; set; }
        //    public string CheckNumber { get; set; }
        //    public decimal Amount { get; set; }
        //}

        alert('create check');

        //this.record.addPayment(config);
        /*
        var paymentRecord = config.record;
        paymentRecord.applyCheck({
            jsonData: {
                orderId: me.record.getId(),
                payment: paymentRecord.data,
                checkNumber: 123,
                amount : me.record.get('total')
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    Ext.message("error applying check");

                    var errorDialog = Ext.create('Taco.core.ux.modal.Alert', {
                        text: "error applying check"
                    });
                    errorDialog.show();
                    return;
                }
                me.record.reload();
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "error applying check";

                var errorDialog = Ext.create('Taco.core.ux.modal.Alert', {
                    text: msg
                });
                errorDialog.show();
            },
            scope: this
        });*/
    },
    issueCredit: function (config) {
        var me = this;

        // config and record are required
        if (!config || !config.record) {
            return;
        }

        // check to make sure the record is appropriate. needs to have an amountCollected greater than zero
        if (!config.record.get("amountCollected") > 0) {
            return;
        }

        var issueCreditModal = Ext.create('Taco.view.order.modal.IssueCredit', {
            record: config.record,
            listeners: {
                //aftersave: me.onRecordChange,
                aftersave: function () {
                    me.record.reload();

                },
                scope: me
            }
        });

        issueCreditModal.show();
    },

   
    transactionAction: function (config) {
        var me = this;
        var record = me.record;

        switch (me.getValue()) {
            case 'void':
                me.parent.voidTransaction({
                    record: record
                });
                break;
            case 'credit':
                me.parent.issueCredit({
                    record: record
                });
                break;
            case 'add':
                var modal = Ext.create('Taco.view.order.modal.AddPaymentTransaction', {
                    paymentId: config.transId,
                    record: me.order
                });

                modal.show();
                break;
            case 'check':
                debugger;
                var modal = Ext.create('Taco.view.order.modal.CheckPayment', {
                    record: me.order
                });

                modal.show();
                break;
        }

        //this.record.addPayment(config);
    },
    // call the service via the model and save the captured amoutn
    capturePayment: function () {
        var me = this;

        // add the capture Amount
        var captureAmount = this.captureField.getValue(),
            paymentData = Ext.clone(me.record);
        data = {
            payment: paymentData,
            amount: captureAmount
        };

        // pacakage up the data for the model to persist
        var cfg = {
            jsonData: data,
            success: function (response) {
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    return;
                }
                this.record.reload();
            },
            failure: function (response) {

            },
            scope: this
        };

        // call the model method to persist the change
        this.order.capturePayment(cfg);
    },

    // called when the record has been updated
    onRecordChange: function () {
        var me = this;

        // clear out the ui components
        me.statusRow.destroy();
        me.paymentDetails.destroy();
        me.transactionList.destroy();

        //not sure why i need to do this but oh well....debug later
        //doesnt work
        //me.record.paymentsStore.loadRawData(me.record.data.payments);

        me.record.payments().removeAll();
        Ext.each(me.record.data.payments, function (paymentRaw) {
            var paymentRecord = Ext.create('Taco.model.OrderPayment', paymentRaw);
            paymentRecord.interactions().removeAll();
            Ext.each(paymentRecord.data.interactions, function (interactionRaw) {
                var paymentInteractionRecord = Ext.create('Taco.model.OrderPaymentInteraction', interactionRaw);
                paymentRecord.interactions().add(paymentInteractionRecord);
            });
            me.record.payments().add(paymentRecord);
        });

        //re-build the ui components
        me.initUI();

        // add the ui components to the view
        me.add(
            me.statusRow,
            me.paymentDetails,
            me.transactionList
        );
    }
});