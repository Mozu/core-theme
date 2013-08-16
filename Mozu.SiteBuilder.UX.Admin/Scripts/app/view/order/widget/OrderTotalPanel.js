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
        
        isEditable:false
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
            flex:1,
            tpl: [
                '<table class="x-grid-table x-grid-with-row-lines" border="0" cellspacing="0" cellpadding="0" style="width:100%;">',
                // todo make this dynamic and pulls from grid header to get correct widths;
                '<colgroup><col class="" style="text-align:right"></colgroup>',
                '<colgroup><col class="" style="width:110px;;text-align:right"></colgroup>',
                '<colgroup><col class="" style="width:60px;"></colgroup>',

                '<tr>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">SubTotal</div></td>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{subtotal:usMoney}</div></td>',
                '</tr>',
                
                '<tpl for="orderDiscounts">',
                    '<tr>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Discount ({description})</div></td>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{total:usMoney}</div></td>',
                        '<td class="x-action-col-cell taco-menu-col-cell x-action-col-celladjustment-cell' + tdCls + '">',
                            '<div unselectable="on" class="order-action-icon discount-suppress" isActive="{isActive}" discountId="{discountId}"></div>',
                        '</td>',
                    '</tr>',
                '</tpl>',

                '<tpl if="orderAdjustment.amount !== 0">',
                    '<tr>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Order Adjustment</div></td>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{orderAdjustment.amount:usMoney}</div></td>',
                    '</tr>',
                '</tpl>',

                '<tr>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Shipping ({shippingMethodName}):</div></td>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{shippingCost:usMoney}</div></td>',
                '</tr>',
                
                
                '<tpl for="shippingDiscounts">',
                    '<tr>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Shipping Discount ({description}):</div></td>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{total:usMoney}</div></td>',
                        '<td class="x-action-col-cell taco-menu-col-cell x-action-col-celladjustment-cell' + tdCls + '">',
                            '<div unselectable="on" class="order-action-icon discount-suppress" isActive="{isActive}" discountId="{discountId}"></div>',
                        '</td>',
                    '</tr>',
                '</tpl>',
                

                '<tpl if="shippingAdjustment.amount !== 0">',
                    '<tr>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Shipping Adjustment</div></td>',
                        '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{shippingAdjustment.amount:usMoney}</div></td>',
                    '</tr>',
                '</tpl>',


                // only show the shipping total if there is an adjustment or discount
                '<tpl if="shippingAdjustment.amount !==0 || shippingDiscount">',
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
                
                
                
                '<tr>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Tax</div></td>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{taxTotal:usMoney}</div></td>',
                '</tr>',
                
                
                '<tr>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">Total</div></td>',
                    '<td class="' + tdCls + '"><div class="' + tdInnerCls + '">{total:usMoney}</div></td>',
                '</tr>',


                '</table>'
            ]
        });





        this.totalLabels = Ext.create('Ext.Component', {
            tpl: [
                '<div class="orderTotal-labels">',
                    '<div class="subTotalGroup">',
                    '<div class="subTotal">Subtotal:</div>',
                    '<tpl if="activeDiscountDescription!=\'\'">',
                        '<div class="orderLevelCoupon">Discount ({activeDiscountDescription})</div>',
                    '</tpl>',
                    '<tpl for="orderDiscounts">',
                        '<div class="orderCoupon">Discount ({description}):</div>',
                    '</tpl>',
                    '<tpl if="orderAdjustment.amount !== 0">',
                        '<div class="orderAdjustment">Order Adjustment</div>',
                    '</tpl>',
                '</div>',
                
                '<div class="shippingGroup">',
                    '<div class="shipping">Shipping ({shippingMethodName}):</div>',
                    '<tpl for="shippingDiscounts">',
                        '<div class="shippingCoupon">Shipping Discount ({description}):</div>',
                    '</tpl>',
                    '<tpl if="shippingAdjustment.amount !==0">',
                        '<div class="shippingAdjustment">Shipping Adjustment</div>',
                    '</tpl>',
                
                    // only show the shipping total if there is an adjustment or discount
                    '<tpl if="shippingAdjustment.amount !==0 || shippingDiscount">',
                        '<div class="shippingTotal">Shipping Total</div>',
                    '</tpl>',

                '</div>',
                
                '<div class="totalGroup">',
                    // todos: add tpl:if to filter out adjusments and adjusment total if there is none;
                    '<tpl if="adjustmentTotal">',
                        '<div class="adjustmentDescription">{adjustmentDescription}:</div>',
                    '</tpl>',
                    '<div class="tax">Tax:</div>',
                    '<div class="total">Total:</div>',
                    '</div>',
                '</div>'
            ],
            data: me.getData(),
            style: "text-align:right;",
            flex: 1
        });

        this.totalValues = Ext.create('Ext.Component', {
            data: me.getData(),
            tpl: [
                '<div class="orderTotal-values">',
                '<div class="subTotalGroup">',
                '<div class="subTotal">{subtotal:usMoney}</div>',
                /*
                '<tpl if="orderDiscountTotal">',
                    '<div class="discountTotalValue">{orderDiscountTotal:usMoney}</div>',
                '</tpl>',
                */
                '<tpl for="orderDiscounts">',
                    '<div class="discountTotalValue">{total:usMoney}</div>',
                '</tpl>',
                
                '<tpl if="orderAdjustment.amount !== 0">',
                    '<div class="orderAdjustmentValue">{orderAdjustment.amount:usMoney}</div>',
                '</tpl>',
                '</div>',
                '<div class="shippingGroup">',
                    '<div class="shipping">{shippingCost:usMoney}</div>',
                    '<tpl for="shippingDiscounts">',
                        '<div class="shippingCoupon">{total:usMoney}</div>',
                    '</tpl>',
                    '<tpl if="shippingAdjustment.amount !== 0">',
                        '<div class="shippingAdjustmentValue">{shippingAdjustment.amount:usMoney}</div>',
                    '</tpl>',
                
                    // only show the shipping total if there is an adjustment or discount
                    '<tpl if="shippingAdjustment.amount !==0 || shippingDiscount">',
                        '<div class="shipping">{shippingTotal:usMoney}</div>',
                    '</tpl>',

                '</div>',
                '<div class="totalGroup">',
                '<tpl if="adjustmentTotal">',
                '<div class="adjustmentTotal">{adjustmentTotal:usMoney}</div>',
                '</tpl>',
                '<div class="tax">{taxTotal:usMoney}</div>',
                '<div class="total">{total:usMoney}</div>',
                '</div>', 
                '</div>'
            ],
            width: me.getTotalColumnWidth()
        });

        this.items = [
            this.totalTable
            //this.totalLabels,
            //this.totalValues,
            //{
            //    xtype:"component",
            //    width: me.getActionColumnWidth()
            //}
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