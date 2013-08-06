
/**
 * @class Taco.view.order.subform.Customer
 */

Ext.define('Taco.view.order.subform.Customer', {
    extend: 'Taco.view.order.subform.Subform',


    title: 'Customer',

    config: {
        record: null,
    },

    initComponent: function () {

        this.callParent(arguments);
    }

});