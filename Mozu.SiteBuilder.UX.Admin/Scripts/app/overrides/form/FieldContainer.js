Ext.define('Taco.overrides.form.FieldContainer', {
    override: 'Ext.form.FieldContainer',
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
