/**
 * @class Taco.view.order.Header
 */
Ext.define('Taco.view.order.subform.Payment', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [],

    title: 'Payment',

    initComponent: function () {
        this.tools = [{
            xtype: 'button',
            text: 'menu',
            menu: {
                plain: true,
                items: [{
                    text: 'Void and Reauthorize'
                }, {
                    text: 'Add Payment'
                }]
            }
        }];

        this.items = [{
            xtype: 'component',
            html: 'hello world'
        }];

        this.callParent(arguments);
    }
});