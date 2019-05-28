/**
* The Discount list (grid) view
*/

Ext.define('Taco.view.discount.Index', {
    extend: 'Taco.view.react.Index',
    alias: 'widget.discountlist',
    contextConfig: {
        supportedLevels: ['s', 'c'],
        requiresContextOfType: ['s']
    },
    initComponent: function () {
        this.callParent(arguments);
    }
});
