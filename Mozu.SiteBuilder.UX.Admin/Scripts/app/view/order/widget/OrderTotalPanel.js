/**
 * @class Taco.view.order.widget.OrderTotalPanel
 * panel for display of subtotal, discounts, shipping, tax, and order total
 * used in the OrderDetail and OrderDetailEditor
 */

Ext.define('Taco.view.order.widget.OrderTotalPanel', {
    extend: 'Ext.container.Container',

    requires: [],

    layout: {
        type: 'hbox',
        align: 'stretch',
        pack: 'start'
    },

    defaults: { xtype: "component" },
    //style: "margin: 0px 0px 0px 0px;border: 1px solid #cccccc !important; border-top-width:1px !important;padding-top:10px",
    
    config: {
        /**
         * data from the order     
         */
        data: null,
        /**
         * width of the row total column in the associated order item grid. this keeps the labels and values aligned with the associated grid;   
         */
        totalColumnWidth: 100,
        /**
         * width of the actions column in the associated order item grid. this keeps the labels and values aligned with the associated grid;   
         */
        actionColumnWidth: 0,
        
        isEditable: false
    },
    
    initComponent: function(eOpts) {
        var me = this;

        


        me.cls = 'orderform-detail-totalRow x-grid-row';
        
        var tdCls = "x-grid-table x-grid-with-row-lines";
        var tdInnerCls = "x-grid-cell-inner adustment-cell-inner";

        var editableCls = ""
        if (this.isEditable) {
            editableCls = " orderEditable";
        }

        this.totalTable = Ext.create("Ext.Component", {
            data: me.getData(),
            cls: editableCls,
            flex: 1,
            tpl: [
                '<table class="x-grid-table x-grid-with-row-lines" border="0" cellspacing="0" cellpadding="0" style="width:100%;">',
                // todo make this dynamic and pulls from grid header to get correct widths;
                '<colgroup><col class="" style="text-align:right"></colgroup>',
                '<colgroup><col class="" style="width:110px;;text-align:right"></colgroup>',
                '<colgroup><col class="" style="width:60px;"></colgroup>',

                '<tr>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">SubTotal</div></td>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{discountedSubtotal:usMoney}</div></td>',
                '</tr>',
                
                '<tpl for="orderDiscounts">',
                    '<tr class="discount ', '<tpl if="!isActive">suppressed<tpl else>active</tpl>', '">',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Discount ({description})</div></td>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">-{total:usMoney}</div></td>',
                        '<td class="x-action-col-cell taco-menu-col-cell x-action-col-celladjustment-cell' + tdCls + '">',
                            '<div unselectable="on" isActive="{isActive}" discountId="{discountId}"  action="processDiscount"',
                                'class="order-action-icon discount-', '<tpl if="isActive">suppress<tpl else>activate</tpl>', '">',
                             '</div>',
                        '</td>',
                    '</tr>',
                '</tpl>',

                '<tpl if="orderAdjustment.amount !== 0">',
                    '<tr>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Order Adjustment</div></td>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{orderAdjustment.amount:usMoney}</div></td>',
                        '<td class="x-action-col-cell taco-menu-col-cell x-action-col-celladjustment-cell' + tdCls + '">',
                            '<div unselectable="on" class="order-action-icon cancel-adjustment" action="orderAdjustment"></div>',
                        '</td>',
                    '</tr>',
                '</tpl>',
                
                '<tr>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Tax</div></td>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{taxTotal:usMoney}</div></td>',
                '</tr>',


                '<tr class="row-group-start">',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Shipping ({shippingMethodName}):</div></td>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{shippingSubtotal:usMoney}</div></td>',
                '</tr>',
                
                '<tpl if="handlingTotal !== 0">',
                    '<tr>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Additional Handling</div></td>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{handlingTotal:usMoney}</div></td>',
                    '</tr>',
                '</tpl>',
                
                
                '<tpl for="shippingDiscounts">',
                    '<tr class="discount ', '<tpl if="!isActive">suppressed<tpl else>active</tpl>', '">',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Shipping Discount ({description}):</div></td>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">-{total:usMoney}</div></td>',
                        '<td class="x-action-col-cell taco-menu-col-cell x-action-col-celladjustment-cell' + tdCls + '">',
                            '<div unselectable="on" isActive="{isActive}" discountId="{discountId}"  action="processDiscount"',
                                'class="order-action-icon discount-', '<tpl if="isActive">suppress<tpl else>activate</tpl>', '">',
                            '</div>',
                        '</td>',
                    '</tr>',
                '</tpl>',
                

                '<tpl if="shippingAdjustment.amount !== 0">',
                    '<tr>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Shipping Adjustment</div></td>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{shippingAdjustment.amount:usMoney}</div></td>',
                        '<td class="x-action-col-cell taco-menu-col-cell x-action-col-celladjustment-cell' + tdCls + '">',
                            '<div unselectable="on" class="order-action-icon cancel-adjustment" action="shippingAdjustment"></div>',
                        '</td>',
                    '</tr>',
                '</tpl>',


                // only show the shipping total if there is an adjustment or discount
                '<tpl if="shippingAdjustment.amount !==0 || shippingDiscounts.length">',
                    '<tr>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Shipping Total</div></td>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{shippingTotal:usMoney}</div></td>',
                    '</tr>',
                '</tpl>',
                
                '<tpl if="adjustmentTotal">',
                    '<tr>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{adjustmentDescription}</div></td>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{adjustmentTotal:usMoney}</div></td>',
                    '</tr>',
                '</tpl>',
                
                
                '<tr class="row-group-start">',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Total</div></td>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{total:usMoney}</div></td>',
                '</tr>',


                '</table>'
            ]
        });
        
        if (me.isEditable) {
            this.totalTable.on({
                click: {
                    element: 'el',
                    fn: function (e, t, eOpts) {
                        var action = t.getAttribute("action");
                        if (action) {
                            switch (action) {
                                case "shippingAdjustment":
                                    me.fireEvent("clearShippingAdjustment")
                                    break;
                                case "orderAdjustment":
                                    me.fireEvent("clearOrderAdjustment")
                                    break;
                                case "processDiscount":
                                    me.fireEvent("processDiscount", {
                                        isActive: t.getAttribute("isActive"),
                                        discountId: t.getAttribute("discountId")
                                    });
                                    break;
                            }
                        }
                    },
                    scope: me
                }
            });
        }

        this.items = [
            this.totalTable
        ];
        
        me.callParent(arguments);

        
        

    },
    
    // when the data gets updated apply the new data to the two subComponents;
    updateData: function (newValue, oldValue) {
        var me = this;
        if (newValue) {
            this.totalTable.update(newValue);
        }
    },
    
    /**
     * Do any class level cleanup. Destroy and null any scoped refs.     
     */
    onDestroy : function() {
        this.callParent(arguments);
    }
});