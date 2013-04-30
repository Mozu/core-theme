/**
 * @class Taco.view.product.subform.Subform
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Subform', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.view.product.subform.OverrideForm'],

    bodyCls: Taco.baseCSSPrefix + 'product-admin-subform',
    cls: Taco.baseCSSPrefix + 'form-section',
    defaults: {
        xtype: 'textfield',
        labelAlign: 'top',
        labelSeparator: '',
        width: 250
    },

    cascadeRecordLoad: false,

    initComponent:function() {
        this.callParent(arguments);
        if (this.readOnly != undefined) {
            this.setReadOnly(this.readOnly);
        }
    }
});