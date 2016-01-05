Ext.define('Taco.overrides.form.FieldContainer', {
    override: 'Ext.form.FieldContainer',
    labelAlign: 'top',
    labelSeparator: '',
    msgTarget: 'under',
    listeners: {
        click: {
            element: 'el',
            fn: function (e) {
                if ((e.target.nodeName == 'INPUT' || e.target.nodeName == 'TEXTAREA') && e.target.previousSibling !== null) {
                    if (e.target.previousSibling.childNodes.length > 0) {
                        e.target.previousSibling.childNodes[0].className = e.target.previousSibling.childNodes[0].className + ' label-focused';
                    }
                }
            }
        },

        focusout: {
            element: 'el',
            fn: function (e) {
                if ((e.target.nodeName == 'INPUT' || e.target.nodeName == 'TEXTAREA') && e.target.previousSibling !== null) {
                    if (e.target.previousSibling !== 'undefined' && e.target.previousSibling.childNodes.length > 0) {
                        e.target.previousSibling.childNodes[0].className = e.target.previousSibling.childNodes[0].className.split(' label-focused')[0];
                    }
                }
            }
        },
    },
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
