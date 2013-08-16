/**
 * @class Taco.view.order.modal.EditOrderDetail
 */
Ext.define('Taco.view.order.modal.EditOrderDetail', {
    extend: 'Ext.window.Window',
    requires: [
        'Taco.view.order.widget.OrderItemGrid',
        'Taco.view.order.widget.OrderTotalPanel'
    ],
    //cls: Taco.baseCSSPrefix + 'order-modal',
    config : {
        record: null,
        rowTotalColumnWidth: 100,
        hasDraft: true,
        actionColumnWidth: 60
    },
    autoShow: true,
    //destroyOnHide: true,
    //closeAction:"destroy
    constrain: true,
    relativeHeight: 1,
    relativeWidth: 1,
    maxHeight:1400,
    maxWidth: 1200,
    minWidth: 700,
    minHeight:500,
    width: 800,
    height: 600,
    
    
    style: "border-radius: 0.6em;border:1px solid #fff;background-color:#fff;box-shadow: 0 0.7em 3.5em rgba(0, 0, 0, 0.3);-webkit-box-shadow: 0 0.7em 3.5em rgba(0, 0, 0, 0.3);",
    border: false,
    layout: {
        type:"vbox",
        align: 'stretch'
    },
    cls: Taco.baseCSSPrefix + 'orderform-detail',
    ghost: false,
    modal:true,
    bodyStyle: {
        border: '0px',
        padding: '28px 28px 0px 28px',
        backgroundColor:"#fff"
    },
    
    afterRender: function () {
        this.callParent(arguments);

    },
    
    initComponent: function (eOpts) {
        var me = this;
        
        // Todo: Need to listen for a navigation (via backbutton) and cancel the navigation if editor is dirty or prompt user to cancel and navigate.
        // Todo: Create override/mixin/plugin for Ext.Window to add support for relative height and width with min max values.

        me.titleTemplate = new Ext.XTemplate(
            "Order No. {orderNumber}"
        );

        me.title = me.titleTemplate.apply({
            orderNumber: me.record ? me.record.get('orderNumber') : '<New>'
        });

        me.header = {
            xtype: "header",
            style: "padding:28px;border-bottom: 1px dashed #999691 !important;font-size: 1.25em;font-weight: normal;"
        };

        me.dirtyButton = Ext.create('Taco.core.ux.action.DirtyButton', {
            xtype: 'primarybutton',
            text: 'Save & Close',
            hidden: !me.isDraft,
            onClick: function () {
                me.saveDraftOrder();
            }
        });

        me.dirtyButton.setDirty(true);

        me.dockedItems = [
            {
                xtype: 'toolbar',
                dock: 'bottom',
                weight: 1,
                ui: 'footer',
                style: "padding:28px 28px 28px 28px;",
                defaults: {
                    minWidth: 100,
                    margin: "0px 0px 0px 10px"
                },
                items: [
                    {
                        xtype: "taco.button",
                        text: 'Discard Changes',
                        hidden: !me.isDraft,
                        margin: "0px 0px 0px 0px",
                        onClick: function () {
                            me.removeDraftOrder();
                        },
                        scope: me
                    },
                    { 
                        xtype: 'component', 
                        flex: 1 
                    },
                    {
                        xtype: "taco.button",
                        text: 'Close',
                        onClick: function (button) {
                            me.close();
                        }
                    },
                    this.dirtyButton
                ]
            }
        ];
        
        if (!me.record) {
            me.loadRecord();
        }
        this.callParent(arguments);
    },
    
    // onShow show the loading mask while we wait for the service to respond with the draft record;
    show : function() {
        var me = this;
        me.callParent(arguments);

        if (!me.record) {
            me.setLoading(true, me.body);
        }
        else {
            me.onLoadRecord();
        }
    },
    
    reloadData: function () {
        var me = this;
        //call the service to reload the data;
        me.loadRecord();
    },

    // call the service and get an updated record;
    loadRecord: function () {
        var me = this,
            orderId = me.record ? me.record.getId() : me.recordId,
            orderModel = Ext.ModelManager.getModel('Taco.model.Order');

        orderModel.load(orderId, {
            params: { 'draft': me.isDraftMode },
            failure: function (record, operation) {
                //do something if the load failed
                me.setLoading(false, this.body);
            },
            success: function (record, operation) {
                
                me.record = record;
                me.onLoadRecord();
            },
            callback: function (record, operation) {
                //do something whether the load succeeded or failed
            }
        });
    },
    
    // when the draft record has loaded create and add the total and grid and hide the loading mask;
    onLoadRecord : function() {
        var me = this;
        // initialize the ui when the record loads the first time.
        if (!this.totalRow) {
            me.initUi();
        } else {
            // update the ui after the record has been reloaded
            me.updateUi();
        }
        this.setLoading(false, this.body);
    },
    
    // reloads the ui using new data
    updateUi: function () {
        var me = this;
        me.totalRow.setData(me.record.getData());
        me.detailGrid.getStore().loadRecords(me.record.itemsStore.getRange());
    },
    
    // initialize the header and grid when the data load the first time
    initUi: function () {
        var me = this;

        me.totalRow = Ext.create('Taco.view.order.widget.OrderTotalPanel', {
            style: "margin: 0px 0px 0px 0px;border: 1px solid #cccccc !important; border-top-width:1px !important;padding-top:10px",
            data: me.record.getData(),
            totalColumnWidth: me.getRowTotalColumnWidth(),
            actionColumnWidth: me.getActionColumnWidth(),
            isEditable:true
        });

        me.detailGrid = Ext.create('Taco.view.order.widget.OrderItemGrid', {
            editMode: true,
            flex: 1,
            record: me.record,
            store: me.record.itemsStore,
            autoHeight: true,
            listeners: {
                'draftOrderSaved': function (data) {
                    me.setLoading(false, me.body);
                    me.fireEvent('draftOrderSaved', data);
                    me.setHasDraft(false);
                    me.hide();
                },
                'draftOrderRemoved': function (data) {
                    me.setLoading(false, me.body);
                    me.fireEvent('draftOrderRemoved', data);
                    me.setHasDraft(false);
                    me.hide();
                },
                'save': function () {
                    me.setLoading(true, me.body);
                    me.setHasDraft(true);
                },
                'saveSuccess': function (data) {
                    me.setLoading(false, me.body);
                    me.fireEvent('saveSuccess', data);
                    me.reloadData();
                },
                'saveFailure': function (error) {
                    me.setLoading(false, me.body);
                    me.fireEvent('saveFailure', error);
                }
            }
        });

        this.add([
            me.detailGrid,
            me.totalRow
        ]);

    },





    // save the draft order and close the editor;
    removeDraftOrder: function() {
        var me = this;
        me.detailGrid.removeDraftOrder();
    },
    
    //save the draft order and close the editor;
    saveDraftOrder: function () {
        var me = this;
        me.detailGrid.saveDraftOrder();
    },
    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy : function (destroy) {
        this.callParent(arguments);
    }
});