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
        me.bodyCont = Ext.create('Ext.container.Container', {
            items: []
        });
        me.initUI();
        

        Ext.apply(me, {
            items: [
                me.bodyCont
            ]
        });
        this.callParent(arguments);
    },
    
    initActionsMenu: function () {
        var me = this,
            canVoidPayment = false,
            canApplyCheck = false,
            canCapture = false,
            canAppPayment = false,
            canCreditPayment = false,
            data = this.record.getData(),
            authPayment = data.payments[0],
            availableActions;
        
        if (authPayment) {
            availableActions = authPayment.availableActions || [];


            
            canVoidPayment = Ext.Array.some(availableActions, function (element) {
                return (element == "VoidPayment");
            });
            

            canApplyCheck = Ext.Array.some(availableActions, function (element) {
                return (element == "ApplyCheck");
            });

            canCapture = Ext.Array.some(availableActions, function (element) {
                return (element == "CapturePayment");
            });

            canAppPayment = Ext.Array.some(availableActions, function (element) {
                return (element == "AddPayment");
            });

            canCreditPayment = Ext.Array.some(availableActions, function (element) {
                return (element == "CreditPayment");
            });
         
        }
        

        // actions that go in the header actions menu
        /*
        if (me.voidTransactionAction) {
            me.voidTransactionAction.setDisabled(!canVoidPayment);
        } else {
            me.voidTransactionAction = new Ext.Action({
                text: 'Void Transaction',
                handler: me.voidTransaction,
                disabled: !canVoidPayment,
                scope: this
            });

        }
        */
        /*
        if (me.addPaymentAction) {
            me.addPaymentAction.setDisabled(true);
        } else {
            me.addPaymentAction = new Ext.Action({
                text: 'Add Payment',
                disabled: true,
                //disabled: !canAddPayment
                handler: me.addPayment,
                scope: this
            });
        }
        */
        
        /*

        if (me.issueCreditPaymentAction) {
            me.issueCreditPaymentAction.setDisabled(!canCreditPayment);
        } else {
            me.issueCreditPaymentAction = new Ext.Action({
                text: 'Issue Credit',
                disabled: !canCreditPayment,
                handler: function () {
                    var record = me.record.paymentsStore.getAt(0);
                    me.issueCredit({
                        record: record
                    });
                },
                scope: this
            });
        }
        
        if (me.applyCheckAction) {
            me.applyCheckAction.setDisabled(!canApplyCheck);
        } else {
            me.applyCheckAction = new Ext.Action({
                text: 'Apply Check',
                disabled: !canApplyCheck,
                handler: function () {
                    var record = me.record.paymentsStore.getAt(0);
                    me.applyCheck({
                        record: record
                    });
                },
                scope: this
            });
        }
        */
        me.addPaymentAction = new Ext.Action({
            text: 'Add Payment',
            handler: me.addPayment,
            scope: this
        });

        me.applyCheckAction = new Ext.Action({
            text: 'Add Check',
            handler: function () {
                var record = me.record.paymentsStore.getAt(0);
                me.applyCheck({
                    record: record
                });
            },
            scope: this
        });
        me.applyManualPayment = new Ext.Action({
            text: 'Add Manual Payment',
            handler: function () {
                var record = me.record.paymentsStore.getAt(0);
                me.applyCheck({
                    record: record
                });
            },
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
                    //me.voidTransactionAction,
                    //me.issueCreditPaymentAction,
                    me.applyCheckAction,
                    me.applyManualPayment
                ]
            }
        });
    },
    
    // initialize the views and actions menu
    initUI : function() {
        var me = this;     
        me.initActionsMenu();
        me.initHeader();
        me.bodyCont.add(me.headerDetails);
        //loop on number of payments 
        //pass the payment rec to the dif functions
        //me.record.data.payments
        for (var x = 0; x < 4; x++) {
            
            me.initStatusRow();
            me.initPaymentDetails();
            me.initTransactionList();
            
            me.bodyCont.add(Ext.create('Ext.panel.Panel', {
                //collapsible: true,
                style: 'border: 1px; border-style: solid; margin-bottom: 5px; padding: 3px;',
                items: [
                    me.statusRow,
                    me.paymentDetails,
                    me.transactionList
                ]
            }));
            /*
            me.bodyCont.add(me.statusRow);
            me.bodyCont.add(me.paymentDetails);
            me.bodyCont.add(me.transactionList);
            me.bodyCont.add(Ext.create('Ext.container.Container', {
                html: '<hr>'
            }));
            
            me.bodyCont.add(me.statusRow);
            me.bodyCont.add(me.paymentDetails);
            me.bodyCont.add(me.transactionList);
            me.bodyCont.add(Ext.create('Ext.container.Container', {
                html: '<hr>'
            }));*/
            //
        }
        
        

    },
    initHeader: function (){
        var me = this,
           data = this.record.getData();

        me.headerDetails = Ext.create('Ext.Component', {
           // cls: "orderform-payment-paymentDetails",
            tpl: [
                '<div class="statusField">',
                    //'<span class="orderTotal">Partially Collected</span>',
                    '<tpl if="authorizationInfo.amountCollected &gt; 0 && authorizationInfo.amountCollected != total">',
                        '<span class="orderTotal">Partially Collected</span>',
                    '</tpl>',
                    '<tpl if="authorizationInfo.amountCollected == 0">',
                        '<span class="orderTotal">None Collected</span>',
                    '</tpl>',
                    '<tpl if="authorizationInfo.amountCollected == total">',
                        '<span class="orderTotal">Fully Collected</span>',
                    '</tpl>',
                '</div>',
                '<div class="orderSummary">',
                    '<span class="orderTotal">Order Total: {total:usMoney}</span>',
                    '<span class="seperator">|</span>',
                    '<span class="Received">Received: {authorizationInfo.amountCollected:usMoney}</span>',
                    '<span class="seperator">|</span>',
                    '<span class="balance">Balance: {authorizationInfo.captureAmount:usMoney}</span>',
                '</div>'
            ],
            data: data
        });
    },
    // list of payment transactions. first item is the authorization object depending on its status
    initTransactionList: function () {
        var me = this;

        this.paymentsStore = this.record.paymentsStore;
        //todo:rework below to work off of interactions.
        //todo: remove issue credit from here.
        this.interactionsStore = this.paymentsStore.count() ? this.paymentsStore.getAt(0).interactionsStore : this.paymentsStore;
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
                    scope:me
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
    initPaymentDetails : function() {
        var me = this,
            data = this.record.getData();
        
        me.paymentDetails = Ext.create('Ext.Component', {
            cls: "orderform-payment-paymentDetails",
            tpl: [
                '<tpl if="authorizationInfo.captureData">',
                    '<tpl if="authorizationInfo.captureData.paymentType == \'Check\'">',
                        '<div class="paymentTypeCheck">Check</div>',
                    '<tpl else>',
                        '<div class="authorizedCreditCard">',
                                '<span class="creditCard">{authorizationInfo.captureData.cardType} {authorizationInfo.captureData.cardNumber}</span>',
                            // if the auth data has an id than its been authorized
                            '<tpl if="authorizationInfo.captureData.id">',
                                '<span class="seperator">|</span>',
                                    '<span class="authorization">Authorization ID: {authorizationInfo.captureData.id}</span>',
                            '</tpl>',
                        '</div>',
                    '</tpl>',
                '</tpl>',
              /*  '<div class="orderSummary">',
                    '<span class="orderTotal">Order Total: {total:usMoney}</span>',
                    '<span class="seperator">|</span>',
                    '<span class="Received">Received: {authorizationInfo.amountCollected:usMoney}</span>',
                    '<span class="seperator">|</span>',
                    '<span class="balance">Balance: {authorizationInfo.captureAmount:usMoney}</span>',
                '</div>',*/
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
            data = this.record.get("authorizationInfo");
        

        var options = Ext.create('Ext.data.Store', {
            fields: ['val', 'lbl'],
            data: [
                { "val": "credit", "lbl": "Issue Credit" },
                { "val": "void", "lbl": "Void Transaction" },
                { "val": "add", "lbl": "Add Manula Interaction" },
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
                    data: data.captureData.status
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
                }, {
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
                aftersave:function () {
                    me.record.reload();
                    
                },
                scope:me
            }
        });

        issueCreditModal.show();
    },

    addPayment: function (config) {
        var me = this;

        var modal = Ext.create('Taco.view.order.modal.Payment', {
            record: me.record
        });

        modal.show();
        //this.record.addPayment(config);
    },
    
    transactionAction: function (config) {
        var me = this;
        var record = me.record.paymentsStore.getAt(0);

        switch(me.getValue()) {
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
                    record: me.record
                });

                modal.show();
                break;
            case 'check':
                var modal = Ext.create('Taco.view.order.modal.CheckPayment', {
                    record: me.record
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