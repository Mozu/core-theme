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

        var orderId = (me.record) ? me.record.get('id') : me.orderId;

        var draftRecord = Ext.ModelManager.getModel('Taco.model.Order');
        
        var extraParams = draftRecord.getProxy().extraParams;
        Ext.apply(extraParams, {
            draft: true
        });

        draftRecord.load(orderId, {
            scope: this,
            failure: function(record, operation) {
                //do something if the load failed
                this.setLoading(false, this.body);
            },
            success: function(record, operation) {
                //do something if the load succeeded
                me.onRecordLoad(record);
            },
            callback: function(record, operation) {
                //do something whether the load succeeded or failed
            }
        });

        var titleTemplate = new Ext.XTemplate(
            "Order No. {orderNumber}"
        );
        
        me.title = titleTemplate.apply({
            orderNumber: this.record.get('orderNumber')
        });


        me.header = {
            xtype:"header",
            style: "padding:28px;border-bottom: 1px dashed #999691 !important;font-size: 1.25em;font-weight: normal;"
        };
        
        me.dirtyButton = Ext.create('Taco.core.ux.action.DirtyButton', {
            xtype: 'primarybutton',
            text: 'Save & Close',
            onClick: function() {
                me.saveDraftOrder();
            },
            scope:me
        });

        me.dirtyButton.setDirty(true);

        me.dockedItems = [
            //this.totalRow,
            {
                xtype: 'toolbar',
                dock: 'bottom',
                weight:1,
                ui: 'footer',
                style: "padding:28px 28px 28px 28px;",
                defaults: {
                    minWidth: 100,
                    margin:"0px 0px 0px 10px" 
                },
                items: [
                    {
                        xtype: "taco.button",
                        text: 'Discard Changes',
                        margin:"0px 0px 0px 0px", 
                        onClick: function () {
                            me.removeDraftOrder();
                        },
                        scope:me
                    },
                    { xtype: 'component', flex: 1 },
                    {
                        xtype: "taco.button",
                        text: 'Close',
                        onClick: function (button) {
                            me.hide();
                        },
                        scope:me
                    }, 
                    this.dirtyButton
                ]
            }
        ];

        //this.setLoading(true);
        
        // call the service and get a draft order entity
        
        // set the data for the grid;


        this.callParent(arguments);
        
    },
    
    // onShow show the loading mask while we wait for the service to respond with the draft record;
    show : function() {
        var me = this;
        me.callParent(arguments);
        this.setLoading(true, this.body);
    },

    // when the draft record has loaded create and add the total and grid and hide the loading mask;
    onRecordLoad : function(record) {
        var me = this;
        me.record = record;

        this.totalRow = Ext.create('Taco.view.order.widget.OrderTotalPanel', {
            //dock: "bottom",
            //weight: 2,
            style: "margin: 0px 0px 0px 0px;border: 1px solid #cccccc !important; border-top-width:1px !important;padding-top:10px",
            data: me.record.getData(),
            totalColumnWidth: me.getRowTotalColumnWidth(),
            actionColumnWidth: me.getActionColumnWidth()
        });
        
        me.detailGrid = Ext.create('Taco.view.order.widget.OrderItemGrid', {
            editMode: true,
            flex: 1,
            record: this.record,
            store: this.record.itemsStore,
            autoHeight: true,
            listeners: {
                'draftOrderSaved':  {
                    fn: function (data) {
                        this.setLoading(false, this.body);
                        this.fireEvent('draftOrderSaved', data);
                        this.hide();
                    },
                    scope: this
                },
                'draftOrderRemoved': {
                    fn: function (data) {
                        this.setLoading(false, this.body);
                        this.fireEvent('draftOrderRemoved', data);
                        this.hide();
                    },
                    scope: this
                },
                'save': {
                    fn: function () {
                        this.setLoading(true, this.body);
                    },
                    scope: this
                },
                'saveSuccess': {
                    fn: function (data) {
                        this.setLoading(false, this.body);
                        this.fireEvent('saveSuccess', data);
                        this.hide();
                    },
                    scope: this
                },
                'saveFailure': {
                    fn: function () {
                        this.setLoading(false, this.body);
                    },
                    scope: this
                }
            }
        });

        this.add([
            me.detailGrid,
            me.totalRow
        ]);

        this.setLoading(false, this.body);
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