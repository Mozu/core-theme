/**
 * @class Taco.view.product.subform.Subform
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Subform', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.view.product.subform.OverrideForm'],
    ui: 'subform',
    /*
    defaults: {
        xtype: 'textfield',
        labelAlign: 'top',
        labelSeparator: '',
        width: 250
    },
    */
    bodyPadding: '19 0',
    margin: '0 0 20 0',
    cascadeRecordLoad: false,
    initComponent:function() {
        this.callParent(arguments);
        if (this.readOnly != undefined) {
            this.setReadOnly(this.readOnly);
        }
    }
});