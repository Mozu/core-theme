/**
 * @class Taco.view.priceList.widget.OverrideField
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
    fieldCfg: {},
    checkboxFcg: {},
    originalEmptyText: 'Default',
    afterChange: Ext.emptyFn,
    initComponent: function() {
        var me = this;

        var checkboxCfg = {};

        Ext.apply(checkboxCfg, me.checkboxCfg, {
            margin: '25 30 0 0',
            tabIndex: -1,
            name: me.fieldCfg.name + 'Mode',
            listeners: {
                change: function(cmp, newVal, oldVal) {
                    var field = me.overrideField;
                    if (!field) return;

                    field.allowBlank = !(me.requireOverrideValue && this.isOverridden());

                    if (this.isOverridden()) {
                        this.originalEmptyText = field.emptyText;
                        Ext.apply(field, { emptyText: ' ' });
                        //the field.applyEmptyText method checks for a truthy value assigned to emptyText so a empty string will not work
                    }
                    else {
                        field.setValue(null);
                        field.clearInvalid();
                        Ext.apply(field, { emptyText: this.originalEmptyText });
                    }

                    field.applyEmptyText();

                    if (!field.getValue() && !me.overrideField.allowBlank) {
                        me.overrideField.markInvalid(['This field is required'])
                    }
                },
                scope: me
            },
            getValue: function() {
                return this.checked ? 'Overridden' : 'UseCatalog';
            }
        });

        me.override = Ext.widget('checkbox', checkboxCfg);

        var fieldCfg = {};

        Ext.apply(fieldCfg, me.fieldCfg, {
            xtype: 'currencyfield',
            name: me.name,
            itemId: me.itemId,
            allowBlank: !(me.requireOverrideValue && me.override.getValue()),
            hideTrigger: true,
            margin: '0 30 0 0',
            required: false,
            minValue: 0,
            emptyText: me.originalEmptyText,
            fieldStyle: 'text-align: right',
            listeners: {
                change: function (cmp, newVal, oldVal, eOpts) {
                    if ((newVal === 0 || newVal) && !oldVal) {
                        me.override.setValue(true);
                    }
                },
                scope: me
            }
        });

        me.overrideField = Ext.widget(fieldCfg);

        me.items = [me.override, me.overrideField];

        me.callParent(arguments);
    },
    isOverridden: function() {
        return this.override.getValue() === 'Overridden';
    },
    getStatus: function() {
        return this.isOverridden ? 'Overridden' : 'UseCatalog';
    }
 });