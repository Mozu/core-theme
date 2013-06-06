/**
 * @class Taco.view.order.subform.Payment
 */
Ext.define('Taco.view.order.subform.Payment', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [],
    config : {
        // order model
        record: null,
        itemId:"orderPayment",
        // title for the panel header
        title: 'Payment & Billing Information',
        // components to add to the panel header. typically used to add an actions menu button
    },
    
    initComponent: function(eOpts) {
        var me = this,
            canCapture=false,
            alreadyCapturedAmount,
            captureAmount,
            captureData,
            payments,
            paymentDetailsData,
            totalAmount;

        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-payment'].join(' ');

        this.tools = [{
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
                items: [{
                    text: 'Void and Reauthorize'
                }, {
                    text: 'Add Payment'
                }]
            }
        }]
    },
    
    initComponent: function(eOpts) {
        var me = this;

        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-payment'].join(' ');
    
        

        //look at the payments array and determine if we are in a capture state.
        // if the first item in the payments collection is status of authorized and amountCollected is 0, then show the capture ui.
        payments = this.record.get("payments");
        totalAmount = this.record.get("total");
        alreadyCapturedAmount = 0;
        for (var i = 0; i < payments.length; i++) {
            alreadyCapturedAmount += payments[i].amountCollected;
        }

        captureAmount = totalAmount - alreadyCapturedAmount;
        captureData = payments[0];
        
        if (payments[0] && payments[0].status == "Authorized" && payments[0].amountCollected === 0) {
            canCapture = true;            
        }

        
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
                    cls:"statusField",
                    tpl: '{.}',
                    data: this.record.get("paymentStatus")
                }, {
                    xtype: 'unitfield',
                    width: 120,
                    hidden: !canCapture,
                    itemId:"captureField",
                    padding:"0 10",
                    unitString: "$",
                    unitAtEnd: false,
                    value: captureAmount,
                    allowBlank: true,
                    minValue: 0,
                    maxValue: 100000
                }, {
                    xtype: "secondarybutton",
                    text: "Capture Payment",
                    hidden: !canCapture,
                    itemId: "captureButton",
                    handler: this.capturePayment,
                    scope:me
            }
            ]
        });

        
        // assign scoped references
        this.statusField = me.statusRow.getComponent('statusField');
        this.captureField = me.statusRow.getComponent('captureField');
        this.captureButton = me.statusRow.getComponent('captureButton');

        
        /*
        
        amountCollected: 229.48
amountCredited: 0
authorizationId: "00158555"
cardNumber: "xxxx-xxxx-xxxx-1111"
cardType: "Visa"
id: "340"
paymentType: "CreditCard"
status: "Paid"

        */



        



        
        //this.record.getData()
        paymentDetailsData = Ext.apply({}, this.record.getData(), {
            totalAmount: totalAmount,
            alreadyCapturedAmount: alreadyCapturedAmount,
            captureAmount: captureAmount,
            captureData: captureData,
            canCapture:canCapture
        /*
            amountCollected: 229.48,
            amountCredited: 0,
            authorizationId: "00158555",
            cardNumber: "xxxx-xxxx-xxxx-1111",
            cardType: "Visa",
            id: "340",
            paymentType: "CreditCard",
            status: "Paid"
            */
        });
        
        

        me.paymentDetails = Ext.create('Ext.Component', {
            cls: "orderform-payment-paymentDetails",
            tpl: [
                '<tpl if="captureData">',
                '<div class="authorizedCreditCard">',
                        '<span class="creditCard">{captureData.cardType} {captureData.cardNumber}</span>',
                    '<span class="seperator">|</span>',
                        '<span class="authorization">Authorization ID: {captureData.id}</span>',
                '</div>',
                '</tpl>',
                '<div class="orderSummary">',
                    '<span class="orderTotal">Order Total: {totalAmount:usMoney}</span>',
                    '<span class="seperator">|</span>',
                    '<span class="Received">Received: {alreadyCapturedAmount:usMoney}</span>',
                    '<span class="seperator">|</span>',
                    '<span class="balance">Balance: {captureAmount:usMoney}</span>',
                '</div>',
                '<div class="billingInformation">',
                    '<span class="fullName">Bill to: {customer.firstName} {customer.lastName}</span>',
                    '<span class="seperator">|</span>',
                    '<span class="address">{customer.address}</span>',
                    '<span class="seperator">|</span>',
                    '<span class="phoneNumber">?512.666.6666?</span>',
                '</div>'
            ],
            data: paymentDetailsData
        });
        

        me.transactionList = Ext.create('Ext.Component', {
            cls: "orderform-payment-transactionlist",
            tpl: [
                '<tpl for="payments">',
                    '<tpl if="amountCollected!==0">',
                    '<div class="payment">',
                            '{transactionDate:date("M j, Y")} ',
                        '<span class="seperator">|</span>', 
                            'Payment id: {id} ',
                        '<span class="seperator">|</span>',
                            'Paid: ${amountCollected} ',
                        '<span class="seperator">|</span>',
                            '{cardType} {cardNumber} ',
                        '<span class="seperator">|</span>',
                            'Transaction ID {transactionId}',
                    '</div>',
                    '</tpl>',
                '</tpl>'
            ],
            data: this.record.getData()
        });

        Ext.apply(me, {
            items: [
                me.statusRow,
                me.paymentDetails,
                me.transactionList
            ]
});

        this.callParent(arguments);
    },
    
    capturePayment :function() {
        console.log("todos: implement capturePayment");
    }
});