/**
 * @class Taco.view.settings.paymentAndCheckout.subform.CheckoutPreference
 *
 */

Ext.define('Taco.view.settings.paymentAndCheckout.subform.CheckoutPreference', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.view.settings.paymentAndCheckout.Gateway'
    ],
    title: 'Checkout Preference',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",
    initComponent: function () {
        var me = this;

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };

        this.checkoutPrefrences = Ext.create('Ext.panel.Panel', {
            items: [
                {
                    xtype: 'radiogroup',
                    fieldLabel: 'Customer Checkout',
                    // Arrange radio buttons into two columns, distributed vertically
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Guest Checkout with optional sign in', name: 'customerCheckoutType', inputValue: 'LoginOptional' },
                        { boxLabel: 'Sign in required', name: 'customerCheckoutType', inputValue: 'LoginRequired' }

                    ]
                },
                  {
                      xtype: 'radiogroup',
                      fieldLabel: 'Request customer email address for marketing purposes',
                      // Arrange radio buttons into two columns, distributed vertically
                      columns: 1,
                      vertical: true,
                      items: [
                          { boxLabel: 'Checked (Yes) by default', name: 'kk', inputValue: 'LoginOptional' },
                          { boxLabel: 'Unchecked (No) by default', name: 'kk', inputValue: 'LoginRequired' },
                          { boxLabel: 'Disable and hide option', name: 'kk', inputValue: 'LoginRequired' }

                      ]
                  }
            ]
        });

        this.items = [this.checkoutPrefrences];

        this.callParent(arguments);
    }
});