Ext.define('Taco.overrides.form.FieldContainer', {
    override: 'Ext.form.FieldContainer',
    labelAlign: 'top',
    labelSeparator: '',
    msgTarget: 'under',
    initComponent: function () {
        this.setAllowBlank(this.allowBlank);
        this.callParent(arguments);
    },
    setAllowBlank: function (allowBlank) {
        var requiredCls = "x-form-item-required"
        this.allowBlank = (allowBlank);
        if (this.rendered) {
            var labelEl = this.labelEl;
            if (labelEl) {
                // need to find the label and add/remove the css cls
                if (allowBlank === false) {
                    //   this.labelClsExtra = 'x-form-item-required';
                    labelEl.addCls(requiredCls)
                } else {
                    labelEl.removeCls(requiredCls)
                }
            }
        } else {
            if (allowBlank === false) {
                this.labelClsExtra = requiredCls;
            }
        }
    }
});
