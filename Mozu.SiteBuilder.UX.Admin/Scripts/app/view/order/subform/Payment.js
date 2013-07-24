/**
 * @class Taco.view.order.subform.Payment
 */
Ext.define('Taco.view.order.subform.Payment', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.modal.IssueCredit',
        'Taco.view.order.modal.RequestCheck',
        'Taco.view.order.modal.CheckPayment',
        'Taco.view.order.widget.PaymentPanel',
        'Taco.view.order.modal.AddPayment'
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
        
        me.addPaymentAction = new Ext.Action({
            text: 'Add Payment',
            handler: function() {
                var me = this;
        
                var modal = Ext.create('Taco.view.order.modal.AddPayment', {
                    record: me.record
                });
        
                modal.show();
            },
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
                var me = this;
        
                var modal = Ext.create('Taco.view.order.modal.ManualPayment', {
                    record: me.record
                });
        
                modal.show();
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
        me.initPaymentsUI();
    },

    initPaymentsUI: function() {
        var me = this;

        me.paymentPanels = [];

        this.record.payments().each( function (payment) {
            var panel = Ext.create('Taco.view.order.widget.PaymentPanel',
                {
                    order: me.record,
                    record: payment
                });
            me.paymentPanels.push(panel);
            me.bodyCont.add(panel);
        });
    },

    // clear out the payment panels
    destroyPaymentsUI: function() {
        var me = this;

        if (me.paymentPanels)
        {
            Ext.Array.each(me.paymentPanels, function(panel) { panel.destroy(); } );
            delete me.paymentPanels;
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

        me.bodyCont.add(me.headerDetails);
    },
    
    // called when the record has been updated
    onRecordChange : function() {
        var me = this;
        
        //re-build the ui components
        me.destroyPaymentsUI();
        me.initPaymentsUI();
    }
});