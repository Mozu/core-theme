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
    config: {
        
        // order model
        record: null,
        
        // title for the panel header
        title: 'Order Details',
        
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
            orderItemStore
        
        // var siteContext = Taco.app.context.getCurrent().urlToken;
        

        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-detail'].join(' ');

        this.actionTrigger = Ext.create('Taco.core.ux.action.Button', {
            //xtype: 'taco.button',
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
            autoHeight: true
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
            record: this.record
        });
        win.show(animationTarget);
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function () {
        this.callParent(arguments);
    }
});
