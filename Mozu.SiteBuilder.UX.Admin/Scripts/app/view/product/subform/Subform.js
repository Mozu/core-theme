/**
 * @class Taco.view.product.subform.Subform
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Subform', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.view.product.subform.OverrideContainer'],

//    componentCls: Taco.baseCSSPrefix + 'formeditor ,
    bodyCls: [Taco.baseCSSPrefix + 'flexform ', Taco.baseCSSPrefix + 'product-admin-subform'],
    bodyStyle: {
        '-webkit-justify-content': 'flex-start'
    },

    allowOverrides: false,

    defaults: {
        xtype: 'textfield',
        // width: 400,
        labelAlign: 'top',
        labelSeparator: ''
    }
});