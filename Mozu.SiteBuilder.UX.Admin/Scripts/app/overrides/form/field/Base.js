Ext.define('Taco.overrides.form.field.Base', {
    override: 'Ext.form.field.Base',

    labelAlign: 'top',
    labelSeparator: '',
    msgTarget: 'under',

    initComponent: function () {
        if (this.allowBlank === false) {
            this.labelClsExtra = 'x-form-item-required';
        }

        this.callParent(arguments);
    }
});
