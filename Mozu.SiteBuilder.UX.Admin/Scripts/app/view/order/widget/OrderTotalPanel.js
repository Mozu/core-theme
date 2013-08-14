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
        actionColumnWidth: 0
    },
    
    initComponent: function(eOpts) {
        var me = this;
        me.cls = 'orderform-detail-totalRow x-grid-row';

        

        this.totalLabels = Ext.create('Ext.Component', {
            tpl: [
                '<div class="orderTotal-labels">',
                    '<div class="subTotalGroup">',
                    '<div class="subTotal">Subtotal:</div>',
                    '<tpl if="activeDiscountDescription!=\'\'">',
                        '<div class="orderLevelCoupon">Discount ({activeDiscountDescription})</div>',
                    '</tpl>',
                    '<tpl if="orderAdjustment.amount !== 0">',
                        '<div class="orderAdjustment">Order Adjustment</div>',
                    '</tpl>',
                '</div>',
                
                '<div class="shippingGroup">',
                    '<div class="shipping">Shipping ({shippingMethodName}):</div>',
                    '<tpl if="shippingDiscount">',
                        '<div class="shippingCoupon">{shippingDiscountDescription}:</div>',
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
                '<tpl if="orderDiscountTotal">',
                    '<div class="discountTotalValue">{orderDiscountTotal:usMoney}</div>',
                '</tpl>',
                '<tpl if="orderAdjustment.amount !== 0">',
                    '<div class="orderAdjustmentValue">{orderAdjustment.amount:usMoney}</div>',
                '</tpl>',
                '</div>',
                '<div class="shippingGroup">',
                    '<div class="shipping">{shippingCost:usMoney}</div>',
                    '<tpl if="shippingDiscount">',
                        '<div class="shippingCoupon">{shippingDiscount:usMoney}</div>',
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
            this.totalLabels,
            this.totalValues,
            {
                xtype:"component",
                width: me.getActionColumnWidth()
            }
        ];
        
        me.callParent(arguments);
    },
    
    // when the data gets updated apply the new data to the two subComponents;
    updateData: function (newValue, oldValue) {
        var me = this;
        if (newValue) {
            this.totalLabels.update(newValue);
            this.totalValues.update(newValue);
        }
    },
    
    /**
     * Do any class level cleanup. Destroy and null any scoped refs.     
     */
    onDestroy : function() {
        this.callParent(arguments);
    }
});