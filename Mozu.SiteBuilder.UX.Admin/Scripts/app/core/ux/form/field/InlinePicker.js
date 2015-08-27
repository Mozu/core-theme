/**
 * @class Taco.core.ux.form.field.InlinePicker
 * @author Jimmy Sanford
 */

Ext.define('Taco.core.ux.form.field.InlinePicker', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.taco-inlinepicker',

    defaultFieldConfig: {
        xtype: 'combobox',
        itemId: 'combo',
        componentCls: 'taco-form-inlinepicker-field',
        editable: true,
        forceSelection: true,
        hideTrigger: true,
        multiSelect: true,
        queryMode: 'local'
    },

    componentCls: 'taco-form-inlinepicker',

    initComponent: function () {
        var me = this;

        this.items = [this.getField()];

        this.callParent(arguments);

        this.mon(this.combo, {
            boxready: {
                scope: this,
                fn: function (cmp) { cmp.expand(); }
            }
        });
    },

    createField: function () {
        var combo,
            comboCfg;

        comboCfg = Ext.apply({
            collapse: Ext.emptyFn,
            triggerBlur: Ext.emptyFn,
            listConfig: {
                autoRender: this.getId(),
                componentCls: 'taco-form-inlinepicker-list',
                floating: false,
                hidden: false
            }
        }, this.fieldConfig, this.defaultFieldConfig);

        combo = this.combo = Ext.widget(comboCfg);

        return combo;
    },

    getField: function () {
        return this.combo || (this.combo = this.createField());
    }
});
