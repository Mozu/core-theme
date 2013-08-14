/**
 * @class Taco.view.order.subform.Payment
 */
Ext.define('Taco.view.order.subform.Return', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.CreateReturnPanel',
        'Taco.view.order.widget.ProcessReturnPanel'
    ],
    title: 'RMA',
    config: {
        
        // order model
        originalRecord: null,
        record: null,
        returnsStore:null,
        itemId: "orderReturn",
        // title for the panel header
        title: 'RMA',
        // components to add to the panel header. typically used to add an actions menu button
        tools: []
    },

    initComponent: function (eOpts) {
        var me = this;

        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-payment'].join(' ');

        // after the record is reloaded we will need to refresh the ui
        me.record.on("aftercommit", function () {
            me.onOrderChange();
        }, this);
        
        me.returnsStore = this.record.getReturnsStore();
        if (me.record.get('returnStatus') && me.record.get('returnStatus') != 'None') {
            me.returnsStore.load();
        }
        me.createButton = Ext.create('Taco.core.ux.action.SecondaryButton', {
            text: 'Create a return ',
            
            listeners: {
                click: me.onCreateButtonClicked,
                scope: this
            }
        });
        me.initCreateButton();
        me.setTools([me.createButton]);
        // initialize the ui
        // this will be called every time the record is updated
        me.bodyCont = Ext.create('Ext.container.Container', {            
            items: [
                
            ]
        });
        
        if (me.returnsStore.isLoading()) {
            me.returnsStore.on({
                load: me.initProcessReturnPanels,
                single: true,
                scope: me
            });
        } else {
            me.initProcessReturnPanels();
        }
        


        Ext.apply(me, {
            items: [
                me.bodyCont
            ]
        });
        this.callParent(arguments);
    },
    onOrderChange:function () {
        this.initCreateButton();
    },
    initCreateButton:function () {
        var me = this,
            orderStatus = me.record.get('orderStatus'),
            shippingStatus = me.record.get('shippingStatus'),
            enabled = orderStatus == 'Completed' || ( orderStatus == 'Processing' && ( shippingStatus == 'Shipped' || shippingStatus == 'PartiallyShipped') );
        me.createButton.setDisabled(!enabled);
        

    },
    initProcessReturnPanels:function () {

        var me = this;
        me.returnsStore.each(function (record) {
            me.addProcessReturnPanel(record);

        });
        
    },
    addProcessReturnPanel:function (record) {
        var me = this,
            panel = Ext.create('Taco.view.order.widget.ProcessReturnPanel', {
            order: me.record,
            record: record
        });
        if (Ext.isArray(me.bodyCont.items)) {
            me.bodyCont.items.push(panel);
        } else {
            me.bodyCont.add(panel);
        }
    },
    onCreateButtonClicked: function () {
        var me = this,
            creator;

        me.createButton.setDisabled(true);
        creator = Ext.create('Taco.view.order.widget.CreateReturnPanel', { record: me.record });

        me.bodyCont.add(creator);
        creator.on('cancel', function () {
            me.bodyCont.remove(creator);
            me.createButton.setDisabled(false);
        });
        creator.on('create', function (creator, returnData) {
            var record = me.returnsStore.add([returnData])[0];
            me.setLoading(true);
            
            
            me.returnsStore.sync({
                callback: function () {
                    me.bodyCont.remove(creator);
                    me.setLoading(false);
                    me.createButton.setDisabled(false);
                },
                success:function (batch) {
                    me.addProcessReturnPanel(record);
                },
                failure: function (batch) {
                    var msg = batch.exceptions && batch.exceptions.length && batch.exceptions[0].error && batch.exceptions[0].error.remoteException ? batch.exceptions[0].error.remoteException.getMessage() : 'Error Creating the Return';
                    Taco.app.fireEvent('setmessage',  msg ,'error');
                 }
            });
            
            
        });

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
            handler: function () {
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

                var modal = Ext.create('Taco.view.order.modal.AddPaymentManual', {
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
    }


});