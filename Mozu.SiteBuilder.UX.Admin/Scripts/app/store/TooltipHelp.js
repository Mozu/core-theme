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
            key: 'shipping.enableForReturns',
            value: '<p>Checking this box sets this shipping method as the method to use for all returns.</p><p>There can be only 1 shipping method enabled for returns.</p><p>Enabling this shipping method for returns will disable this setting on any other shipping method</p>'
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
            value: 'Options vary by discount configuration.<br/><br/><b>Percentage:</b> Take a percentage off the price<br/><b>Amount:</b> Take an amount off the price<br/><b>Free:</b> Give away a free item or shipping<br/><b>Fixed Price:</b> Specify a discounted price that stays constant<br/><b>Auto Add Free Product:</b> Get a free product auto added to cart'
        }, {
            key: 'discount.general.stackable',
            value: 'If enabled, This discounts will allow discounts in the following layer to be stacked on top.'
        }, {
            key: 'discount.general.layerInput',
            value: 'Each Discount can be assigned to a layer which is then used to determine the order of application. Discounts in the same layer will compete and provide the best value for the shopper.'
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
            key: 'discount.criteria.applyDiscountToHighestPricedProduct',
            value: 'Checking this option applies the discount to the highest-priced qualifying items first (benefitting the shopper).'
        }, {
            key: 'discount.criteria.applyDiscountToHighestPricedShipping',
            value: 'Checking this option applies the discount to the highest-priced shipping cost for qualifying items first (benefitting the shopper).'
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
            key: 'discount.criteria.excludeProductsInPriceLists',
            value: 'Excludes products from applying this discount in the selected Price Lists.'
        }, {
            key: 'discount.criteria.applicablePriceLists',
            value: 'The discount applies to products that are priced by the specified price lists or their children, if applicable and all products that do not have a price list entry.'
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
            value: Localizer.langResources.SHARED.publish_tooltip1 + '<br/> ' + Localizer.langResources.SHARED.publish_tooltip2 + '<br/> ' + Localizer.langResources.SHARED.publish_tooltip3 + '<br/> ' + Localizer.langResources.SHARED.publish_tooltip4
        }, {
            key: 'couponSet.generatedCode.prefix',
            value: 'The Code Prefix field specifies the prefix of all generated<br/>coupon codes within the coupon set.  This coupon prefix<br/>should be unique to the coupon set.  You can either specify<br/>a custom prefix or have Mozu suggest one.'
        }, {
            key: 'settings.publishing.liveEdit',
            value: 'Enables Live Edit of Products through the Mozu API.'
        }, {
            key: 'settings.general.customCdn',
            value: 'Please contact Mozu Support or your Solution Partner to enable this feature.'
        }, {
            key: 'settings.general.bustCdnCache',
            value: 'This feature requires an update to your theme.<br><br><a href="' + Taco.neWadminHelpLink + '" target="_blank" class="taco-help-link">See Enabling the Bust Cache Feature in Mozu Help.</a>'
        }, {
            key: 'settings.general.missingImage',
            value: 'Upload or select an image: This will be used as a replacement for all missing images on your storefront'
        }, {
            key: 'product.images.useProductImageGroups',
            value: 'Placeholder'
        }, {
            key: 'product.images.productSlicing',
            value: 'Product slicing will enable you to break a product down to its individual variations. For example, a shirt that is offered in 10 colors can now be split up into 10 different products. See Slicing Documentation for more details.'
        }, {
            key: 'product.general.dateFirstAvailable',
            value: 'This field specifies the intended date when the product either first becomes or became available. Use this field to reference the product in an expression that uses the Days Available in Catalog entity. Setting this field to a future date doesn’t automatically publish the product live on that date.'
        }, {
            key: 'product.categories.primaryCategory',
            value: 'Specifies which static category to use in the navigation breadcrumb, regardless of how shoppers navigate to the product. If not set, or if the product belongs only to dynamic categories, the default is to use the category with the smallest ID.'
        }, {
            key: 'productRanking.form.context.header',
            value: '<ul>The context specifies when the product ranking rule triggers.<li>Specify a <b>search keyword</b>, the rule triggers when a shopper searches for the keyword.</li><li>Specify a <b>category</b>, the rule triggers when a shopper navigates to that category page.</li><li>Specify both a <b>search keyword</b> and <b>category</b>, the rule triggers when a shopper searches for the keyword within the category.</li></ul>'
        }, {
            key: 'productRanking.form.pinnedProduct.header',
            value: 'Only promoted products that are in the category/search results will appear.'
        }, {
            key: 'attribute.form.searchOptions',
            value: 'This determines whether the value(s) of this attribute is matched on when shoppers perform a search on the site.'
        }, {
            key: 'attribute.form.filterandsorting',
            value: 'This determines whether this attribute is available for filtering, sorting, dynamic category expressions, and as a facet in search results and on category pages.'
        }, {
            key: 'producttype.attribute.form.displaygroup',
            value: '<dl><dt><b>Storefront Details and Listings</b></dt><dd>The property is available on storefront product listing pages like categories and search results.</dd><dt><b>Storefront Details</b></dt><dd>The property is available only when displaying product details on the storefront.</dd><dt><b>Admin Only</b></dt><dd>The property is managed only within Mozu Admin and is not visible in the storefront.</dd></dl>'
        }, {
            key: 'priceLists.general.exclusive',
            value: 'Exclusive price lists restrict the storefront\'s product availability to only products included in the price list and its parents if applicable.'
        }, {
            key: 'priceLists.general.resolvable',
            value: 'By default, all price lists can be picked as being directly applicable to a customer. To improve performance, disable this setting if the price list is only meant to be a parent for others and will not be chosen for a customer directly. Refer to Mozu Docs for more info.'
        }, {
            key: 'priceLists.resolution.default',
            value: 'Scope determines on which sites the price list can apply to applicable customers. When the resolution logic does not resolve to a valid price list for a customer, the default price list will be in effect.'
        }, {
            key: 'priceLists.resolution.rank',
            value: 'Mozu uses rank to break ties when multiple price lists are valid at the same time. Lower numbers equal higher priority (1 wins over 2).'
        }, {
            key: 'purchaseOrder.siteSettings.splitPayment',
            value: 'Allows a credit card to be used as a supplemental payment method when the order total exceeds the available purchase order balance.'
        }, {
            key: 'purchaseOrder.siteSettings.customFields',
            value: 'Use custom fields to capture additional information from the shopper on the checkout page when purchase order is used as the payment method. The label entered below will be the label for the text fields displayed on the storefront and admin.'
        },{
            key: 'thirdPartyPayment.processingGateway',
            value: 'Payment Gateway that is used to process Digital Wallet payments.'
        },
         {
            key: 'default',
            value: 'Default Tooltip'
        }
   ]
});