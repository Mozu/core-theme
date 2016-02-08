/**
* The Discount list (grid) view
*/

Ext.define('Taco.view.discount.Index', {
    extend: 'Taco.view.discount.Grid',
    alias: 'widget.discountlist',
    stateful:true,
    stateId: 'statefulDiscountGrid'
});
