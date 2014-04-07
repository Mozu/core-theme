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

        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-returns'].join(' ');

        // after the record is reloaded we will need to refresh the ui
        this.mon( me.record, "aftercommit", function () {
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
    onOrderChange: function () {
        
        Ext.suspendLayouts();
        this.initCreateButton();
        Ext.resumeLayouts(true);
        
    },
    initCreateButton:function () {
        var me = this,
            orderStatus = me.record.get('orderStatus'),
            fulfillmentStatus = me.record.get('fulfillmentStatus'),
            enabled = orderStatus == 'Completed' || (orderStatus == 'Processing' && (fulfillmentStatus == 'Fulfilled' || fulfillmentStatus == 'PartiallyFulfilled'));
        
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
                    me.returnsStore.remove(record);

                    var msg = batch.exceptions && batch.exceptions.length && batch.exceptions[0].error && batch.exceptions[0].error.remoteException ? batch.exceptions[0].error.remoteException.data.message : 'Error Creating the Return';
                    Taco.app.fireEvent('setmessage',  msg ,'error');
                 }
            }, this);
        });

    }

});