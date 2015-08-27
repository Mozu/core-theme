/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.settings.shipping.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.settings.shipping.Form'
    ],
    formCls: 'Taco.view.settings.shipping.Form',
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },
    requiredStores: ['Taco.store.Countries']
});