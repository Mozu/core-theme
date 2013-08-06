/**
 * @class Taco.view.order.Edit
 */


Ext.define('Taco.view.order.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.order.Form'
    ],
    formCls: 'Taco.view.order.Form'
})