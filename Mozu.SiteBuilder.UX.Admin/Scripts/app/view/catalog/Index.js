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
                    listConfig: {
                        selModel: {
                            mode: 'SINGLE',
                            allowDeselect: true,
                            // patch doSelect method to use doMultiSelect if records is an empty array
                            // doSingleSelect cannot handle anything but a single unencapsulated record
                            doSelect: function (records, keepExisting, suppressEvent) {
                                var me = this,
                                    record;

                                if (me.locked || !me.store) {
                                    return;
                                }
                                if (typeof records === "number") {
                                    records = [me.store.getAt(records)];
                                }
                                if (me.selectionMode == "SINGLE" && !Ext.isEmpty(records)) {
                                    record = records.length ? records[0] : records;
                                    me.doSingleSelect(record, suppressEvent);
                                } else {
                                    me.doMultiSelect(records, keepExisting, suppressEvent);
                                }
                            }
                        }
                    },
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
                    listConfig: {
                        cls: Ext.baseCSSPrefix + 'boundlist-with-hidden-selections',
                        selModel: { mode: 'SIMPLE' }
                    },
                    onSelectChange: function (selModel, selections) {
                        var nextStep = panel.down('#step-2'),
                            records = selModel.getSelection();

                        if (!this.ignoreSelectChange) {
                            this.setValue(selections);
                            nextStep.show().getStore().loadData(records, false);
                        }
                    }
                }, {
                    xtype: 'multiselect',
                    itemId: 'step-2',
                    name: 'selections',
                    fieldLabel: 'Selections',
                    store: [],
                    ddReorder: true,
                    hidden: true,
                    width: 240,
                    margin: '0 40',
                    listConfig: {
                        selModel: { mode: 'MULTI' },
                        itemTpl: [
                            '<span class="x-boundlist-item-drag">Drag</span>',
                            '<span class="x-boundlist-item-content">{field1}</span>',
                            '<span class="x-boundlist-item-close">Close</span>'
                        ]
                    }
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