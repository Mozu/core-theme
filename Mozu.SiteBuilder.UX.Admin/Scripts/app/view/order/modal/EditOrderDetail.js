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
        rowTotalColumnWidth:100,
        actionColumnWidth: 60
    },
    autoShow: true,
    destroyOnHide: true,
    constrain: true,
    relativeHeight: 1,
    relativeWidth: 1,
    maxHeight:1400,
    maxWidth: 1200,
    minWidth: 700,
    minHeight: 600,
    width: 900,
    height: 700,
    
    
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
        this.setHeight(1000);
    },
    
    initComponent: function (eOpts) {
        var me = this;
        
        // Todo: Need to listen for a navigation (via backbutton) and cancel the navigation if editor is dirty or prompt user to cancel and navigate.
        // Todo: Create override/mixin/plugin for Ext.Window to add support for relative height and width with min max values.

        me.titleTemplate = new Ext.XTemplate(
            "Order No. {orderNumber}"
        );

        me.title = me.titleTemplate.apply({
            orderNumber: this.record.get('orderNumber')
        });

        me.header = {
            xtype: "header",
            style: "padding:28px;border-bottom: 1px dashed #999691 !important;font-size: 1.25em;font-weight: normal;"
        };

        me.dirtyButton = Ext.create('Taco.core.ux.action.DirtyButton', {
            xtype: 'primarybutton',
            text: 'Save & Close',
            onClick: function () {
                me.saveDraftOrder();
            },
            scope: me
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
                        margin: "0px 0px 0px 0px",
                        onClick: function () {
                            me.removeDraftOrder();
                        },
                        scope: me
                    },
                    { xtype: 'component', flex: 1 },
                    {
                        xtype: "taco.button",
                        text: 'Close',
                        onClick: function (button) {
                            me.hide();
                        },
                        scope: me
                    },
                    this.dirtyButton
                ]
            }
        ];
        
        me.orderModel = Ext.ModelManager.getModel('Taco.model.Order');
        var extraParams = me.orderModel.getProxy().extraParams;
        Ext.apply(extraParams, {
            draft: true
        });

        me.loadRecord();
        this.callParent(arguments);
    },
    
    // onShow show the loading mask while we wait for the service to respond with the draft record;
    show : function() {
        var me = this;
        me.callParent(arguments);
        this.setLoading(true, this.body);
    },
    
    reloadData: function (data) {
        var me = this;
        // reload with the data passed in.
        if (data.items) {
            me.draftRecord.set(data);
            me.draftRecord.commit();
            me.onLoadRecord();
        } else {
            //call the service to reload the data;
            me.loadRecord();
        }
    },

    // call the service and get an updated record;
    loadRecord: function () {
        var me = this,
            orderId = (me.record) ? me.record.get('id') : me.orderId;
        
        me.orderModel.load(orderId, {
            scope: me,
            failure: function (record, operation) {
                //do something if the load failed
                this.setLoading(false, this.body);
            },
            success: function (record, operation) {
                //do something if the load succeeded
                me.draftRecord = record;
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
        me.totalRow.setData(me.draftRecord.getData());
        me.detailGrid.getStore().loadRecords(me.draftRecord.itemsStore.getRange());
    },
    
    // initialize the header and grid when the data load the first time
    initUi: function () {
        var me = this;

        me.totalRow = Ext.create('Taco.view.order.widget.OrderTotalPanel', {
            style: "margin: 0px 0px 0px 0px;border: 1px solid #cccccc !important; border-top-width:1px !important;padding-top:10px",
            data: me.draftRecord.getData(),
            totalColumnWidth: me.getRowTotalColumnWidth(),
            actionColumnWidth: me.getActionColumnWidth()
        });

        me.detailGrid = Ext.create('Taco.view.order.widget.OrderItemGrid', {
            editMode: true,
            flex: 1,
            record: me.draftRecord,
            store: me.draftRecord.itemsStore,
            autoHeight: true,
            listeners: {
                'draftOrderSaved': {
                    fn: function (data) {
                        me.setLoading(false, me.body);
                        me.fireEvent('draftOrderSaved', data);
                        me.hide();
                    },
                    scope: me
                },
                'draftOrderRemoved': {
                    fn: function (data) {
                        me.setLoading(false, me.body);
                        me.fireEvent('draftOrderRemoved', data);
                        me.hide();
                    },
                    scope: me
                },
                'save': {
                    fn: function () {
                        me.setLoading(true, me.body);
                    },
                    scope: me
                },
                'saveSuccess': {
                    fn: function (data) {
                        me.setLoading(false, me.body);
                        me.fireEvent('saveSuccess', data);
                        me.reloadData(data);
                    },
                    scope: me
                },
                'saveFailure': {
                    fn: function (error) {
                        me.setLoading(false, me.body);
                        me.fireEvent('saveFailure', error);
                    },
                    scope: me
                }
            }
        });

        this.add([
            me.detailGrid,
            me.totalRow
        ]);

    },



    hide: function () {
        // fire an event with the draft record so anyone that spawned this editor will be able to react to any changes that have occurred.
        // they will likely need to pull a new version of the order record;
        // todo: need to decide how to communicate with the main order detail view. 
        this.fireEvent("editorClose", this.record);
        this.callParent();
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
    }
});