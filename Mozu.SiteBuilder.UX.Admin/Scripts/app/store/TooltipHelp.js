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
            key: 'category.confirmDelete.deleteCategory',
            value: 'Subcategory will move one level up in the category tree.'
        }, {
            key: 'category.confirmDelete.deleteCategories',
            value: 'Subcategories will move one level up in the category tree.'
        }, {
            key: 'discount.general.scope',
            value: '<b>Line item:</b> Applies a discount to individual items.<br/><br/><b>Order:</b> Applies a discount to order subtotals.'
        }, {
            key: 'discount.general.amountType',
            value: 'Options vary by discount configuration.<br/><br/><b>Percentage:</b> Take a percentage off the price<br/><b>Amount:</b> Take an amount off the price<br/><b>Free:</b> Give away a free item or shipping<br/><b>Fixed Price:</b> Specify a discounted price that stays constant'
        }, {
            key: 'discount.conditions.minOrderAmount',
            value: 'Order subtotal (pre-discount) must meet or exceed the specified amount.'
        }, {
            key: 'discount.conditions.customerSegments',
            value: 'If specified, only customers within the segment(s) are eligible for the discount.'
        }, {
            key: 'discount.conditions.minimumQuantityRequiredProducts',
            value: 'Customer must purchase a minimum quantity of any of the specified items.'
        }, {
            key: 'discount.conditions.minimumQuantityProductsRequiredInCategories',
            value: 'Customer must purchase a minimum quantity from any of the specified categories.'
        }, {
            key: 'discount.conditions.minimumCategorySubtotalBeforeDiscounts',
            value: 'Subtotal of all items from specified categories (pre-discount) must meet or exceed the specified amount.'
        }, {
            key: 'discount.conditions.minimumLifetimeValueAmount',
            value: 'If specified, only customers whose lifetime value meets or exceeds this amount are eligible for the discount. '
        }, {
            key: 'discount.criteria.maximumQuantityPerRedemption',
            value: 'Choose the maximum quantity of products the customer will receive the discount on, per redemption. In a "Buy (n) of X, Get (m) of Y at discounted rate" scenario, this field specifies the quantity (m). Control other restrictions in "Discount Limitations" section.'
        }, {
            key: 'discount.criteria.appliesToSalePrice',
            value: 'When checked, the discount applies to the product\'s sale price, if it exists. When unchecked, either the discount applies to the product\'s base price or the sale price is honored (whichever is better for the customer).'
        }, {
            key: 'discount.criteria.applyToProductsWithSalePrice',
            value: 'If unchecked, items on sale will not be discounted.'
        }, {
            key: 'discount.criteria.scope',
            value: 'Choose what will be discounted.'
        }, {
            key: 'discount.criteria.excludeLineItemDiscounts',
            value: 'You can also use the "Restrict discounts on this product" setting on individual products to exclude them from discounts. '
        }, {
            key: 'discount.limitations.maximumDiscountValuePerRedemption',
            value: 'A redemption occurs each time a discount is applied. If your discount is a buy one, get two free, each two free items is one redemption. This field limits the maximum combined value of the two free items.'
        }, {
            key: 'discount.limitations.maxRedemptionCount',
            value: 'Restrict the number of times this discount can be redeemed by all customers.'
        }

   ]
   
});