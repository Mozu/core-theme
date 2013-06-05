/**
 * @class Taco.view.order.subform.Payment
 */
Ext.define('Taco.view.order.subform.Payment', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [],
    config : {
        // order model
        record: null,
        
        // title for the panel header
        title: 'Payment & Billing Information',
        
        // components to add to the panel header. typically used to add an actions menu button
        tools: [

            // Actions menu button
            {
                xtype: "button",
                menuAlign: "tr-br",
                cls: "editContainer-menu-trigger",
                iconCls: "editContainer-menu-trigger-icon",
                height: 34,
                width: 46,
                menu: {
                    plain: true,
                    items: [
                        { text: 'Void Authorization and Reauthorize' },
                        { text: 'Add Payment' }
                    ]
                }
            }
        ]



    },
    
    cls: Taco.baseCSSPrefix + 'orderform-payment',
    
    initComponent: function(eOpts) {
        var me = this;
    
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
                    itemId:"captureField",
                    padding:"0 10",
                    unitString: "$",
                    unitAtEnd: false,
                    value : this.record.get("total"),
                    allowBlank: true,
                    minValue: 0,
                    maxValue: 100000
                }, {
                    xtype: "secondarybutton",
                    text: "Capture Payment",
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

        
        me.paymentDetails = Ext.create('Ext.Component', {
            cls: "orderform-payment-paymentDetails",
            tpl: [
                '<div class="authorizedCreditCard">',
                    '<span class="creditCard">Visa xxxx-xxxx-xxxx-4321</span>',
                    '<span class="seperator">|</span>',
                    '<span class="authorization">Authorization ID: 09873746</span>',
                '</div>',
                '<div class="orderSummary">',
                    '<span class="orderTotal">Order Total: $229.48</span>',
                    '<span class="seperator">|</span>',
                    '<span class="Received">Received: $0.00</span>',
                    '<span class="seperator">|</span>',
                    '<span class="balance">Balance: $229.48</span>',
                '</div>',
                '<div class="billingInformation">',
                    '<span class="fullName">Bill to: Harry Balzonya</span>',
                    '<span class="seperator">|</span>',
                    '<span class="address">6543 nowhere lane, austin texas 78731</span>',
                    '<span class="seperator">|</span>',
                    '<span class="country">United States</span>',
                    '<span class="seperator">|</span>',
                    '<span class="phoneNumber">512.666.6666</span>',
                '</div>'
            ],
            data: this.record.getData()
        });
        
        /*
        PaymentID: "337"
creditCard: "Visa xxxx-xxxx-xxxx-1111"
paidAmount: "100.00"
transactionData: "March 18, 2013"
transactionID: "00158221"
        */

        me.transactionList = Ext.create('Ext.Component', {
            cls: "orderform-payment-transactionlist",
            tpl: [
                '<tpl for="payments">',
                    '<div class="payment">',
                        'March 18, 2013 ',
                        '<span class="seperator">|</span>', 
                        'Payment id: 337 ',
                        '<span class="seperator">|</span>',
                        'Paid: $229.48 ',
                        '<span class="seperator">|</span>',
                        'Visa xxxx-xxxx-xxxx-1111 ',
                        '<span class="seperator">|</span>',
                        'Transaction ID 00158221',
                    '</div>',
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
