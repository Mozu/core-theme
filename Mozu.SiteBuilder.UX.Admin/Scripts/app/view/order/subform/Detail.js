/**
 * @class Taco.view.order.subform.Detail
 * Shows the details of the order. Includes order items, disounts, shipping, totals
 * 
 */

Ext.define('Taco.view.order.subform.Detail', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.OrderTotalPanel',
        'Taco.view.order.widget.OrderItemGrid',
        'Taco.view.order.modal.EditOrderDetail'
    ],
    
    title: 'Order Details',
    alias: 'widget.orderDetailSubform',
    
    config: {
        
        // order model
        record: null,
        
        // determines whether the detailGrid allows field editing
        editMode: false,
        
        // width of the actionColumn. used to align the grid total container
        actionColumnWidth: 60,
        
        // width of the row total Column. used to align the grid total container
        rowTotalColumnWidth: 100,
        
        itemId:"orderDetails",
        // components to add to the panel header. typically used to add an actions menu button
        tools: []
    },
        
    initComponent: function (eOpts) {
        var me = this,
            orderItemStore;
        
        // after the record is reloaded we will need to refresh the ui
        me.record.on("aftercommit", function () {
            me.onRecordChange();
        }, me);
        
        // var siteContext = Taco.app.context.getCurrent().urlToken;
        

        this.cls += ' ' + Taco.baseCSSPrefix + 'orderform-detail';

        this.actionTrigger = Ext.create('Taco.core.ux.action.Button', {
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
                    {
                    text: 'Edit Details',
                        handler: function (button, e) {
                            var animationTarget = this.actionTrigger.el;
                            this.editOrder(animationTarget);
                        },
                        scope: me
                }, {
                    text: 'Cancel Order',
                    disabled: true
            }
                ]
            }
        });
    
        // add the action trigger icon in header;
        this.setTools([this.actionTrigger]);
    
        // store that contains the orderItems for this order model
        orderItemStore = this.record.itemsStore;

        
        // plugin to add suppourt to the grid for editing the price and quantity columns
        var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });
        
        // readonly list of products and discounts;
        me.detailGrid = Ext.create('Taco.view.order.widget.OrderItemGrid', {
            editMode: this.getEditMode(),
            record : this.record,
            store: orderItemStore,
            autoHeight: true,
            listeners: {
                'draftOrderRemoved': {
                    fn: function (data) {
                        me.setLoading(true, this.body);
                        me.onRecordChange();
                    },
                    scope: me
                }
            }
        });
        
        
        // subtotals, orderlevel discounts, tax shipping, and totals
        this.totalRow = Ext.create('Taco.view.order.widget.OrderTotalPanel', {
            data: me.record.getData(),
            totalColumnWidth: me.getRowTotalColumnWidth(),
            actionColumnWidth: me.getActionColumnWidth()
        });
        
        // customer notes class
        this.customerNoteRow = Ext.create('Ext.Component', {
            cls: "orderform-detail-customerNotesRow",
            tpl: [
                '<div class="customerNote">',
                    '<span class="label">Customer Notes:</span> {customerNote}',
                '</div>'
            ],
            data:this.record.getData()
        });
        
        Ext.apply(this, {
            items: [
                me.detailGrid,
                this.totalRow,
                this.customerNoteRow
            ]
        });

        this.callParent(arguments);
    },
        
    // handler for when user clicks on an order item product link
    //viewProductDetail: function (productId) {
    //    
    //    return;
        // disabled this method and made and used link instead;
        // leaving this code temporarily in case I need to add some logic to inhibit the link


    //    if (!productId) {
    //        return;
    //    }
        //link to the store front version
        //window.open('/_gosite/' + record.getId() + '?environment=preview&redir=' + encodeURIComponent('/product/' + eventData.record.getId()), 'taco-preview');
    //    window.open("/product/" + productId);


        //link to the editor
        //window.open("http://dev.mozu.com:8081/admin/c-1/products/edit/" + productId);
    //},
    
    editOrder: function (animationTarget) {
        var me = this;
        
        var win = Ext.create('Taco.view.order.modal.EditOrderDetail', {
            record: this.record,
            listeners: {
                'close': {
                    fn:function(view,e) {
                        if (view.getHasDraft()) {
                            me.record.set('hasDraft',true);
                            me.updateHasDraftToolbar();
                        }
                        
                    },
                    scope:me
                },
                'draftOrderSaved': {
                    fn: function () {
                        me.setLoading(true, this.body);
                        this.record.reload();
                    },
                    scope:me
                },
                'draftOrderRemoved': {
                    fn: function (data) {
                        me.setLoading(true, this.body);
                        // hide the toolbar
                        me.detailGrid.removeDocked(me.detailGrid.hasDraftToolbar, true);
                    },
                    scope: me
                }
            }
            
        });

        win.show();
    },
    

    // when the record changes we will need to update the order details
    onRecordChange: function () {
        var me = this;

        Ext.suspendLayouts();
        // need to reload the record;
        me.updateUi();
        Ext.resumeLayouts(true);
        
        me.setLoading(false, this.body);
    },
    
    updateHasDraftToolbar : function() {
        var me = this;
        //hide or show the toolbar accordingly
        if (me.record.get("hasDraft")) {
            me.detailGrid.showHasDraftToolbar();
        } else {
            me.detailGrid.removeDocked(me.detailGrid.hasDraftToolbar);
        }
    },
    
    updateUi: function () {
        var me = this;
        me.totalRow.setData(me.record.getData());
        //me.detailGrid.getStore().loadRecords(me.record.itemsStore.getRange());
        // itemStore not updating with new data

        me.detailGrid.getStore().loadRawData(me.record.getData().items);


        me.updateHasDraftToolbar();
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function () {
       
        this.callParent(arguments);
    }
});
