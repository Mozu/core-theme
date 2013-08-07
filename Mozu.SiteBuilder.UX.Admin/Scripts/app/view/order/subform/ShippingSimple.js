/**
 * @class Taco.view.order.subform.ShippingSimple
 */

Ext.define('Taco.view.order.subform.ShippingSimple', {
    extend: 'Taco.view.order.subform.Subform',

    title: 'Shipping',

    config: {
        record: null
    },

    initComponent: function () {

        this.callParent(arguments);

    }
});