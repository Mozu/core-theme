/**
 * @class Taco.core.ux.form.TextField
 * @author Travis Johnson
 * Adds some small extensions to the default TextField
 */


Ext.define('Taco.core.ux.form.TextField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.taco.textfield',

    constructor: function () {
        this.callParent(arguments);
        this.addEvents('aftersetvalue');
    },

    setValue: function (val) {
        var result = this.callParent(arguments);

        if (val) {
            Ext.defer(function () {
                this.fireEvent('aftersetvalue', this, val);
            }, 1, this);
        }

        return result;
    }
})