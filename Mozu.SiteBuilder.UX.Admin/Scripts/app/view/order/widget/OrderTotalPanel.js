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
        data: {},
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
        this.items = [
            {
                tpl: [
                    '<div class="orderTotal-labels">',
                    '<div class="subTotalGroup">',
                    '<div class="subTotal">Subtotal:</div>',
                    '<tpl if="orderDiscountDescription!=\'\'">',
                    '<div class="orderLevelCoupon">Discount ({orderDiscountDescription})</div>',
                    '</tpl>',
                    '</div>',
                    '<div class="shippingGroup">',
                    '<div class="shipping">Shipping ({shippingMethodName}):</div>',
                    '<tpl if="shippingDiscount">',
                    '<div class="shippingCoupon">{shippingDiscountDescription}:</div>',
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
            }, {
                data: me.getData(),
                tpl: [
                    '<div class="orderTotal-values">',
                    '<div class="subTotalGroup">',
                    '<div class="subTotal">{subtotal:usMoney}</div>',
                    '<tpl if="orderDiscountTotal">',
                    '<div class="discountTotalValue">{orderDiscountTotal:usMoney}</div>',
                    '</tpl>',
                    '</div>',
                    '<div class="shippingGroup">',
                    '<div class="shipping">{shippingTotal:usMoney}</div>',
                    '<tpl if="shippingDiscount">',
                    '<div class="shippingCoupon">{shippingDiscount:usMoney}</div>',
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
            }, {
                width: me.getActionColumnWidth()
            }
        ];
        
        me.callParent(arguments);
    },
    
    /**
     * Do any class level cleanup. Destroy and null any scoped refs.     
     */
    onDestroy : function() {
        this.callParent(arguments);
    }
});