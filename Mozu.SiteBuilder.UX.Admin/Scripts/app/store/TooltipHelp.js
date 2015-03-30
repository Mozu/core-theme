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
        },

        {
            key: 'discount.conditions.minOrderAmount',
            value: 'Order subtotal (pre-discount) must meet or exceed the specified amount.'
        }

   ]
   
});