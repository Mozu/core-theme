/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.form.Form', 'Ext.ux.form.MultiSelect', 'Ext.ux.form.ItemSelector'],

    header: {
        title: 'Product Type Testing'
    },

    initComponent: function () {
        var me = this,
            store, panel;

        store = Ext.create(Ext.data.ArrayStore, {
            fields: [
                { name: 'attribute', type: 'string' },
                { name: 'values', type: 'auto' }
            ],
            data: [
                ['color', ['blue', 'gray', 'red', 'black', 'white', 'checkered', 'plaid', 'yellow']],
                ['size', ['small', 'medium', 'large']],
                ['material', ['cotton', 'poly/cotton blend', 'rayon']]
            ]
        });

        panel = Ext.create('Taco.core.ux.form.Form', {
            items: [{
                xtype: 'formflexbox',
                justify: false,
                defaults: {
                    labelAlign: 'top',
                    labelSeparator: ''
                },
                items: [{
                    xtype: 'multiselect',
                    itemId: 'step-0',
                    name: 'attribute',
                    fieldLabel: 'Attribute',
                    store: store,
                    width: 240,
                    margin: '0 40',
                    displayField: 'attribute',
                    valueField: 'attribute',
                    maxSelections: 1,
                    listConfig: { multiSelect: false },
                    onSelectChange: function (selModel, selections) {
                        var nextStep = panel.down('#step-1'),
                            values = selections.map(function (record) { return record.get('values'); });

                        if (!this.ignoreSelectChange) {
                            this.setValue(selections);
                            nextStep.show().bindStore(values[0], true);
                        }
                    }
                }, {
                    xtype: 'multiselect',
                    itemId: 'step-1',
                    name: 'values',
                    fieldLabel: 'Values',
                    store: [],
                    hidden: true,
                    width: 240,
                    margin: '0 40',
                    maxSelections: 1,
                    listConfig: { multiSelect: false }
                }]
            }]
        });

        Ext.apply(me.body, {
            layout: 'fit',
            items: [panel]
        });

        this.callParent(arguments);

        store.load();
    }
});