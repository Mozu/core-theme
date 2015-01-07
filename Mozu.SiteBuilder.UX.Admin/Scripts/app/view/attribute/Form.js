/**
 * @class Taco.view.attribute.Form
 * @author Travis Johnson
 */
Ext.define('Taco.view.attribute.Form', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [
        'Taco.view.option.valueEditor.MultiValue',
        'Taco.shared.view.field.Product',
        'Taco.core.ux.form.SlugField'
    ],
    createTitle: 'Create New Attribute',
    alias: ['widget.taco-attributeform'],
    title: 'Attribute',

    defaults: {
        xtype: 'textfield',
        labelAlign: 'top',
        labelSeparator: ''
    },

    statics: {
        fieldCfg: {
            attributeType: {
                xtype: 'selectfield',
                fieldLabel: 'Attribute Type',
                allowBlank: true,
                name: 'attributeType',
                isDirty: function () {
                    return false;
                },
                listeners: {
                    select: function (field, records) {
                        var record = this.up('form').record,
                            isProperty = false,
                            isExtra = false;

                        if (field.getValue() == 'Property') {
                            isProperty = true;
                        }
                        if (field.getValue() == 'Extra') {
                            isExtra = true;
                        }

                        record.set('isExtra', isExtra);
                        record.set('isProperty', isProperty);

                    }
                },
                store: [
                    'Property',
                    'Extra'
                ]
            },
            dataType: {
                xtype: 'selectfield',
                fieldLabel: 'Data Type',
                name: 'dataType',
                store: [
                    ['String', 'Text'],
                    ['Number', 'Number'],
                    ['ProductCode', 'Product']
                ],
                listeners: {
                    render: function (view) {
                        var form = this.up('taco-attributeform').form,
                            inputType =  form.findField('inputType'),
                            dataType = form.findField('dataType');


                        if (inputType.getValue() != 'List' || dataType.allowProductDataType === false) {
                            this.store.removeAt(this.store.findExact('field1', 'ProductCode'));
                        }
                    },
                    change: function (field, newValue, oldValue) {
                        var form = field.up('formform').getForm(),
                            stringField = form.findField('addValueString'),
                            numberField = form.findField('addValueNumber'),
                            productField = form.findField('addValueProductCode'),
                            isNumber = (newValue === 'Number'),
                            isString = (newValue == 'String'),
                            isProductcode = (newValue == 'ProductCode'),
                            girdContainer = field.up('formform').down('#gridContainer');

                        if (stringField) {
                            stringField.setVisible(isString);
                        }
                        if (numberField) {
                            numberField.setVisible(isNumber);
                        }
                        if (productField) {
                            productField.setVisible(isProductcode);
                        }

                        if (girdContainer) {
                            girdContainer.initGrid(newValue);
                        }
                    }
                }
            }
        },
        subformCfg: {
            'List': function (statics) {
                var me = this,
                    grid,
                    gridContainer,
                    dataType = statics.fieldCfg.dataType;

                dataType.readOnly = this.isEdit();
                dataType.allowProductDataType = this.record.allowProductDataType();

                grid = {
                    xtype: 'grid',
                    width: 600,
                    sortableColumns: false,
                    disableSelection: true,
                    hideHeaders: false,
                    enableColumnHide: false,
                    store: this.valuesStore,
                    plugins: [
                        {
                            ptype: 'cellediting',
                            clicksToEdit: 1
                        }
                    ],
                    viewConfig: {
                        stripeRows: false,
                        onRowFocus: Ext.emptyFn,
                        markDirty: false
                    },
                    configureGrid: function (attributeDataType) {

                        this.columns = (this.columnConfigs[attributeDataType.toLowerCase()]).concat(this.columnConfigs.all);
                        this.hideHeaders = attributeDataType == 'number';


                    },
                    columnConfigs: {
                        number: [
                            {
                                dataIndex: 'value',
                                text: 'Value',
                                flex: 1,
                                editor: {
                                    xtype: 'numberfield',
                                    hideTrigger: true,
                                    ignoreParentFormTracking: true,
                                    keyNavEnabled: false,
                                    mouseWheelEnabled: false

                                }
                            }
                        ],
                        string: [
                            {
                                dataIndex: 'value',
                                text: 'Label',
                                flex: 2,
                                editor: {
                                    xtype: 'textfield',
                                    hideTrigger: true,
                                    ignoreParentFormTracking: true,
                                    keyNavEnabled: false,
                                    mouseWheelEnabled: false

                                }
                            }, {
                                dataIndex: 'id',
                                text: 'Value',
                                flex: 1,
                                editor: {
                                    xtype: 'textfield',
                                    hideTrigger: true,
                                    ignoreParentFormTracking: true,
                                    keyNavEnabled: false,
                                    mouseWheelEnabled: false

                                }
                            }
                        ],
                        productcode: [
                            {
                                dataIndex: 'id',
                                text: 'Product Code'


                            },
                            {
                                dataIndex: 'value',
                                text: 'Product Name',
                                flex: 1
                            }
                        ],
                        all: [
                            {
                                xtype: 'templatecolumn',
                                // text: '',
                                tdCls: 'taco-actioncolumn',
                                width: 26,
                                tpl: ['<div class="taco-actioncolumn-icon taco-actioncolumn-icon-remove"></div>']
                            }
                        ]

                    },
                    columns: [],
                    listeners: {
                        cellclick: function (view, td, cellIndex, record, tr, rowIndex, e) {

                            if (e.getTarget('.taco-actioncolumn-icon-remove', 10)) {
                                view.getStore().remove(record);
                            }
                        },
                        validateedit:function (editor, e) {
                            if (e.field == 'id' && e.grid.store.getById(e.value)) {

                                return false;
                            }
                            return true;
                        }
                    }
                };

                gridContainer = {
                    xtype: 'form', //dont change... long story
                    itemId: 'gridContainer',
                    gridCfg: grid,
                    items: [],
                    initGrid: function (dataType) {
                        this.gridCfg.configureGrid(dataType);
                        if (Ext.isArray(this.items)) {
                            this.items = [this.gridCfg];
                        } else {
                            this.removeAll(true);
                            this.add(this.gridCfg);
                        }

                    }
                };
                if (this.isEdit()) {
                    gridContainer.initGrid(me.record.get('dataType'));
                }


                return [
                    {
                        xtype: 'checkboxgroup',
                        fieldLabel: 'Attribute Type',
                        hidden: !me.record.supportsAttributeType(),
                        allowBlank: !me.record.supportsAttributeType(),
                        vertical: true,
                        columns: 1,
                        items: [
                            {
                                boxLabel: 'Option',
                                name: 'isOption',
                                inputValue: true,
                                readOnly: this.isEdit()
                            }, {
                                boxLabel: 'Property',
                                name: 'isProperty',
                                inputValue: true,
                                readOnly: this.isEdit()
                            }, {
                                boxLabel: 'Extra',
                                name: 'isExtra',
                                inputValue: true,
                                readOnly: this.isEdit()
                            }
                        ]
                    },
                    dataType, {
                        xtype: 'textfield',
                        name: 'addValueString',
                        enableKeyEvents: true,
                        ignoreParentFormTracking: true,
                        submitValue: false,
                        maxLength: 50,
                        width: 600,
                        hideMode: 'display',
                        fieldLabel: 'Values',
                        emptyText: 'Add another',
                        checkDirty: Ext.emptyFn,
                        isDirty: function () {
                            return false;
                        },
                        validate: function () {
                            var me = this,
                                isValid = me.isValid();
                            if (isValid !== me.wasValid) {
                                me.wasValid = isValid;
                            }
                            return isValid;
                        },
                        listeners: {
                            boxready: function (field) {
                                this.setVisible(me.getForm().findField('dataType').getValue() === 'String');
                            },
                            keydown: function (field, e) {
                                if (e.getKey() === e.ENTER && field.isValid()) {
                                    var value = field.getValue(),
                                        attributeId = me.record.getId(),
                                        record;

                                    if (!Ext.isEmpty(Ext.String.trim(value))) {
                                        field.reset();


                                        record = me.valuesStore.add({
                                            attributeId: attributeId,
                                            value: value
                                        })[0];

                                        record.set('id', value.replace(/[^a-zA-Z0-9-_//.]/g, "-"));
                                   
                                    }
                                }
                            }
                        }
                    }, {
                        xtype: 'numberfield',
                        name: 'addValueNumber',
                        enableKeyEvents: true,
                        hideTrigger: true,
                        ignoreParentFormTracking: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        submitValue: false,
                        maxLength: 50,
                        width: 600,
                        hideMode: 'display',
                        fieldLabel: 'Values',
                        emptyText: 'Add another',
                        checkDirty: Ext.emptyFn,
                        isDirty: function () {
                            return false;
                        },
                        validate: function () {
                            var me = this,
                                isValid = me.isValid();
                            if (isValid !== me.wasValid) {
                                me.wasValid = isValid;
                            }
                            return isValid;
                        },
                        listeners: {
                            boxready: function (field) {
                                this.setVisible(me.getForm().findField('dataType').getValue() === 'Number');
                            },
                            keydown: function (field, e) {
                                if (e.getKey() === e.ENTER && field.isValid()) {
                                    var value = field.getValue(),
                                        attributeId = me.record.getId(),
                                        record;

                                    if (!Ext.isEmpty(value)) {
                                        field.reset();

                                        record = me.valuesStore.add({
                                            attributeId: attributeId,
                                            value: value
                                        })[0];

                                        record.set('id', value.toString());
                                    }
                                }
                            }
                        }
                    }, {
                        xtype: 'taco-productfield',
                        name: 'addValueProductCode',
                        multiSelect: false,

                        showVariations: true,
                        showProductUsages: 'standard,bundle',
                        ignoreParentFormTracking: true,
                        submitValue: false,
                        width: 600,
                        hideMode: 'display',
                        fieldLabel: 'Values',
                        //emptyText: 'Add another',
                        // "queryMode": "local",
                        checkDirty: Ext.emptyFn,
                        isDirty: function () {
                            return false;
                        },
                        validate: function () {
                            var me = this,
                                isValid = me.isValid();
                            if (isValid !== me.wasValid) {
                                me.wasValid = isValid;
                            } 
                            return isValid;
                        },
                        listeners: {
                            beforerender: function (field) {
                                this.setVisible(me.getForm().findField('dataType').getValue() === 'ProductCode');
                            },
                            select: function (field, records) {
                                if (records && records.length) {
                                    var productName = records[0].get('productName'),
                                        productCode = records[0].getId(),
                                        attributeId = me.record.getId(),
                                        record;


                                    field.reset();

                                    record = me.valuesStore.add({
                                        attributeId: attributeId,
                                        value: productName
                                    })[0];

                                    record.set('id', productCode);
                                }

                            }
                        }
                    }, gridContainer
                ];
            },

            'TextBox': function (statics) {
                var attributeType = statics.fieldCfg.attributeType,
                    dataType = statics.fieldCfg.dataType;

                attributeType.readOnly = dataType.readOnly = this.isEdit();

                return [
                    attributeType,
                    dataType, {
                        xtype: 'container',
                        width: 308,
                        defaults: this.defaults,
                        items: [
                            {
                                fieldLabel: 'Min char/val',
                                xtype: 'numberfield',
                                hideTrigger: true,
                                name: 'min',
                                validator: function (value) {
                                    var form = this.up('form');
                                    var maxField = form.getForm().findField('max');
                                    var maxValue = maxField.getValue();

                                    if (Ext.isNumeric(value) && Ext.isNumeric(maxValue) && value > maxValue) {
                                        return 'Minimum value must not be greater than maximum value.';
                                    }
                                    return true;

                                }
                            }, {
                                fieldLabel: 'Max char/val',
                                xtype: 'numberfield',
                                hideTrigger: true,
                                name: 'max',
                                checkChangeBuffer: 120,
                                listeners: {
                                    change: function (field) {
                                        field.up('form').getForm().findField('min').validate();
                                    }
                                }
                            }
                        ],
                        listeners: {
                            boxready: function () {
                                this.doLayout();
                            },
                            scope: this
                        }
                    }, {
                        fieldLabel: 'Input validation',
                        name: 'regex',
                        emptyText: 'RegEx'
                    }
                ];
            },

            'TextArea': function (statics) {
                var attributeType = statics.fieldCfg.attributeType;

                attributeType.readOnly = this.isEdit();

                return [
                    attributeType, {
                        xtype: 'container',
                        width: 308,
                        defaults: this.defaults,
                        items: [
                            {
                                xtype: 'numberfield',
                                fieldLabel: 'Max char.',
                                hideTrigger: true,
                                name: 'max'
                            }
                        ],
                        listeners: {
                            boxready: function () {
                                this.doLayout();
                            },
                            scope: this
                        }
                    }
                ];
            },

            'YesNo': function (statics) {
                var attributeType = statics.fieldCfg.attributeType;

                attributeType.readOnly = this.isEdit();

                return [attributeType];
            },

            'Date': function (statics) {
                var attributeType = statics.fieldCfg.attributeType;
                this.record.set('dataType', 'dateTime');
                attributeType.readOnly = this.isEdit();

                return [
                    {
                        xtype: 'checkboxgroup',
                        name: 'includeTime',
                        inputValue: true,
                        boxLabel: 'Include time selector',
                        readOnly: this.isEdit()
                    },
                    attributeType, {
                        xtype: 'container',
                        width: 339,
                        fieldLabel: 'Range',
                        cls: 'taco-date-value-input',
                        items: [
                            {
                                xtype: 'datefield',
                                name: 'minDate',
                                listeners: {
                                    change: {
                                        scope: this,
                                        fn: 'onDateChange'
                                    }
                                }
                            }, {
                                xtype: 'label',
                                text: 'to'
                            }, {
                                xtype: 'datefield',
                                name: 'maxDate',
                                listeners: {
                                    change: {
                                        scope: this,
                                        fn: 'onDateChange'
                                    }
                                }
                            }
                        ],
                        listeners: {
                            boxready: function () {
                                this.doLayout();
                            },
                            scope: this
                        }
                    }
                ];
            }
        }
    },

    initComponent: function () {

        this.buildFormComponents();


        this.valuesStore = this.record.getAttributeValues();
        this.mon(this.valuesStore, 'load', this.onValudStoreLoad, this);
        this.valuesStore.rejectChanges();

        this.stores = [this.valuesStore];

        this.title = this.record.data.name;
        this.callParent(arguments);


        if (this.record.get('inputType')) {
            this.setAttributeInputType(this.record.get('inputType'));
            this.onValudStoreLoad();
        }
    },

    onValudStoreLoad: function () {
        var me = this;
        if ((this.record.get('dataType') || '').toLowerCase() != 'productcode') {
            return;
        }

        var prodIds = [], store;
        this.valuesStore.each(function (record) {
            if (!record.get('value') || record.get('value') == record.getId()) {
                prodIds.push(record.getId());
            }
        });
        if (!prodIds.length) {
            return;
        }
        store = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductComboBox');
        store.load({
            filters: [
                {
                    property: 'productcode',
                    value: prodIds.join()
                }
            ],
            callback: function (products) {
                if (!products) {
                    return;
                }
                Ext.Array.each(products, function (prod) {
                    var valRec = me.valuesStore.getById(prod.getId());
                    if (valRec) {
                        valRec.set('value', prod.get('productName'));
                        valRec.commit();
                    }
                });
            }
        });


    },

    buildFormComponents: function () {
        var me = this;

        this.subform = Ext.create('Taco.core.ux.form.Form', {
            defaults: this.defaults,
            header: false,
            listeners: {
                afterload: function () {
                    var attributeField = this.getForm().findField('attributeType');

                    if (!attributeField) {
                        return;
                    }

                    attributeField.setVisible(this.record.supportsAttributeType());


                    if (!attributeField.isSelectField) {
                        return;
                    }

                    if (this.record.get('isProperty')) {
                        attributeField.setValue('Property');
                    } else if (this.record.get('isExtra')) {
                        attributeField.setValue('Extra');
                    }
                },
                scope: this
            }
        });


        this.items = [
            {
                fieldLabel: 'Attribute Label',
                name: 'name',
                allowOnlyWhitespace: false,
                emptyText: 'Enter a label for the attribute',
                width: 300,
                maxLength: 30,
                enableKeyEvents: true,
                listeners: {
                    keyup: function (field, e, eOpts) {
                        var adminName = this.findField('adminName'),
                            attributeCode = this.findField('code');

                        if (!adminName.getValue() || (!this.record.get('adminName') && !field.hadKeyEvent)) {
                            adminName.setValue(field.getValue());
                        }
                        if (!attributeCode.getValue() || (!this.record.get('code') && !field.hadKeyEvent)) {
                            attributeCode.setValue(field.getValue());
                        }
                    },
                    scope: this
                }
            }, {
                fieldLabel: 'Administration Name',
                name: 'adminName',
                allowOnlyWhitespace: false,
                emptyText: 'Enter an attribute name',
                width: 300,
                enableKeyEvents: true,
                listeners: {
                    keyup: function (field, e, eOpts) {
                        field.hadKeyEvent = true;
                    },
                    scope: this
                }
            }, {
                fieldLabel: 'Attribute Code',
                name: 'code',
                allowOnlyWhitespace: !this.record.phantom,
                readOnly:!this.record.phantom,
                emptyText: 'Enter a unique attribute code',
                width: 300,
                xtype:'taco-slugfield',
                enableKeyEvents: true,
                listeners: {
                    keyup: function (field, e, eOpts) {
                        field.hadKeyEvent = true;
                    },
                    scope: this
                }
            }, {
                xtype: 'checkboxfield',
                name: 'isRequired',
                hidden: this.record.supportsAttributeType(),
                boxLabel: 'This attribute is required'
            }, {
                xtype: 'checkboxfield',
                name: 'isVisible',
                hidden: this.record.supportsAttributeType(),
                boxLabel: 'Show in website'
            }, {
                xtype: 'combobox',
                fieldLabel: 'Display Group',
                name: 'displayGroup',
                width: 240,
                editable: false,
                forceSelection: true,
                allowOnlyWhitespace: !this.record.supportsDisplayGroup(),
                hidden: !this.record.supportsDisplayGroup(),
                readOnly: this.isEdit(),
                store: [
                    ['AdminAndStorefront', 'Admin & Storefront'],
                    ['Admin', 'Admin Only']
                ],
                listeners: {
                    change: {
                        scope: this,
                        fn: function () { this.getForm().findField('valueType').validate(); }
                    }
                }
            }, {
                xtype: 'combobox',
                fieldLabel: 'Value Source',
                name: 'valueType',
                width: 240,
                editable: false,
                forceSelection: true,
                allowOnlyWhitespace: !this.record.supportsDisplayGroup(),
                hidden: !this.record.supportsDisplayGroup(),
                readOnly: this.isEdit(),
                store: [
                    ['ShopperEntered', 'Shopper Entered'],
                    ['AdminOrShopperEntered', 'Admin or Shopper Entered'],
                    ['AdminEntered', 'Admin Entered']
                ],
                listeners: {
                    change: {
                        scope: this,
                        fn: function () { this.getForm().findField('inputType').validate(); }
                    }
                },
                validator: function (value) {
                    if (value && value.indexOf('Shopper') !== -1 && me.getForm().findField('displayGroup').getValue() === 'Admin') {
                        return 'Display Group must be Admin & Storefront';
                    } else {
                        return true;
                    }
                }
            }, {
                xtype: 'combobox',
                fieldLabel: 'Input Type',
                name: 'inputType',
                editable: false,
                forceSelection: true,
                readOnly: this.isEdit(),
                store: [
                    ['List', 'List'],
                    ['TextBox', 'Text box'],
                    ['TextArea', 'Text area'],
                    ['YesNo', 'Yes/No'],
                    ['Date', 'Date']
                ],
                listeners: {
                    change: this.onInputTypeChange,
                    scope: this
                },
                validator: function (value) {
                    if (value === 'Date' && !me.getForm().findField('valueType').isHidden() && me.getForm().findField('valueType').getValue().indexOf('Shopper') !== -1) {
                        return 'Value Source must be Admin Entered';
                    } else {
                        return true;
                    }
                }
            },
            this.subform
        ];


    },

    /**
     * Make sure minDate is not greater than maxDate.
     */
    onDateChange: function (field, newValue, oldValue) {
        var isMax = field.getName() === 'maxDate',
            otherField = isMax ? field.previousSibling('[name="minDate"]') : field.nextSibling('[name="maxDate"]'),
            otherValue = otherField.getValue(),
            minValue = isMax ? otherValue : newValue,
            maxValue = isMax ? newValue : otherValue;

        if (otherValue && minValue > maxValue) {
            field.setValue(otherValue);
            otherField.setValue(newValue);
        }
    },

    onInputTypeChange: function (input, value) {
        this.setAttributeInputType(value);
    },

    setAttributeInputType: function (inputType) {
        var buildForms = this.statics().subformCfg[inputType],
            form;

        if (!buildForms) {
            return;
        }

        this.subform.removeAll();

        form = buildForms.apply(this, [this.statics()]);


        this.subform.add(form);


        this.subform.loadForm(this.record);

        var attributeField = this.getForm().findField('attributeType');

        if (attributeField) {
            attributeField.setVisible(this.record.supportsAttributeType());
            attributeField.allowOnlyWhitespace = !this.record.supportsAttributeType();
        }


    }
});
