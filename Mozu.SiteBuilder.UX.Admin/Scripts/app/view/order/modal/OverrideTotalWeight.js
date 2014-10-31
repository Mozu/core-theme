/**
 * @class Taco.view.order.modal.OverrideTotalWeight
 */

Ext.define('Taco.view.order.modal.OverrideTotalWeight', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    scale: 'small',
    title: 'Override weight',

    initComponent: function () {
        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'hbox'
            },
            defaults: {
                flex: 1
            },
            items: [{
                xtype: 'numberfield',
                name: 'weight',
                allowDecimals: true,
                allowExponential: false,
                hideTrigger: true,
                minValue: 0.0001,
                decimalPrecision: 4,
                fieldLabel: 'Weight',
                value: this.record.weight
            }]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    doSave: function () {
        var me = this,
            formValues = this.form.getValues(),
            data;

        data = {
            weight: formValues.weight
        };

        me.down('#primaryAction').hide();
        me.saveSuccess(data);
    }
});
