/**
 * @class Taco.core.ux.form.TextField
 * @author Travis Johnson
 * Adds some small extensions to the default TextField
 */

Ext.define('Taco.core.ux.form.TextField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.taco.textfield',

    constructor: function () {
        var me = this;
        this.callParent(arguments);
        this.addEvents('aftersetvalue');
        me.on({
            scope: me,
            focus: me.onTextFieldFocus
        });
        me.on({
            scope: me,
            blur: me.onTextFieldBlur
        });
    },

    setValue: function (val) {
        var result = this.callParent(arguments);

        if (val) {
            Ext.defer(function () {
                this.fireEvent('aftersetvalue', this, val);
            }, 1, this);
        }

        return result;
    },

    onTextFieldFocus: function(evt) {
        this.addCls('taco-label-focus');
    },

    onTextFieldBlur: function(evt) {
        this.removeCls('taco-label-focus');
    }
});