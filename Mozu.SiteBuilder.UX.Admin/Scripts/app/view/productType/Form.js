/**
 * @class Taco.view.productType.Form
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.productType.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.core.ux.form.field.MultiSelect', 'Taco.core.ux.BoxReorderer', 'Taco.model.ProductTypeAttribute'],

    title: 'Product Type',

    attributeItemTpl: [
        '<tpl for=".">',
            '<span class="', Taco.baseCSSPrefix, 'draghandle"></span>',
            '<span class="', Taco.baseCSSPrefix, 'attribute-item-header-text">{attributeFQN}</span>',
        '</tpl>'
    ],

    initComponent: function () {
        var options = this.record.get('options'),
            extras = this.record.get('extras'),
            properties = this.record.get('properties');

        console.log(this.record.data);

        this.defaults = {
            xtype: 'panel',
            cls: Taco.baseCSSPrefix + 'producttype-attribute-panel',
            margin: '0 0 21',
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
        };
        this.items = [{
            itemId: 'options',
            header: {
                title: 'Options',
                margin: '0 0 7',
            },
            plugins: Ext.create('Taco.core.ux.BoxReorderer', {
                listeners: {
                    drop: this.onDrop,
                    scope: this
                }
            })
        }, {
            itemId: 'extras',
            header: {
                title: 'Extras',
                margin: '0 0 7',
            }
        }, {
            itemId: 'properties',
            header: {
                title: 'Properties',
                margin: '0 0 7',
            }
        }];

        this.callParent(arguments);

        Ext.Array.each(['options', 'extras', 'properties'], this.addAttribute, this);
    },

    addAttribute: function (attributeType) {
        var data = this.record.get(attributeType),
            panel = this.items.get(attributeType),
            tpl = this.attributeItemTpl,
            additions = [];

        Ext.Array.each(data, function (attribute) {
            additions.push({
                xtype: 'container',
                attribute: attribute,
                reorderable: true,
                cls: Taco.baseCSSPrefix + 'attribute-item',
                items: [{
                    xtype: 'container',
                    itemId: 'header',
                    cls: Taco.baseCSSPrefix + 'attribute-item-header',
                    layout: {
                        type: 'hbox',
                        align: 'middle'
                    },
                    items: [{
                        xtype: 'component',
                        flex: 1,
                        data: attribute,
                        tpl: tpl
                    }, {
                        xtype: 'button',
                        text: 'Delete',
                        width: 64,
                        height: 24,
                        margin: '0 7 0 0',
                        handler: function () { console.log('delete clicked', attribute); }
                    }, {
                        xtype: 'button',
                        text: 'Edit',
                        width: 64,
                        height: 24,
                        margin: '0 7 0 0',
                        listeners: {
                            click: {
                                fn: this.editAttribute,
                                scope: this
                            }
                        }
                    }]
                }, {
                    xtype: 'container',
                    itemId: 'body',
                    minHeight: 50,
                    cls: Taco.baseCSSPrefix + 'attribute-item-body',
                    items: [{
                        xtype: 'component',
                        itemId: 'placeholder',
                        data: attribute,
                        tpl: [
                            '<tpl if="this.isList(inputType)">',
                                '{[Ext.Array.pluck(values.allValues, "value").join(", ")]}',
                            '<tpl else>',
                                '{inputType}',
                            '</tpl>',
                            {
                                isList: function (inputType) { return inputType === 'List'; }
                            }
                        ]
                    }]
                }]
            });
        }, this);

        panel.add(additions);
    },

    editAttribute: function (button) {
        var attributeItem = button.up('[attribute]'),
            attribute = attributeItem.attribute,
            body = attributeItem.items.get('body'),
            editForm = this.getEditForm(attribute);

        body.items.get('placeholder').hide();
        body.add(editForm);
    },

    getEditForm: function (attribute) {
        var inputType = attribute.inputType,
            fields = [],
            panel, attributeStore, attributeField, valuesField, selectionsField, configField, actionsGroup;

        attributeStore = Ext.create(Ext.data.Store, {
            model: 'Taco.model.ProductTypeAttribute',
            data: [attribute]
        });

        attributeField = Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'attribute',
            fieldLabel: 'Attribute',
            store: attributeStore,
            width: 240,
            margin: '0 40 0 0',
            displayField: 'attributeFQN',
            valueField: 'attributeFQN',
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
            }
        });

        panel = Ext.create('Taco.core.ux.form.Form', {
            items: [{
                xtype: 'formflexbox',
                justify: false,
                defaults: {
                    labelAlign: 'top',
                    labelSeparator: ''
                },
                items: [attributeField]
            }]
        });

        if (inputType == 'List') {
            valuesField = Ext.create('Taco.core.ux.form.field.MultiSelect', {
                name: 'values',
                fieldLabel: 'Values',
                store: [],
                hidden: true,
                width: 240,
                margin: '0 40',
                listConfig: {
                    cls: Ext.baseCSSPrefix + 'boundlist-with-hidden-selections',
                    selModel: { mode: 'SIMPLE' }
                }
            });

            selectionsField = Ext.create('Taco.core.ux.form.field.MultiSelect', {
                name: 'selections',
                fieldLabel: 'Selections',
                store: [],
                hidden: true,
                ddReorder: true,
                width: 240,
                margin: '0 40',
                listConfig: {
                    selModel: { mode: 'MULTI' },
                    itemTpl: [
                        '<span class="x-boundlist-item-drag">Drag </span>',
                        '<span class="x-boundlist-item-content">{field1}</span>',
                        '<span class="x-boundlist-item-close"> Close</span>'
                    ]
                }
            });

            fields.push(valuesField, selectionsField);
            panel.relayEvents(attributeField, ['change'], 'attribute');
            panel.relayEvents(valuesField, ['change', 'hide'], 'values');
            panel.relayEvents(selectionsField.boundList, ['itemclick'], 'selections');

            valuesField.mon(panel, {
                attributechange: function (attributeField, newValue, oldValue) {
                    var attribute = attributeField.boundList.getSelectionModel().getSelection()[0];

                    if (Ext.isEmpty(newValue)) {
                        this.hide();
                    } else {
                        this.show().bindStore(Ext.Array.pluck(attribute.get('allValues'), 'id'));
                    }
                    
                },
                selectionsitemclick: function (view, record, item, index, e) {
                    var closeBtn = e.getTarget('.x-boundlist-item-close', 10),
                        store;

                    if (closeBtn) {
                        store = view.getStore();
                        store.remove(record);
                        this.boundList.deselect(record);
                        return false;
                    }
                },
                scope: valuesField
            });

            selectionsField.mon(panel, {
                valueschange: function (valuesField, newValue, oldValue) {
                    var values = valuesField.boundList.getSelectionModel().getSelection();

                    if (Ext.isEmpty(newValue)) {
                        this.hide();
                    } else {
                        this.show().getStore().loadData(values, false);
                    }
                },
                valueshide: function () {
                    this.hide();
                },
                scope: selectionsField
            });
        }

        actionsGroup = Ext.create('Ext.Container', {
            items: [{
                xtype: 'button',
                text: 'Done',
                width: 64,
                height: 24,
                listeners: {
                    click: function () { console.log(this); },
                    scope: this
                }
            }]
        });

        fields.push(actionsGroup);
        panel.items.first().add(fields);
        
        return panel;
    },

    onDrop: function (plugin, ct, cmp, startIdx, idx) {
        console.log(cmp.getId(), startIdx, idx);
    }
});