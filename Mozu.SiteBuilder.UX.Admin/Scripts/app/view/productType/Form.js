/**
 * @class Taco.view.productType.Form
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.productType.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.field.MultiSelect',
        'Taco.core.ux.BoxReorderer',
        'Taco.model.ProductTypeAttribute',
        'Taco.model.ProductType',
        'Taco.view.productType.AttributeGroup'
    ],

    ui: 'subform',
    createTitle: 'Create New Product Type',

    attributeItemTpl: [
        '<tpl for=".">',
        '<span class="', Taco.baseCSSPrefix, 'draghandle"></span>',
        '<span class="', Taco.baseCSSPrefix, 'attribute-item-header-text">{attributeFQN}</span>',
        '</tpl>'
    ],

    initComponent: function () {
        var me = this,
            options = me.record.get('options'),
            extras = me.record.get('extras'),
            properties = me.record.get('properties'),
            prodTypeId = me.record.get('id'),
            isExisting = Ext.isNumeric(prodTypeId);

        this.title = this.record.data.name;

        me.stores = me.stores || [];
        me.stores.push(options, extras, properties);

        me.productBundleUsageType = Ext.create('Ext.form.field.Checkbox', {
            name: "productUsagesField",
            itemId: 'productBundleItemId',
            boxLabel: "Product Bundle",
            inputValue: "Bundle"
        });

        me.productUsagesCheckboxGroup = Ext.create('Ext.form.FieldContainer', {
            fieldLabel: "Supported Usage Types",
            // note this layout is required for radiogroups to have the proper height;
            layout: "column",
            margin: "0 0 20 0",
            items: [
                {
                    xtype: "checkboxgroup",
                    columnWidth: .5,
                    name: "productUsagesGroup",
                    layout: {
                        layout: "hbox"
                    },
                    listeners: {
                        change: {
                            fn: function (group, newValue, oldValue, eOpts) {
                                me.onUsageTypeChange(newValue);
                            },
                            scope: me
                        }
                    },
                    allowBlank: false,
                    defaults: {
                        //name: "productUsages"
                    },
                    columns: 1,
                    items: [
                        {
                            xtype: "checkboxfield",
                            name: "productUsagesField",
                            boxLabel: "Standard Product",
                            inputValue: "Standard"
                        }, {
                            xtype: "checkboxfield",
                            name: "productUsagesField",
                            boxLabel: "Configurable Product With Options",
                            inputValue: "Configurable"
                        },
                        me.productBundleUsageType,
                        {
                            xtype: "checkboxfield",
                            name: "productUsagesField",
                            boxLabel: "Bundle Component",
                            inputValue: "Component"
                        }
                    ]
                }
            ]
        });

        me.items = [{
                xtype: 'textfield',
                itemId: 'nameItemId',
                fieldLabel: 'Name',
                labelPosition: 'top',
                labelSeparator: '',
                width: 700,
                maxLength: 50,
                emptyText: 'Enter a Product Type Name',
                name: 'name',
                allowBlank: false
            },
            me.productUsagesCheckboxGroup,
            {
                xtype: 'taco.producttype.attributegroup',
                itemId: "optionsAttributeGroup",
                productType: me.record,
                type: 'options'

            }, {
                xtype: 'taco.producttype.attributegroup',
                itemId: "extrasAttributeGroup",
                productType: me.record,
                type: 'extras'
            }, {
                xtype: 'taco.producttype.attributegroup',
                itemId: "propertiesAttributeGroup",
                productType: me.record,
                type: 'properties'
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: 'Advanced',
                layout: "column",
                margin: "0 0 20 0",
                items: [
                    {
                        xtype: "checkboxgroup",
                        columnWidth: .5,
                        name: "goodsTypeGroup",
                        layout: {
                            layout: "hbox"
                        },
                        allowBlank: true,
                        columns: 1,
                        defaults: {
                            disabled: isExisting
                        },
                        items: [
                            {
                                xtype: "checkboxfield",
                                name: "goodsTypeField",
                                itemId: 'digitalCreditItemId',
                                boxLabel: "This Product Type is a Digital Gift Card",
                                inputValue: "DigitalCredit",
                                handler: function (el, isChecked) {
                                    if (isChecked) {
                                        if (me.productBundleUsageType.getValue()) {
                                            me.productBundleUsageType.setValue(false);
                                        }
                                        me.productBundleUsageType.disable();
                                    } else {
                                        me.productBundleUsageType.enable();
                                    }
                                }
                            }
                        ]
                    }
               ]
            }
        ];


        me.callParent(arguments);

        me.replaceMonitor();
    },

    replaceMonitor: function () {
        var basic = this.getForm();

        basic.monitor.unbind();

        basic.monitor = new Ext.container.Monitor({
            selector: '[isFormField]:not([ignoreParentFormTracking])',
            scope: basic,
            addHandler: basic.onFieldAdd,
            removeHandler: basic.onFieldRemove
        });

        basic.monitor.bind(this);
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
                        xtype: 'button',
                        ui: 'action',
                        scale: 'medium',
                        text: 'Delete'
                    }, {
                        xtype: 'button',
                        ui: 'action',
                        scale: 'medium',
                        text: 'Edit',
                        scope: this,
                        handler: this.editAttribute
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
                                isList: function (inputType) {
                                    return inputType === 'List';
                                }
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
            itemSelector: 'div.attribute-wrap'
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
                    allowDeselect: false
                }
            }
        });
    },

    onEditClick: function (button) {},

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
                xtype: 'container',
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
                    selModel: {
                        mode: 'SIMPLE'
                    }
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
                    selModel: {
                        mode: 'MULTI'
                    },
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
                height: 24
            }]
        });

        fields.push(actionsGroup);
        panel.items.first().add(fields);

        return panel;
    },

    onDrop: function (plugin, ct, cmp, startIdx, idx) {

    },

    onUsageTypeChange: function (data) {
        var usageData = data.productUsagesField,
            showExtras = false,
            showOptions = false;

        // make sure the data is an array. will be string if one checkbox is selected;
        if (Ext.isString(usageData)) {
            usageData = [usageData];
        }

        // based on which of the checkboxes are selected will need to alter the rolled up visibility of the extras, options, and properties
        Ext.Array.each(usageData, function (item) {
            switch (item) {
            case "Standard":
                showExtras = true;
                break;
            case "Configurable":
                showOptions = showExtras = true;
                break;
            case "Bundle":
                showExtras = true;
                break;
            case "Component":
                break;
            }
        });

        // set the visiblity of the various section;
        // note that properties is always visible;
        this.down("#extrasAttributeGroup").setVisible(showExtras);
        this.down("#optionsAttributeGroup").setVisible(showOptions);
    },

    loadRecord: function () {
        var me = this,
            form = me.getForm(),
            productUsagesGroup = form.findField("productUsagesGroup"),
            goodsTypeGroup = form.findField('goodsTypeGroup');

        this.callParent(arguments);

        productUsagesGroup.setValue({
            productUsagesField: this.record.get("productUsages")
        });

        goodsTypeGroup.setValue({
            goodsTypeField: this.record.get("goodsType")
        });

    },
    beforeSave: function () {
        var me = this;
        // do any form validation. return false if the form is not valid for save;

        // do any manual record updates from the form;
        var form = me.getForm();
        // this data member wants the record data instead of the array of values that is return by combo. need to translate to record.data objects
        var productUsagesGroupData = form.findField("productUsagesGroup").getValue().productUsagesField;
        // need to force the data to array since extjs checkbox returns string if one value is checked;.
        if (Ext.isString(productUsagesGroupData)) {
            productUsagesGroupData = [productUsagesGroupData];
        }

        this.record.set("productUsages", productUsagesGroupData);

        var goodsTypeData = form.findField("goodsTypeGroup").getValue().goodsTypeField;
        if (goodsTypeData) {
            this.record.set('goodsType', goodsTypeData);
        }
        return true;
    }
});