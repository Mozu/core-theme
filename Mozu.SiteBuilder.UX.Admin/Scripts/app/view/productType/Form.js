/**
 * @class Taco.view.productType.Form
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.productType.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.field.MultiSelect', 
        'Taco.core.ux.BoxReorderer',
        'Taco.core.ux.form.FlexBox',
        'Taco.model.ProductTypeAttribute',
        'Taco.store.Attributes',
        'Taco.model.ProductType',
        'Taco.view.productType.AttributeForm'
    ],

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
            xtype: 'textfield',
            fieldLabel: 'Name',
            labelPosition: 'top',
            labelSeparator: '',
            width: 700,
            emptyText: 'Enter a Product Type Name',
            name: 'name'
        }, {
            itemId: 'options',
            attributeType: 'options',
            layout: 'card',
            header: {
                title: 'Options',
                margin: '0 0 7',
            },
            tools: [{
                xtype: 'primarybutton',
                text: 'Add',
                click: this.addAttribute,
                scope: this
            }],
            items: [{
                header: false,
                itemId: 'attributes',
                // plugins: Ext.create('Taco.core.ux.BoxReorderer', {
                //     listeners: {
                //         drop: this.onDrop,
                //         scope: this
                //     }
                // })
            }, {
                header: false,
                itemId: 'editor',
                xtype: 'formform',
                layout: {
                    type: 'formflexbox',
                    align: 'left'
                }
            }]
        }, {
            itemId: 'extras',
            attributeType: 'extras',
            layout: 'card',
            header: {
                title: 'Extras',
                margin: '0 0 7',
            },
            tools: [{
                xtype: 'primarybutton',
                text: 'Add',
                click: this.addAttribute,
                scope: this
            }],
            items: [{
                header: false,
                itemId: 'attributes',
                // plugins: Ext.create('Taco.core.ux.BoxReorderer', {
                //     listeners: {
                //         drop: this.onDrop,
                //         scope: this
                //     }
                // })
            }, {
                header: false,
                itemId: 'editor'
            }]
        }, {
            itemId: 'properties',
            attributeType: 'properties',
            layout: 'card',
            header: {
                title: 'Properties',
                margin: '0 0 7',
            },
            tools: [{
                xtype: 'primarybutton',
                text: 'Add',
                click: this.addAttribute,
                scope: this
            }],
            items: [{
                header: false,
                itemId: 'attributes',
                // plugins: Ext.create('Taco.core.ux.BoxReorderer', {
                //     listeners: {
                //         drop: this.onDrop,
                //         scope: this
                //     }
                // })
            }, {
                header: false,
                itemId: 'editor'
            }]
        }];

        this.callParent(arguments);

        //Ext.Array.each(['options', 'extras', 'properties'], this.addAttribute, this);
        //
        

        this.buildAttributeList('options', this.record.getOptions());
        this.buildAttributeList('extras', this.record.getExtras());
        this.buildAttributeList('properties', this.record.getProperties());
    },


    buildAttributeList: function (attributeType, store) {
        var panel = this.items.get(attributeType).items.get('attributes'),
            tpl = this.attributeItemTpl,
            additions = [];
        
        store.each(function (attribute) {
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
                        data: attribute.raw,
                        tpl: tpl
                    }, {
                        xtype: 'secondarybutton',
                        text: 'Delete',
                        click: function () { console.log('delete clicked', attribute); }
                    }, {
                        xtype: 'secondarybutton',
                        text: 'Edit',
                        click: {
                            fn: this.editAttribute,
                            scope: this
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
                        data: attribute.raw,
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

    getAttributeStoreFromType: function (type) {
        switch (type) {
            case 'options':
                return this.record.getOptions();
            case 'extras':
                return this.record.getExtras();
            case 'properties':
                return this.record.getProperties();
        }
    },

    getAttributeSelectorDEPRECATED: function (filter, attribute) {
        this.attributeStore.clearFilter();
        this.attributeStore.filter(filter);

        return Ext.create('Ext.view.View', {
            tpl: [
                '<tpl for=".">',
                    '<div class="attribute-wrap">{name}</div>',
                '</tpl>'
            ],
            store: this.attributeStore,
            itemSelector: 'div.attribute-wrap',
            listeners: {
                select: function (item, record) {
                    console.log('selected', record);
                },
                scope: this
            }
        });
    },

    getAttributeSelector: function (filter, attribute) {
        this.attributeStore.clearFilter();
        this.attributeStore.filter(filter);

        return Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'attribute',
            ignoreParentFormTracking: true,
            fieldLabel: 'Attribute',
            store: this.attributeStore,
            width: 240,
            margin: '0 40 0 0',
            displayField: 'name',
            valueField: 'id',
            maxSelections: 1,
            listConfig: {
                selModel: {
                    allowDeselect: false,
                    listeners: {
                        selectionchange: function () {
                            console.log('changed')
                        }
                    }
                }
            }
        });
    },

    onEditClick: function (button) {
    },

    addAttribute: function (button) {
        var cardPanel = button.up('[attributeType]'),
            type = cardPanel.attributeType,
            editor = cardPanel.items.get(1),
            productTypeAttributeStore = this.getAttributeStoreFromType(type),
            attributeSelector;

        editor.removeAll();
        
        attributeSelector = this.getAttributeSelector(function (record) {
            return productTypeAttributeStore.indexOf(record) < 0;
        });
    
        editor.add(attributeSelector);
        cardPanel.getLayout().setActiveItem(1);
    },

    editAttribute: function (button) {
        

        var attributeItem = button.up('[attribute]'),
            attribute = attributeItem.attribute,
            body = attributeItem.items.get('body'),
            cardPanel = attributeItem.up('[attributeType]'),
            editor = cardPanel.items.get(1),
            editForm = this.getEditForm(cardPanel.attributeType, attribute);

        editor.add(editForm);
        cardPanel.getLayout().setActiveItem(1);

        // body.items.get('placeholder').hide();
        // body.add(editForm);
    },

    getEditForm: function (attributeType, attribute) {
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
            ignoreSelectChange: true,
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