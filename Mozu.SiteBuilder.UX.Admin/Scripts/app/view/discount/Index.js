/**
* The Discount list (grid) view
*/

Ext.define('Taco.view.discount.Index', {
    extend: 'Taco.view.react.Index',
    alias: 'widget.discountlist',
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    }//,
    //stateful:true,
    //stateId: 'statefulDiscountGrid'
});
