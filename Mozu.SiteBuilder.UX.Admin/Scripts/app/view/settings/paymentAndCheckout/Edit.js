/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.settings.paymentAndCheckout.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.settings.paymentAndCheckout.Form'
    ],
    formCls: 'Taco.view.settings.paymentAndCheckout.Form',
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    }
});