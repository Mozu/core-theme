/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.discount.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.discount.Form'
    ],
    formCls: 'Taco.view.discount.Form'
});