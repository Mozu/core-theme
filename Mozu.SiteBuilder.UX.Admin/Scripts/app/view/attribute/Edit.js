/**
 * @class  Taco.view.attribute.Edit
 * @author  Travis Johnson
 */

Ext.define('Taco.view.attribute.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.attribute.Form'
    ],
    formCls: 'Taco.view.attribute.Form',

});