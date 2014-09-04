
/**
 * @class Taco.view.order.modal.EditOrderDetail
 */

Ext.define('Taco.view.order.modal.EditOrderDetail', {
    extend: 'Taco.core.ux.window.Drawer',    
    //extend: 'Ext.window.Window',

    requires: [
        'Taco.view.order.widget.OrderItemGrid',
        'Taco.view.order.widget.OrderTotalPanelEditable'
    ],

    // this should really be the default;
    closeAction: 'destroy',

    autoShow: true,
    closable: true,
    cls: Taco.baseCSSPrefix + 'orderform-editor',
    height: '95%',
    scale: 'large',
    title: 'Edit Order Details',
    width: '95%',

    actionColumnWidth: 50,

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
        text:"Save Draft",
        itemId: 'secondaryAction',
        handler: function () {
            // we just close the dialog since this ui is chatty save;
            // need to check to see if we have any unpersisted changes;
            
            this.close();
        }
    }, {
        xtype: 'button',
        itemId: 'primaryAction'
        //this will call save() which will eventualy call doSave();
    }, {
        // special button for the non-draft mode (editing an unsubmitted order).
        // this button will be shown instead of primaryAction.
        // primaryAction automatically calls saveDraft() which is very bad to do on a non-draft order.
        xtype: 'button',
        itemId: 'dismissWithoutSavingDraftAction',
        ui: 'action-primary',
        scale: 'medium',
        text: 'Save',
        handler: function () {
            this.close();
        }
    }],

    config: {
        record: null,
        //dockTotalPanel: "inline", // possible values bottomm, right, inline
        rowTotalColumnWidth: 100,
        hasDraft: true
        
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

        this.layout = {
            type: 'fit'
        }
        
        // Todo: Need to listen for a navigation (via backbutton) and cancel the navigation if editor is dirty or prompt user to cancel and navigate.
        // Todo: Create override/mixin/plugin for Ext.Window to add support for relative height and width with min max values.

        this.titleTemplate = new Ext.XTemplate(
            'Order No. {orderNumber}'
        );

        this.title = this.titleTemplate.apply({
            orderNumber: me.record ? me.record.get('orderNumber') : '<New>'
        });

        
        //onBeforeClose
        me.mon(me, 'beforecancel', me.onBeforeCancel);
        me.mon(me, 'beforesave', me.onBeforeSave);


        this.callParent(arguments);

    },

    onEsc : Ext.emptyFn,
    
    colapseDraftOrder: function (){
    
    },

    onGridBlur : function (e,target){
        
        //if the eventTarget is inside of the grid then do nothing; otherwise clear the grid;
        var t = Ext.fly(target);
        var gridParent = t.findParent('.taco-orderform-orderitemgrid');
        if (!gridParent) {
            this.detailGrid.onGridBlur();
        }
    },

    /**
     * Show the loading mask while we wait for the service to respond with the draft record.
     */
    show: function () {
        var me = this;

        this.callParent(arguments);


        // need to manually listen for events that might cause the grid to blur;
        /*
        me.mon(me.el, {
            click: me.onGridBlur,
            keypress: me.onGridBlur,
            scope: me
        });
        */



        if (!this.record) {
            this.loadRecord();
        } else {
            this.onLoadRecord();
        }

        if (!this.isDraftMode) {
            this.down('#primaryAction').hide();
            this.down('#discardAction').hide();
            this.down('#secondaryAction').hide();
        }
        else {
            this.down('#dismissWithoutSavingDraftAction').hide();
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
        
         var mask = me.setLoading({
             msg: "Loading"
         }, me.body);
        
        orderModel.load(orderId, {
            params: { 'draft': me.isDraftMode },
            failure: function (record, operation) {
                Taco.app.fireEvent('setmessage', "Error loading order", 'error');
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
        // had to move this to the top so it doesn't cause the body to scroll after the focus El is scrolled into view;
        me.setTitle(me.titleTemplate.apply({
            orderNumber: me.record.get('orderNumber') || '<New>'
        }));

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
        
        // update the record on the totalRow panel
        me.totalRow.setRecord(me.record);

        // need to determine the selection so it can be restored after updateing the records in the store;
        var currentPosition = me.detailGrid.getSelectionModel().getCurrentPosition();
        me.detailGrid.getStore().loadRecords(me.record.itemsStore.getRange());

        if (currentPosition) {
            me.detailGrid.restoreSelection(currentPosition);
        } else {
            // field is focused; need to scroll to it if needed;
            var activeFocusEl = Ext.fly(document.activeElement);
            var isHidden = activeFocusEl.isHiddenByScroll(me.body)            
            if (isHidden) {
                activeFocusEl.scrollIntoView(me.body);
            }
        }
    },

    // initialize the header and grid when the data load the first time
    initUi: function () {
        var me = this;

        me.totalRow = Ext.create('Taco.view.order.widget.OrderTotalPanelEditable', {                        
            data: me.record.getData(),
            record: me.record,
            totalColumnWidth: me.getRowTotalColumnWidth(),
            actionColumnWidth: me.actionColumnWidth,
            listeners: {
                'save': {
                    fn: function () {
                        me.saveInProgress = true;
                        me.setLoading(true, me.body);
                    },
                    scope: me
                },
                'savesuccess': {
                    fn: function () {
                        me.saveInProgress = false;
                        me.setLoading(false, me.body);
                        // if user tries to save(collapse) the order while already in the middle of a persistance call. we need to wait until the call returns;
                        if (me.deferSave) {
                            // user hit save button while another request was being persisted or when data was left unpersisted;
                            me.detailGrid.saveDraftOrder();
                        } else {
                            me.reloadData();
                        }
                    },
                    scope: me
                },
                'savefailure': {
                    fn: function () {
                        me.saveInProgress = false;
                        me.deferSave = false;
                        me.setLoading(false, me.body);                        
                    },
                    scope: me
                },

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
            actionColumnWidth: me.actionColumnWidth,
            record: me.record,
            store: me.record.itemsStore,
            autoHeight: true,
            listeners: {                
                'selectionchange': function (selModel, selected) {                    
                    //var pos = selModel.getCurrentPosition()
                    //me.detailGrid.view.focusRow(pos.row);
                },
                'viewready': function (view, eOpts) {
                    // selects the first cell of the first row by default;
                    //me.detailGrid.getSelectionModel().select(0)
                },
                'draftOrderSaved': function (data) {
                    
                    me.setLoading(false, me.body);
                    me.fireEvent('draftOrderSaved', data);
                    me.setHasDraft(false);
                    //me.close();
                    me.saveSuccess(data);
                },
                'draftOrderRemoved': function (data) {
                    
                    me.setLoading(false, me.body);
                    me.fireEvent('draftOrderRemoved', data);
                    me.setHasDraft(false);
                    me.saveSuccess(data);
                },
                // this is the save draft button use case
                'save': function () {
                     me.saveInProgress = true;
                     me.setLoading({
                         //maskCls: "x-mask taco-white-mask"
                     }, me.body);
                     me.setHasDraft(true);                     
                },
                'saveSuccess': function (data) {
                    me.saveInProgress = false;
                    me.setLoading(false, me.body);
                    //me.fireEvent('saveSuccess', data);
                    if (me.deferSave) {
                        // user hit save button while another request was being persisted or when data was left unpersisted;
                        me.detailGrid.saveDraftOrder();
                    } else {
                        me.reloadData();
                    }
                                        //me.saveSuccess(data)
                },
                'saveFailure': function (error) {
                    me.saveInProgress = false;
                    me.deferSave = false;
                    me.setLoading(false, me.body);
                    me.fireEvent('saveFailure', error);
                }
            }
        });


        // this is a fix for auto height grids that cause a scroll condition inside of another panel.
        // focus change of a cell in a grid does not cause the containing panel to scroll. this fixes that problem.
        // todo. make this a grid override so that this is fixed everywhere
        var gridSelModel = me.detailGrid.getSelectionModel();
        me.mon(gridSelModel, {
            focuschange: function (cellmodel, oldFocused, newFocused) {
                if (newFocused) {
                    var row = me.detailGrid.view.getNode(newFocused, true)
                    // check to see if the row is partially hidden from view within the scroll container;
                    // if item was deleted;
                    if (!row) {
                        return;
                    }
                    var isHidden = Ext.fly(row).isHiddenByScroll(me.body)
                    if (isHidden) {                        
                        row.scrollIntoView(me.body);
                    }
                }
            },
            scope:me
        })


        // need to make a wrapping container to get the overflow handling working properly. when not nested, the grid gets its right edge clipped off; using a wrapping container provideds better overflow handling;
        me.add(
            Ext.create("Ext.container.Container",{                
                items :  [
                    me.detailGrid,
                    me.totalRow
                ]
            })
        )
        
    },

    onBeforeSave: function () {
        var me = this;
        return me.checkAddItemToolbar(true);
    },

    onBeforeCancel: function () {
        var me = this;
        return me.checkAddItemToolbar(false);
    },

    // before canceling or saving the order, check to see if there is any unpersisted order items in the addOrderItemToolbar;
    checkAddItemToolbar: function (isSave) {
        var me = this,
            msg;

        // if user has valid add item data prompt them to add the item;
        if (me.detailGrid.addProductToolbar.isValid()) {
            msg = (isSave) ? 'Do you want to add the configured order item before saving this order?' : 'Do you want to add the configured item before closing the order editor?'

            Ext.MessageBox.show({
                title: 'Add order item?',
                // pushes the buttons to the right to be consistant with our dialog ux.
                rightJustifyButtons: true,
                // reverses the order of the buttons
                reverseOrder: true,
                msg: msg,
                closable: false,
                buttons: Ext.Msg.YESNO,
                fn: function (rec) {
                    if (rec === 'yes') {                        ;
                        
                        if (isSave) {
                            me.deferSave = true;
                        }
                        // persist the item
                        me.detailGrid.addProductToolbar.save();
                    } else {
                        // clear out the add order item toolbar and call the original action;
                        me.detailGrid.addProductToolbar.reset();
                        if (isSave) {
                            me.save();
                        } else {
                            me.close();
                        }
                    }
                }
            });

            return false;
        } else {
            return true
        }
    },

    doSave: function () {
        var me = this;
        debugger;
        me.saveDraftOrder();
    },


    removeDraftOrder: function() {
        var me = this;
        me.detailGrid.removeDraftOrder();
    },

    // check to see if there are unpersisted fields that need to be handled;
    needsToPersist : function (cfg){        
        var me = this;
        
        if (me.totalRow.needsToPersist()) {
            return true;
        } else {
            return false;
        }
    },

    //overwrites the original order with the draft order;
    saveDraftOrder: function () {
        var me = this;
        if (me.needsToPersist() || me.saveInProgress) {
            // need to wait to save until any persistance calls complete;
            me.deferSave = true;
            console.log('deferSave')
        } else {
            me.detailGrid.saveDraftOrder();
        }
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
