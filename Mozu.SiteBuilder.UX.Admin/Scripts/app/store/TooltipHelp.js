/**
* @class Taco.store.TooltipHelp
* Static Tooltips store until service can be made available.
*/
Ext.define('Taco.store.TooltipHelp', {
    extend: 'Ext.data.Store',
    fields: ['key', 'value'],    
    remoteSort: false,
    remoteFilter: false,    
    data: [
        {
            key: 'discount.general.create',
            value: 'This page is intended to show the default layout of the page before any field selections are made.\\n\\nIn reality, the Conditions and Limitations sections will not show up until selections are made.'
        }, {
            key: 'discount.general.scope',
            value: 'Line item: Applies a discount to individual items.<br/><br/>Order: Applies a discount to order subtotals.'
        }, {
            key: 'discount.general.amountType',
            value: 'Options vary by discount configuration.<br/><br/>Percentage: Take a percentage off the price<br/>Amount: Take an amount off the price<br/>Free: Give away a free item or shipping<br/>Fixed Price: Specify a discounted price that stays constant'
        }, {
            key: 'discount.conditions.minOrderAmount',
            value: 'Order subtotal (pre-discount) must meet or exceed the specified amount.'
        }, {
            key: 'discount.conditions.customerSegments',
            value: 'If specified, only customers within the segment(s) are eligible for the discount.'
        }, {
            key: 'discount.conditions.productsBox',
            value: 'Customer must purchase a minimum quantity of any of the specified items.'
        }, {
            key: 'discount.conditions.categoryBox',
            value: 'Customer must purchase a minimum quantity from any of the specified categories.'
        }, {
            key: 'discount.conditions.minimumCategorySubtotalBeforeDiscounts',
            value: 'Subtotal of all items from specified categories (pre-discount) must meet or exceed the specified amount.'
        }, {
            key: 'discount.criteria.appliesToSalePrice',
            value: 'When checked, the discount applies to the product\'s sale price, if it exists. When unchecked, either the discount applies to the product\'s base price or the sale price is honored (whichever is better for the customer).'
        }, {
            key: 'discount.limitations.maximumDiscountValuePerRedemption',
            value: 'A redemption occurs each time a discount is applied. If your discount is a buy one, get two free, each two free items is one redemption. This field limits the maximum combined value of the two free items.'
        }, {
            key: 'discount.limitations.maxRedemptionCount',
            value: 'Restrict the number of times this discount can be redeemed by all customers.'
        }

   ]
   
});