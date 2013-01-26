/**
 * @class Taco.view.product.subform.Subform
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Subform', {
    extend: 'Taco.core.ux.form.Form',

//    componentCls: Taco.baseCSSPrefix + 'formeditor ,
    bodyCls: [Taco.baseCSSPrefix + 'flexform ', Taco.baseCSSPrefix + 'product-admin-subform'],
    bodyStyle: {
        '-webkit-justify-content': 'flex-start'
    },

    defaults: {
        xtype: 'textfield',
        // width: 400,
        labelAlign: 'top',
        labelSeparator: ''
    }
});