/**
 * @class Taco.view.settings.paymentAndCheckout.subform.LegalInformation
 *
 */

Ext.define('Taco.view.settings.paymentAndCheckout.subform.LegalInformation', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.view.settings.paymentAndCheckout.Gateway'],
    title: 'Legal Information',
    initComponent: function () {
        var me = this;

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };

        this.legalInformation = Ext.create('Ext.panel.Panel', {
            items: [
                {
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Display links on checkout',
                    // Arrange checkboxes into two columns, distributed vertically
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Terms', name: 'rb', inputValue: '1' },
                        { boxLabel: 'Privacy Policy', name: 'rb', inputValue: '2' },
                        { boxLabel: 'Return Policy', name: 'rb', inputValue: '3' }
                    ]
                },
                {
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Send in email order notiﬁcation',
                    // Arrange checkboxes into two columns, distributed vertically
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Terms', name: 'rb', inputValue: '1' },
                        { boxLabel: 'Privacy Policy', name: 'rb', inputValue: '2' },
                        { boxLabel: 'Return Policy', name: 'rb', inputValue: '3' }
                    ]
                },
                {
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Print on packing slip',
                    margin: '0 0 50 0',
                    // Arrange checkboxes into two columns, distributed vertically
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Terms', name: 'rb', inputValue: '1' },
                        { boxLabel: 'Privacy Policy', name: 'rb', inputValue: '2' },
                        { boxLabel: 'Return Policy', name: 'rb', inputValue: '3' }
                    ]
                }
            ]

        });

        this.items = [this.legalInformation];

        this.callParent(arguments);
    }
});