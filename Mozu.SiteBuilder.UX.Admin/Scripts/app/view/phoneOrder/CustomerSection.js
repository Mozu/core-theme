/**
 * @class Taco.view.phoneOrder.CustomerSection
 * @author Michael Speed Elder
 */
Ext.define('Taco.view.phoneOrder.CustomerSection', {
    extend: 'Taco.core.ux.form.Form',

    bodyCls: Taco.baseCSSPrefix + 'flexform',
    title: 'Customer',

    initComponent: function () {
        var me = this;

        this.items = [{
            xtype: 'radiogroup',
            columns: 1,
            vertical: true,
            items: [
                { boxLabel: 'Existing', name: 'customerStatus', inputValue: 0 },
                { boxLabel: 'New', name: 'customerStatus', inputValue: 1 }
            ]
        }];

        this.callParent(arguments);
    }
});