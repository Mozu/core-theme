/**
 * @class Taco.view.order.modal.EditOrderDetail
 */

Ext.define('Taco.view.order.modal.EditOrderDetail', {
    extend: 'Taco.core.ux.window.Drawer',
    requires: [
        'Taco.view.order.widget.OrderItemGrid',
        'Taco.view.order.widget.OrderTotalPanel'
    ],

    autoShow: true,
    // cls: Taco.baseCSSPrefix + 'orderform-editor',
    height: '95%',
    scale: 'large',
    title: 'Edit Order Details',
    width: '95%',

    actions: [{
        xtype: 'button',
        itemId: 'discardAction',
        ui: 'action',
        scale: 'medium',
        text: 'Discard Changes',
        handler: function () {
            this.removeDraftOrder();
        }
    }, {
        xtype: 'tbfill'
    }, {
        xtype: 'button',
        itemId: 'secondaryAction'
    }, {
        xtype: 'button',
        itemId: 'primaryAction'
    }],

    config: {
        record: null,
        rowTotalColumnWidth: 100,
        hasDraft: true,
        actionColumnWidth: 60
    },

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    resizable: {
        dynamic: true,
        handles: 'w sw s se e',
        heightIncrement: 1,
        minHeight: 600,
        minWidth: 800,
        preserveRatio: false,
        widthIncrement: 1
    },
    
    initComponent: function (eOpts) {
        var me = this;
        
        // Todo: Need to listen for a navigation (via backbutton) and cancel the navigation if editor is dirty or prompt user to cancel and navigate.
        // Todo: Create override/mixin/plugin for Ext.Window to add support for relative height and width with min max values.

        this.titleTemplate = new Ext.XTemplate(
            'Order No. {orderNumber}'
        );

        this.title = this.titleTemplate.apply({
            orderNumber: me.record ? me.record.get('orderNumber') : '<New>'
        });

        this.callParent(arguments);

        this.on({
            save: {
                scope: this,
                fn: 'saveDraftOrder'
            }
        });
    },
    
    /**
     * Show the loading mask while we wait for the service to respond with the draft record.
     */
    show: function() {
        this.callParent(arguments);

        if (!this.record) {
            this.loadRecord();
        } else {
            this.onLoadRecord();
        }

        if (!this.isDraftMode) {
            this.down('#discardAction').hide();
            this.down('#primaryAction').hide();
        }
    },
    
    /**
     * Call the service to reload the data.
     */
    reloadData: function () {
        this.loadRecord();
    },

    /**
     * Call the service and get an updated record.
     */
    loadRecord: function () {
        var me = this,
            orderId = me.record ? me.record.getId() : me.recordId,
            orderModel = Ext.ModelManager.getModel('Taco.model.Order');
        
        // var mask = me.setLoading({
        //     msg: "Loading",
        //     // making the initial loading mask white to avoid the screen flash
        //     maskCls: "x-mask taco-white-mask"
        // }, me.body);
        
        orderModel.load(orderId, {
            params: { 'draft': me.isDraftMode },
            failure: function (record, operation) {
                Taco.app.fireEvent('setmessage', "Error loading order", 'error');
                // me.setLoading(false, this.body);
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
        
        
        me.setTitle(me.titleTemplate.apply({
            orderNumber: me.record.get('orderNumber') || '<New>'
        }));

        // this.setLoading(false, this.body);
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
            data: me.record.getData(),
            totalColumnWidth: me.getRowTotalColumnWidth(),
            actionColumnWidth: me.getActionColumnWidth(),
            isEditable: true,
            listeners: {
                "clearShippingAdjustment":{
                    fn:function() {
                        me.detailGrid.updateOrderAdjustment({
                            data: {
                                shippingAdjustment: {
                                    amount: 0
                                }
                            }
                        });
                    },
                    scope:me
                },
                "clearOrderAdjustment": {
                    fn: function () {
                        me.detailGrid.updateOrderAdjustment({
                            data: {
                                orderAdjustment: {
                                    amount: 0
                                }
                            }
                        })
                    },
                    scope: me
                },
                "processDiscount": {
                    fn: function (data) {
                        if (data.isActive === true || data.isActive.toLowerCase() === "true") {
                            me.detailGrid.suppressDiscount({
                                jsonData: {
                                    discountId: data.discountId
                                }
                            });
                        } else {
                            me.detailGrid.activateDiscount({
                                jsonData: {
                                    discountId: data.discountId
                                }
                            });
                        }
                    },
                    scope: me
                }
            }
        });

        me.detailGrid = Ext.create('Taco.view.order.widget.OrderItemGrid', {
            editMode: true,
            flex: 1,
            record: me.record,
            store: me.record.itemsStore,
            autoHeight: true,
            listeners: {
                'draftOrderSaved': function (data) {
                    // me.setLoading(false, me.body);
                    me.fireEvent('draftOrderSaved', data);
                    me.setHasDraft(false);
                    me.close();
                },
                'draftOrderRemoved': function (data) {
                    // me.setLoading(false, me.body);
                    me.fireEvent('draftOrderRemoved', data);
                    me.setHasDraft(false);
                    me.close();
                },
                'save': function () {
                    // me.setLoading({
                    //     maskCls: "x-mask taco-white-mask"
                    // }, me.body);
                    me.setHasDraft(true);
                },
                'saveSuccess': function (data) {
                    // me.setLoading(false, me.body);
                    me.fireEvent('saveSuccess', data);
                    me.reloadData();
                },
                'saveFailure': function (error) {
                    // me.setLoading(false, me.body);
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

    constrainResizer: function () {
        var cfg = {},
            region = Ext.getBody().getRegion();

        Ext.apply(cfg, this.resizable, {
            constrainTo: region
        });

        this.resizable = cfg;
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy : function (destroy) {
        this.callParent(arguments);
    }
});
