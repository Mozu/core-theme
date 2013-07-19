/**
 * @class Taco.view.order.subform.Payment
 */
Ext.define('Taco.view.order.subform.Payment', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.modal.IssueCredit',
        'Taco.view.order.modal.RequestCheck',
        'Taco.view.order.modal.CheckPayment',
        'Taco.view.order.subform.PaymentPanel'
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
        
        me.addPaymentAction = new Ext.Action({
            text: 'Add Payment',
            handler: me.addPayment,
            scope: this
        });

        me.requestCheckAction = new Ext.Action({
            text: 'Request Check',
            handler: function () {
                var me = this;
        
                var modal = Ext.create('Taco.view.order.modal.RequestCheck', {
                    record: me.record
                });
        
                modal.show();
            },
            scope: this
        });
        me.applyManualPayment = new Ext.Action({
            text: 'Add Manual Payment',
            handler: function () {
                var record = me.record.paymentsStore.getAt(0);
                me.addManualPayment({
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
                    me.requestCheckAction,
                    me.applyManualPayment
                ]
            }
        });
    },
    
    // initialize the views and actions menu
    initUI: function () {

        var me = this;     
        me.initActionsMenu();
        me.initHeader();
        me.bodyCont.add(me.headerDetails);

        this.record.payments().each( function (payment) {
            me.bodyCont.add(Ext.create('Taco.view.order.subform.PaymentPanel',
                {
                    order: me.record,
                    record: payment
                }));
        });
      
        

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
    
    applyCheck: function (config) {
        alert('create check');
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
    
    addManualPayment: function (config) {
        var me = this;

        var modal = Ext.create('Taco.view.order.modal.ManualPayment', {
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
                debugger;
                var modal = Ext.create('Taco.view.order.modal.CheckPayment', {
                    record: me.record
                });

                modal.show();
                break;
        }
        
        //this.record.addPayment(config);
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