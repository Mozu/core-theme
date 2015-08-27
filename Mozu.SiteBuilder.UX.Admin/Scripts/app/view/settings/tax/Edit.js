/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.settings.tax.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.settings.tax.Form'
    ],
    formCls: 'Taco.view.settings.tax.Form',
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    }
});