/**
 * @class Taco.core.ux.form.PhoneNumberField
 * Input field for phone numbers.
 */

Ext.define('Taco.core.ux.form.PhoneNumberField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.phonefield',
    cls: Taco.baseCSSPrefix + 'phonefield',
    formatNumber : false,
    listeners: {
        blur: function (field) {
            if (!this.formatNumber)
                return;
            var number = field.value;
            if (number === '')
                return;
            Ext.Ajax.request({
                url: '/admin/app/address/validatephone/',
                method: 'GET',
                params: { number: number },
                success: function (resp) {
                    var obj = Ext.JSON.decode(resp.responseText);
                    if (obj && obj.items && obj.items.valid) {
                        field.setRawValue(obj.items.e164);
                    }
                },
                failure: function () {
                    //
                },
                scope: this
            });
        }
    }
});