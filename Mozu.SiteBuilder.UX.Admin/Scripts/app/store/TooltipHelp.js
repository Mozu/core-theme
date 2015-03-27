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
        },
        {
            key: 'discount.general.scope',
            value: 'Line item: Applies a discount to individual items.<br/><br/>Order: Applies a discount to order subtotals.'
        }
   ]
   
});