/**
 * @class Taco.view.order.subform.Payment
 */
Ext.define('Taco.view.order.subform.Payment', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.modal.IssueCredit'
    ],
    config : {
        // order model
        originalRecord : null,
        record: null,
        itemId:"orderPayment",
        // title for the panel header
        title: 'Payment & Billing Information',
        // components to add to the panel header. typically used to add an actions menu button
        tools: []
    },
    
    initComponent: function (eOpts) {
        var me = this;

        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-payment'].join(' ');

        // after the record is reloaded we will need to refresh the ui
        this.record.on("aftercommit", function () {
            this.onRecordChange();
        }, this);
        
        // initialize the ui
        // this will be called every time the record is updated
        me.initUI();
        
        Ext.apply(me, {
            items: [
                me.statusRow,
                me.paymentDetails,
                me.transactionList
            ]
        });

        this.callParent(arguments);
    },
    
    initActionsMenu: function () {
        var me = this;

        // actions that go in the header actions menu
        me.voidTransactionAction = new Ext.Action({
            text: 'Void Transaction',
            handler: me.voidTransaction,
            scope: this
        });

        /*
        me.issueCreditAction = new Ext.Action({
            text: 'Issue Credit',
            handler: me.issueCredit,
            scope: this
        });
        */
        me.addPaymentAction = new Ext.Action({
            text: 'Add Payment',
            handler: me.addPayment,
            scope: this
        });



        // add the tools the header using the pre defined actions above;
        me.setTools({
            xtype: 'taco.button',
            width: 50,
            height: 30,
            text: ' ',
            menuAlign: 'tr-br',
            cls: Taco.baseCSSPrefix + 'editcontainer-menu-button',
            autoEl: {
                tag: 'a'
            },
            menu: {
                plain: true,
                items: [
                    me.addPaymentAction,
                    //me.issueCreditAction,
                    me.voidTransactionAction
                ]
            }
        });
    },
    
    // initialize the views and actions menu
    initUI : function() {
        var me = this;
        
        me.initActionsMenu();
        me.initStatusRow();
        me.initPaymentDetails();
        me.initTransactionList();
    },
    
    // list of payment transactions. first item is the authorization object depending on its status
    initTransactionList: function () {
        var me = this;

        this.paymentsStore = this.record.paymentsStore;
        
        me.transactionList = Ext.create('Ext.view.View', {
            cls: "orderform-payment-transactionlist",
            listeners: {
                itemclick: {
                    fn: function(view, record, item, index, e, eOpts) {
                        if (e.target.className == "paymentAction") {
                            var action = e.target.getAttribute("paymentAction");
                            //if user clicks on an action link in the item, execute the action and pass the record
                            if (this[action]) {
                                this[action]({
                                    record: record
                                });
                            }
                        }
                    },
                    scope:me
                }
            },
            itemSelector: "div.payment-transaction",
            tpl: [
                '<tpl for=".">',
                    //'<tpl if="amountCollected!==0">',
                    '<div paymentId="{id}"  class="payment-transaction">',
                        
                        '<tpl if="values.amountCollected &gt; 0">',
                            '<a class="paymentAction" paymentAction="issueCredit">Issue Credit</a>',
,                        '</tpl>',

                        '<div class="details">',
                            ' {createDate:date("M j, Y")} ',
                        '<span class="seperator">|</span>',
                            ' Payment id: {id} ',
                        '<span class="seperator">|</span>',
                            ' Paid: ${amountCollected} ',
                        '<span class="seperator">|</span>',
                            ' <span class="creditCard">{cardType} {cardNumber}</span> ',
                        '<span class="seperator">|</span>',
                            ' Transaction ID: {paymentServiceTransactionId}',
                        '</div>',


                    '</div>',
                    //'</tpl>',
                '</tpl>'
            ],
            store: this.paymentsStore
        });

        

    },
    

    // Textual information about the overall order,  authorized credit card information, and shipping information
    initPaymentDetails : function() {
        var me = this,
            data = this.record.getData();

        /*
        address1: "1135 Barton Hills Dr"
address2: "#113"
cityOrTown: "Austin"
countryCode: "US"
email: "askljdh@lkhjasd.com"
firstName: "James"
id: -1
lastName: "Zetlen"
state: "TX"
zipCode: "78704"
        */
        
        me.paymentDetails = Ext.create('Ext.Component', {
            cls: "orderform-payment-paymentDetails",
            tpl: [
                '<tpl if="authorizationInfo.captureData">',
                    '<div class="authorizedCreditCard">',
                            '<span class="creditCard">{authorizationInfo.captureData.cardType} {authorizationInfo.captureData.cardNumber}</span>',
                        // if the auth data has an id than its been authorized
                        '<tpl if="authorizationInfo.captureData.id">',
                            '<span class="seperator">|</span>',
                                '<span class="authorization">Authorization ID: {authorizationInfo.captureData.id}</span>',
                        '</tpl>',
                    '</div>',
                '<tpl else>',
                    '<div class="paymentTypeCheck">Check</div>',
                '</tpl>',
                '<div class="orderSummary">',
                    '<span class="orderTotal">Order Total: {total:usMoney}</span>',
                    '<span class="seperator">|</span>',
                    '<span class="Received">Received: {authorizationInfo.amountCollected:usMoney}</span>',
                    '<span class="seperator">|</span>',
                    '<span class="balance">Balance: {authorizationInfo.captureAmount:usMoney}</span>',
                '</div>',
                '<div class="billingInformation">',
                    '<span class="fullName">Bill to: {billingContact.firstName} {billingContact.lastName}</span>',
                    '<span class="seperator">|</span>',
                    '<span class="address">{billingContact.address1} {billingContact.address2} {billingContact.cityOrTown} {billingContact.state}  {billingContact.zipCode} {billingContact.countryCode}  </span>',
                    '<span class="seperator">|</span>',
                    '<span class="phoneNumber">?512.666.6666?</span>',
                '</div>'
            ],
            data: data
        });

    },
    
    // shows status and action buttons and field depending on the state of the entity
    initStatusRow: function () {
        var me = this,
            data = this.record.get("authorizationInfo");

        console.log(data);
        

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
                    data: this.record.get("paymentStatus")
                }, {
                    xtype: 'unitfield',
                    width: 120,
                    hidden: !data.canCapture,
                    itemId: "captureField",
                    padding: "0 10",
                    unitString: "$",
                    unitAtEnd: false,
                    value: data.captureAmount,
                    allowBlank: true,
                    minValue: 0,
                    maxValue: 100000
                }, {
                    xtype: "taco.button",
                    text: "Capture Payment",
                    hidden: !data.canCapture,
                    itemId: "captureButton",
                    handler: me.capturePayment,
                    scope: me
                }, {
                    xtype: "taco.button",
                    text: "Payment Recieved",
                    hidden: (!(data.paymentType == "Check") || this.record.get("paymentStatus")=="Paid"),
                    itemId: "paymentReceivedButton",
                    handler: me.paymentRecieved,
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
                    orderId: me.record.get("id"),
                    paymentId: me.record.get("authorizationInfo").captureData.id
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
            record : config.record
        });

        issueCreditModal.show();
    },

    addPayment :function(config) {
        this.record.addPayment(config);
    },
    
    // call the service via the model and save the captured amoutn
    capturePayment: function () {
        var me = this;

        // add the capture Amount
        var captureAmount = this.captureField.getValue(),
            paymentData   =  Ext.clone(this.record.get("authorizationInfo").captureData);
            data          = {
                payment: paymentData,
                amount: captureAmount
            };

        // pacakage up the data for the model to persist
        var cfg = {
            jsonData: data,
            success: function(response) {
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    return;
                }
                this.record.reload();
            },
            failure: function(response) {
                
            },
            scope: this
        };

        // call the model method to persist the change
        this.record.capturePayment(cfg);
    },
    
    // call service to update order with notice that a payment has been received;
    // this typically happens when the user recives a check payment for the total amount
    paymentRecieved: function () {
        
        var cfg = {
            data: {
                orderId: this.record.get("id")
            },
            success: function () {
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    return;
                }
                this.record.reload();
            },
            failure: function () {
                    
            },
            scope: this
        };
        this.record.paymentRecieved(cfg);
    },
    
    // called when the record has been updated
    onRecordChange : function() {
        var me = this;
        
        // clear out the ui components
        me.statusRow.destroy();
        me.paymentDetails.destroy();
        me.transactionList.destroy();
        
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