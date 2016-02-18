/**
 * @class Taco.view.priceList.widget.OverrideCurrency
 * Numeric input field for currencies with a checkbox to show active state
 */
 Ext.define('Taco.view.priceList.widget.OverrideField', {
    extend: 'Ext.container.Container',
    requires: [
        'Taco.core.ux.form.CurrencyField'
    ],
    alias: 'widget.overridefield',
    cls: Taco.baseCSSPrefix + 'overridefield',
    layout: {
        type: 'hbox',
        align: 'top'
    },
    afterChange: Ext.emptyFn,
    initComponent: function() {
        var me = this;

        var fieldCfg = {};

        Ext.apply(fieldCfg, me.fieldCfg, {
            xtype: 'currencyfield',
            name: me.name,
            itemId: me.itemId,
            allowBlank: true,
            hideTrigger: true,
            margin: '0 30 0 0',
            required: false,
            emptyText: 'Default',
            fieldStyle: 'text-align: right',
            listeners: {
                change: function (cmp, newVal, oldVal, eOpts) {
                    if (newVal && !oldVal) {
                        me.override.setValue(true);
                    }
                },
                scope: me
            }
        });

        me.currencyField = Ext.widget(fieldCfg);

        me.override = Ext.widget('checkbox', {
            margin: '25 30 0 0',
            tabIndex: -1,
            name: fieldCfg.name + 'Mode',
            listeners: {
                change: function(cmp, newVal, oldVal) {
                    if (oldVal && !newVal) {
                        me.currencyField.setValue(null);
                    }
                },
                scope: me
            }
        });

        me.items = [me.override, me.currencyField];

        me.callParent(arguments);
    }
 });