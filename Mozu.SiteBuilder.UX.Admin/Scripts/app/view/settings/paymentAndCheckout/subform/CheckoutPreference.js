/**
 * @class Taco.view.settings.paymentAndCheckout.subform.CheckoutPreference
 *
 */

Ext.define('Taco.view.settings.paymentAndCheckout.subform.CheckoutPreference', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.view.settings.paymentAndCheckout.Gateway'],
    title: 'Checkout Preference',
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
                      margin: '0 0 50 0',
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