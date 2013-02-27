/**
 * @class Taco.view.product.subform.Subform
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Subform', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.view.product.subform.OverrideForm'],

    bodyCls: [Taco.baseCSSPrefix + 'flexform ', Taco.baseCSSPrefix + 'product-admin-subform'],
    bodyStyle: {
        '-webkit-justify-content': 'flex-start'
    },
    cascadeRecordLoad: false,

    defaults: {
        xtype: 'textfield',
        labelAlign: 'top',
        labelSeparator: '',
        width: 250
    },
    initComponent:function() {
        this.callParent(arguments);
        if (this.readonly != undefined) {
            this.setReadOnly(this.readonly);
        }
    }
});