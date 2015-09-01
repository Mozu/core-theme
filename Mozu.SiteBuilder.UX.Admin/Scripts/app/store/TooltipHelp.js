/**
* @class Taco.store.TooltipHelp
* Static Tooltips store until service can be made available.
* Note:  Any anchor tags that are part of the tooltip content need to have the css class of "taco-help-link" otherwise the tooltip logic will supress the click and close the tip.
*/
Ext.define('Taco.store.TooltipHelp', {
    extend: 'Ext.data.Store',
    fields: ['key', 'value'],    
    remoteSort: false,
    remoteFilter: false,    
    data: [
        {
            key: 'category.productMembership',
            value: 'The Product Membership field controls the dynamic category type and its behaviors. Select Precomputed if you want the category to be available as a discount target. Select Realtime if you don\'t plan on targeting this category in discounts and your expression needs to reference precomputed dynamic categories, post-discount pricing information, or sale types. <a target="_blank" class="taco-help-link" href=\'https://mozu.com/docs/admin/help/Catalog/Dynamic_Category_Expressions.htm\'>Learn more</a>'
        },
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
            key: 'discount.conditions.includedPaymentMethodField',
            value: 'Requires shoppers to check out with the specified payment method in order for the discount to apply. You can only select payment methods that are enabled in the Payment & Checkout settings.'
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
            key: 'discount.criteria.includedCategoriesOperatorCheckbox',
            value: 'When this option is checked, only products that are common to all listed categories are eligible for the discount. When this option is unchecked, products that belong to any of the selected categories are eligible for the discount.'
        }, {
            key: 'discount.criteria.excludeLineItemDiscounts',
            value: 'You can also use the "Restrict discounts on this product" setting on individual products to exclude them from discounts. '
        }, {
            key: 'discount.limitations.maximumDiscountValuePerRedemption',
            value: 'A redemption occurs each time a discount is applied. If your discount is a buy one, get two free, each two free items is one redemption. This field limits the maximum combined value of the two free items.'
        }, {
            key: 'discount.limitations.maxRedemptionCount',
            value: 'Restrict the number of times this discount can be redeemed by all customers.'
        }, {
            key: 'discount.limitation.oneTimeUsePerShopper',
            value: 'When checked, shoppers must be logged into a storefront account<br/>in order for both the discount and restriction to apply.'
        }, {
            key: 'publishset.publishsetdate',
            value: 'Publish Date is inherited from the<br/> Publish Set, and designates the<br/> date and time when all drafts in<br/> Publish Set publish.'
        }, {
            key: 'couponSet.generatedCode.prefix',
            value: 'The Code Prefix field specifies the prefix of all generated<br/>coupon codes within the coupon set.  This coupon prefix<br/>should be unique to the coupon set.  You can either specify<br/>a custom prefix or have Mozu suggest one.'
        }, {
            key: 'settings.publishing.liveEdit',
            value: 'Enables Live Edit of Products through the Mozu API.'
        }, {
            key: 'product.general.dateFirstAvailable',
            value: 'This field specifies the intended date when the product either first becomes or became available. Use this field to reference the product in an expression that uses the Days Available in Catalog entity. Setting this field to a future date doesn’t automatically publish the product live on that date.'
        }
   ]
   
});