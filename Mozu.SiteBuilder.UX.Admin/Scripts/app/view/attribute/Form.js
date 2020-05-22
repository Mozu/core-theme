/**
 * @class Taco.view.attribute.Form
 * @author Travis Johnson
 */
Ext.define('Taco.view.attribute.Form', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [
        'Taco.view.option.valueEditor.MultiValue',
        'Taco.shared.view.field.Product',
        'Taco.core.ux.form.SlugField',
        'Taco.core.ux.form.DateRange',
        'Taco.core.ux.DragHandleColumn',
        'Taco.view.attribute.AttributeValueGrid',
        'Taco.view.attribute.modal.SelectGenericAttributeModal',
        'Taco.view.attribute.GenericAttributeSelect'
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

        },
        subformCfg: {
            'List': function (statics) {
                var me = this,
                    grid,
                    gridContainer,
                    dataType = this.createDataTypeComponent(),
                    dragHandleColumn = {
                        xtype: 'draghandlecolumn',
                        stateId: 'dragHandle',
                        width: 35
                    },
                    positionColumn = {
                        xtype: 'gridcolumn',
                        sortable: false,
                        dataIndex: 'position',
                        text: 'Pos',
                        hideable: false,
                        width: 100,
                        renderer: function (cmp, metaData, record, index) {
                            return index + 1;
                        }
                    },
                    editActionColumn = {
                        xtype: 'gridcolumn',
                        sortable: false,
                        dataIndex: 'mappedGenericValues',
                        text: 'Mapped Values',
                        hideable: true,
                        hidden: true,
                        cls: 'mappingCell',
                        width: 250,
                        renderer: function (value, metaData, record, index) {
                            var attributForm = this.up('taco-attributeform');

                            var valueString = "Add";

                            if (value.length > 0) {
                                valueString = attributForm.showStrikethroughAttributes(attributForm, value);
                            }


                            var output = '<div title="Edit Mapping Values" style="width:100%;">'
                                + '<span style="cursor: pointer;display: inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;padding-right:20px;vertical-align:middle;">' + valueString + '</span>'
                                + '<i class="fas fa-pencil-alt" style="display:inline-block; margin-left:-13px;"></i>'
                                + '</div > ';

                            return output;


                        },
                        listeners: {
                            'click': function (grid, metaData, rowIndex) {
                                var record = grid.getStore().getAt(rowIndex);
                                me.openGenericAttributePopup(record, grid);
                            }
                        }

                    },
                    createPlacementSelector = function (type) {
                        return {
                            xtype: 'combobox',
                            queryMode: 'local',
                            itemId: ('attr-' + type.toLocaleLowerCase() + '-value-placement-selector'),
                            displayField: 'text',
                            valueField: 'value',
                            width: 200,
                            forceSelection: true,
                            editable: false,
                            margin: '0 0 0 10',
                            store: Ext.create('Ext.data.Store', {
                                fields: ['text', 'value'],
                                data: [
                                    { text: 'Insert at bottom', value: 'bottom' },
                                    { text: 'Insert at top', value: 'top' },
                                    { text: 'Insert above selected', value: 'above' },
                                    { text: 'Insert below selected', value: 'below' }
                                ]
                            }),
                            listeners: {
                                afterrender: function () {
                                    this.setVisible(me.getForm().findField('dataType').getValue() === type);
                                    this.select(this.getStore().getAt(0));
                                }
                            }
                        };
                    };

                dataType.readOnly = this.isEdit();
                dataType.allowProductDataType = this.record.allowProductDataType();

                grid = {
                    xtype: 'attribute-value-grid',
                    viewConfig: {
                        markDirty: false
                    },
                    width: 1000,
                    sortableColumns: false,
                    disableSelection: false,
                    hideHeaders: false,
                    enableColumnHide: false,
                    store: this.valuesStore,
                    record: this.record,
                    configureGrid: function (attributeDataType) {
                        this.columns = (this.columnConfigs[attributeDataType.toLowerCase()]).concat(this.columnConfigs.all);
                        this.hideHeaders = attributeDataType == 'number';
                    },
                    columnConfigs: {
                        number: [
                            dragHandleColumn,
                            positionColumn,
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
                            dragHandleColumn,
                            positionColumn,
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
                            },
                            editActionColumn
                        ],
                        productcode: [
                            dragHandleColumn,
                            positionColumn,
                            {
                                dataIndex: 'id',
                                text: 'Product Code',
                                flex: 1
                            },
                            {
                                dataIndex: 'value',
                                text: 'Storefront Label',
                                flex: 2,
                                editor: {
                                    xtype: 'textfield',
                                    hideTrigger: true,
                                    ignoreParentFormTracking: true,
                                    keyNavEnabled: false,
                                    mouseWheelEnabled: false
                                }
                            }
                        ],
                        all: [
                        ]
                    },
                    columns: [],
                    listeners: {
                        cellclick: function (view, td, cellIndex, record, tr, rowIndex, e) {

                            if (e.getTarget('.taco-actioncolumn-icon-remove', 10)) {
                                view.getStore().remove(record);
                            }
                        },
                        validateedit: function (editor, e) {
                            var existing = e.grid.store.findRecord('id', e.value, 0, false, false);
                            if (e.field == 'id' && existing) {
                                Taco.app.fireEvent('setmessage', ('The same value ' + existing.getId() + ' already exists'), 'error');
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

                    },
                    removeGrid: function () {

                    }
                };
                if (this.isEdit()) {
                    gridContainer.initGrid(me.record.get('dataType'));
                }

                return [
                    dataType,

                    this.createAttributeTypeCheckboxComponent()

                    , {
                        xtype: 'checkboxfield',
                        margin: '-5 0 5 4',
                        boxLabel: 'Choose Mapping Attribute',
                        name: 'isSeletedChooseMapAttr',
                        inputValue: true,
                        hidden: this.isChooseMappAttrHidden(),
                        listeners: {
                            change: this.handleChooseMapAttrChange,
                            scope: me
                        }
                    },
                    {
                        xtype: 'genericattributeselect',
                        width: 350,
                        margin: '0 0 0 4',
                        grow: false,
                        growToLongestValue: false,
                        listeners: {
                            change: function (ctrl) {
                                if (ctrl.rendered && ctrl.value && ctrl.value.length > 0) {
                                    ctrl.grow = true;
                                }
                            }
                        },
                        fieldLabel: 'Mapping Attribute',
                        name: 'valueMappingAttributeFQN',
                        displayField: 'name',
                        valueField: 'id',
                        hidden: true,
                        allowBlank: true,
                        listeners: {
                            change: this.handleMappingAttributeChange,
                            scope: me
                        }

                    }, {
                        xtype: 'fieldcontainer',
                        layout: {
                            type: 'hbox',
                            align: 'bottom'
                        },
                        width: 808,
                        itemId: 'addValueStringContainer',
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'addValueString',
                                enableKeyEvents: true,
                                ignoreParentFormTracking: true,
                                submitValue: false,
                                flex: 1,
                                margin: '0 10 0 0',
                                hideMode: 'display',
                                fieldLabel: 'Values',
                                emptyText: 'Add Value or Label:Value',
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
                                    boxready: function () {
                                        this.setVisible(me.getForm().findField('dataType').getValue() === 'String');
                                    },
                                    keydown: function (field, e) {
                                        if (e.getKey() === e.ENTER && field.isValid()) {
                                            var value = field.getValue(),
                                                attributeId = me.record.getId();

                                            if (!Ext.isEmpty(Ext.String.trim(value))) {
                                                field.reset();

                                                var positionSelector = Ext.ComponentQuery.query('#attr-string-value-placement-selector');
                                                var position = (positionSelector.length > 0) ? positionSelector[0].getValue() : 'bottom';
                                                var labelValue = value.split(':');
                                                var id = labelValue.length > 1 ? labelValue[1] : value;
                                                Taco.app.fireEvent('added-attribute-value', {
                                                    attributeId: attributeId,
                                                    value: labelValue[0],
                                                    id: id.replace(/[^a-zA-Z0-9-_//.]/g, "-"),
                                                    position: position
                                                });
                                            }
                                        }
                                    }
                                }
                            },
                            createPlacementSelector('String')
                        ]
                    }, {
                        xtype: 'fieldcontainer',
                        layout: {
                            type: 'hbox',
                            align: 'bottom'
                        },
                        width: 808,
                        itemId: 'addValueNumberContainer',
                        items: [{
                            xtype: 'numberfield',
                            name: 'addValueNumber',
                            enableKeyEvents: true,
                            hideTrigger: true,
                            ignoreParentFormTracking: true,
                            keyNavEnabled: false,
                            mouseWheelEnabled: false,
                            submitValue: false,
                            maxLength: 50,
                            flex: 1,
                            margin: '0 10 0 0',
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
                                boxready: function () {
                                    this.setVisible(me.getForm().findField('dataType').getValue() === 'Number');
                                },
                                keydown: function (field, e) {
                                    if (e.getKey() === e.ENTER && field.isValid()) {
                                        var value = field.getValue(),
                                            attributeId = me.record.getId();

                                        if (!Ext.isEmpty(value)) {
                                            field.reset();

                                            var positionSelector = Ext.ComponentQuery.query('#attr-number-value-placement-selector');
                                            var position = (positionSelector.length > 0) ? positionSelector[0].getValue() : 'bottom';
                                            Taco.app.fireEvent('added-attribute-value', {
                                                attributeId: attributeId,
                                                value: value,
                                                id: value,
                                                position: position
                                            });
                                        }
                                    }
                                }
                            }
                        }, createPlacementSelector('Number')
                        ]
                    }, {
                        xtype: 'fieldcontainer',
                        layout: {
                            type: 'hbox',
                            align: 'bottom'
                        },
                        width: 858,
                        itemId: 'addProductContainer',
                        items: [{
                            xtype: 'taco-productfield',
                            name: 'addValueProductCode',
                            multiSelect: false,
                            showVariations: true,
                            excludeBase: true,
                            showProductUsages: '',
                            ignoreParentFormTracking: true,
                            submitValue: false,
                            width: 650,
                            hideMode: 'display',
                            fieldLabel: 'Values',
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
                                beforerender: function () {
                                    this.setVisible(me.getForm().findField('dataType').getValue() === 'ProductCode');
                                },
                                select: function (field, records) {
                                    me.selectProduct(field, records);
                                }
                            }
                        },
                        createPlacementSelector('ProductCode')
                        ]
                    },
                    gridContainer
                ];
            },

            'TextBox': function (statics) {

                var form = this.getForm(),
                    attributeType = this.createAttributeTypeComponent();
                dataType = this.createDataTypeComponent();

                attributeType.readOnly = this.isEdit();

                if (dataType) {
                    dataType.readOnly = this.isEdit();
                }
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
                var form = this.getForm(),
                    attributeType = this.createAttributeTypeComponent();
                
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
                var attributeType = this.createAttributeTypeComponent();


                attributeType.readOnly = this.isEdit();

                return [attributeType];
            },

            'Date': function (statics) {
                var attributeType = this.createAttributeTypeComponent();
                //this.record.set('dataType', 'dateTime');
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
                        layout: {
                            type: 'hbox',
                            align: 'bottom'
                        },
                        fieldLabel: 'Range',
                        cls: 'taco-date-value-input',
                        items: [
                            {
                                fieldLabel: 'Valid Date Range',
                                xtype: 'daterange',
                                name: 'minDate',
                                endDateFieldName: 'maxDate'
                            }, {
                                xtype: 'label',
                                text: 'to',
                                padding: '0 10'
                            }, {
                                xtype: 'daterange',
                                name: 'maxDate',
                                startDateFieldName: 'minDate'
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

        this.stores = [this.valuesStore];

        this.title = this.record.data.name;
        this.callParent(arguments);


        if (this.record.get('inputType')) {
            this.setAttributeInputType(this.record.get('inputType'));
        }

    },

    createAttributeTypeComponent: function () {
        return {
            xtype: 'selectfield',
                fieldLabel: 'Attribute Type',
                    allowBlank: false,
                        name: 'attributeType',
                            isDirty: function () {
                                return false;
                            },
            listeners: {
                select: function (field) {
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
        };
    },

    createAttributeTypeCheckboxComponent: function () {
        var me = this;
        return {
            xtype: 'checkboxgroup',
            name: 'attributeType',
            fieldLabel: 'Attribute Type',
            hidden: !me.record.supportsAttributeType(),
            disabled: !me.record.supportsAttributeType(),
            allowBlank: !me.record.supportsAttributeType(),
            itemId: 'attributeTypeCheckboxGroup',
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
                }, {
                    boxLabel: 'Mapping Attribute',
                    name: 'isValueMappingAttribute',
                    inputValue: true,
                    readOnly: this.isMappingAttributeTypeReadOnly(),
                    hidden: this.isMappingAttributeTypeHidden()
                }
            ],
            listeners: {
                change: this.handleAttributeTypeChange,
                render: function (cmp) {
                    me.attributeTypeCheckboxGroup = cmp;
                },
                scope: me
            }
        };
    },
    createDataTypeComponent: function () {
        var me = this;
        return {
            xtype: 'selectfield',
            fieldLabel: 'Data Type',
            name: 'dataType',
            lastQuery: '',
            store: [
                ['String', 'Text'],
                ['Number', 'Number'],
                ['ProductCode', 'Product']
            ],
            listeners: {
                render: function (view) {
                    var form = this.up('taco-attributeform').form,
                        inputType = form.findField('inputType'),
                        dataType = form.findField('dataType');

                    form.dataTypeField = view;
                    form.owner.updateDataTypeOptions();

                },
                change: function (field, newValue) { me.handleDataTypeChange(field, newValue); },
            }
        };
    },

    handleAttributeTypeChange: function () {

        var me = this,
            attributeType = me.attributeTypeCheckboxGroup,
            attributeTypeValue = (attributeType) ? attributeType.getValue() : null,
            isValueMappingAttribute = (attributeTypeValue && attributeTypeValue.isValueMappingAttribute);

        if (!isValueMappingAttribute && this.record.data.isValueMappingAttribute) {
            confirm = Ext.create('Taco.view.attribute.ConfirmDisableMappingAttribute', {
                record: this.record,

                onCancelDisable: function (modal) {
                    var mappingAttributeCB = me.attributeTypeCheckboxGroup.items.items.find(function (x) { return x.name == "isValueMappingAttribute" });
                    mappingAttributeCB.setValue(true);
                }
            }
            );
        }


        this.updateDataTypeOptions();
        this.hideShowChooseAttrMapping();
    },

    handleChooseMapAttrChange: function (chooseMapAttrField, newValue, oldValue, eOpts) {
        var form = chooseMapAttrField.up('form').getForm(),
            mappingAttributeCombo = form.findField('valueMappingAttributeFQN');

        if (newValue) {
            mappingAttributeCombo.setVisible(true);
            mappingAttributeCombo.setAllowBlank(false);

            mappingAttributeCombo.validate();
        }
        else {

            mappingAttributeCombo.setAllowBlank(true);
            mappingAttributeCombo.setValue();
            mappingAttributeCombo.fireEvent('change', mappingAttributeCombo);
            mappingAttributeCombo.validate();

            mappingAttributeCombo.setVisible(false);
        }
        mappingAttributeCombo.getStore().proxy.extraParams.isGrid = false;

    },

    handleMappingAttributeChange: function (field, newValue, oldValue) {
        var me = this;
        //only check if there was a value to begin with
        if (oldValue) {
            //when the value is changed, clear the values
            var grid = this.down('attribute-value-grid');
            var gridStore = grid.getStore();

            if (!Ext.isEmpty(gridStore)) {
                grid.getStore().each(function (r) {

                    r.set('mappedGenericValues', '');
                });

            }
        }
        var valueMappingAttributeFQN = this.getForm().findField('valueMappingAttributeFQN');
        var gridMappingColumn = this.down('attribute-value-grid').down('[dataIndex=mappedGenericValues]');
        var fieldValue = field.getValue();

        if (Ext.isEmpty(fieldValue)) {
            if (gridMappingColumn) {
                gridMappingColumn.setVisible(false);
            }
            return;
        }

        valueMappingAttributeFQN.setVisible(true);
        gridMappingColumn.setVisible(true);


        var record = field.findRecord(field.valueField || field.displayField, fieldValue);
        storeCfg = {
            type: 'Taco.store.AttributesGrid',
            extraParams: {
                id: record.get('id')
            }
        };

        me.down('attribute-value-grid').doLayout();
        me.mappingAttributeStore = Taco.core.data.StoreManager.getOrCreate(storeCfg);
        me.mappingAttributeStore.load({
            params: {
                id: record.get('id')
            },
            callback: function (records, operation, success) {
                if (success == true) {
                    this.genericAttributeData = records[0].data.values;
                } else {
                    //show error
                }
            },
            scope: this
        });

    },

    handleDataTypeChange: function (field, newValue) {

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
        field.up('taco-attributeform').hideShowChooseAttrMapping();
        Taco.app.fireEvent('attribute-data-type-changed', newValue);


        //clear attribute values if there are any
        var attributeValueGrid = field.up('formform').down('attribute-value-grid');
        var attributeValueGridStore = attributeValueGrid.getStore();
        if (!Ext.isEmpty(attributeValueGridStore)) {
            attributeValueGridStore.removeAll();
        }

        this.checkIfMappingAttributeTypeShouldHideOrBeReadonly();
    },




    checkIfMappingAttributeTypeShouldHideOrBeReadonly: function () {
        var form = this.getForm();

        var isvalueMappignAttributeField = form.findField('isValueMappingAttribute');

        isvalueMappignAttributeField.setVisible(!this.isMappingAttributeTypeHidden());

        isvalueMappignAttributeField.setReadOnly(this.isMappingAttributeTypeReadOnly());
    },

    isMappingAttributeTypeReadOnly: function () {

        var data = this.record.data;

        //data type has to be Text / String
        if (data.dataType != "String") {
            return true;
        }

        //if a new attribute it is otherwise editable
        if (!this.isEdit()) {
            return false;
        }

        if (!this.record.data.isValueMappingAttribute) {

            //don't allow if has a mapping attribute
            if (data.valueMappingAttributeFQN) {
                return true;
            }

            return false;
        }


        //otherwise it is editable only if another item is selected.
        if (data.isOption || data.isProperty || data.isExtra) {
            return false;
        }

        return true;

    },

    isMappingAttributeTypeHidden: function () {

        var data = this.record.data;
        //Datatype has to be a string to enable it
        if (data.dataType != "String") {
            return true;
        }

        //don't allow if has a mapping attribute
        if (data.valueMappingAttributeFQN) {
            return true;
        }

        return false;
    },


    isChooseMappAttrHidden: function () {
        if (!this.isEdit()) { return true; }

        var data = this.record.data;

        if (!data.isValueMappingAttribute && (data.isOption || data.isProperty || data.isExtra) && (data.inputType == 'List') && (data.dataType == 'String')) {
            return false;
        }

        return true;
    },


    updateDataTypeOptions: function () {

        var me = this,
            form = this.getForm(),
            inputType = form.findField('inputType'),
            dataType = form.findField('dataType'),
            attributeType = me.attributeTypeCheckboxGroup,
            attributeTypeValue = (attributeType) ? attributeType.getValue() : null,
            isOption = (attributeTypeValue && attributeTypeValue.isOption),
            isProperty = (attributeTypeValue && attributeTypeValue.isProperty),
            isValueMappingAttribute = (attributeTypeValue && attributeTypeValue.isValueMappingAttribute),
            store = dataType.store;



        if (isValueMappingAttribute) {
            store.filterBy(function (item) {
                return item.get('field1') == 'String';
            });
            dataType.setValue('String');
        }
        else if ((isOption) || (inputType.getValue() != 'List') || (inputType.getValue() === 'List' && isProperty)) {

            store.filterBy(function (item) {
                return item.get('field1') !== 'ProductCode';
            });
            if (dataType.getValue() === 'ProductCode') {
                dataType.setValue('String');
            }
        }
        else {
            store.clearFilter();
        }



        /*if (inputType.getValue() != 'List' || dataType.allowProductDataType === false) {
            this.store.removeAt(this.store.findExact('field1', 'ProductCode'));
        }*/
    },


    hideShowChooseAttrMapping: function () {
        var me = this,
            form = this.getForm(),
            inputType = form.findField('inputType'),
            dataType = form.findField('dataType'),
            attributeType = me.attributeTypeCheckboxGroup,
            attributeTypeValue = (attributeType) ? attributeType.getValue() : null,
            isOption = (attributeTypeValue && attributeTypeValue.isOption),
            isProperty = (attributeTypeValue && attributeTypeValue.isProperty),
            isExtra = (attributeTypeValue && attributeTypeValue.isExtra),
            isValueMappingAttribute = (attributeTypeValue && attributeTypeValue.isValueMappingAttribute),
            chooseMapAttrSelect = form.findField('isSeletedChooseMapAttr'),
            mappingAttributeCombo = form.findField('valueMappingAttributeFQN');

        if (!isValueMappingAttribute && (isOption || isProperty || isExtra) && (inputType.getValue() == 'List') && (dataType.getValue() == 'String')) {
            chooseMapAttrSelect ? chooseMapAttrSelect.setVisible(true) : "";
        } else {
            chooseMapAttrSelect ? chooseMapAttrSelect.setVisible(false) : "";
            chooseMapAttrSelect ? chooseMapAttrSelect.setValue(false) : "";

        }
    },



    createSearchOptions: function () {
        var me = this;

        this.searchInStorefront = Ext.widget({
            xtype: 'checkbox',
            name: 'searchableInStorefront',
            boxLabel: 'Available to Storefront Search',
            hidden: !this.record.supportsSearchInStorefront(),
            itemId: 'searchableInStorefront',
            listeners: {
                change: function (cmp, newValue) {
                    me.record.set('searchableInStorefront', newValue);
                    me.searchDisplayContainer.setVisible(me.record.supportsSearchDisplayType());
                },
                scope: this
            },
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'searchableInStorefront',
                hoverTarget: 'boxLabelEl',
                messageKey: 'attribute.form.searchOptions',
                offsetLeft: -255,
                offsetTop: 22,
                arrowPosition: 'left'
            })
        });

        this.searchLabel = Ext.widget({
            xtype: 'radio',
            name: 'searchDisplayType',
            persistSelectedValueOnly: true,
            boxLabel: 'Search Label',
            inputValue: 'label',
            width: 300,
            checked: this.record.get('searchDisplayType') === 'label',
            listeners: {
                afterchange: function (cmp, newValue) {
                    if (newValue) {
                        this.record.set('searchDisplayValue', true);
                    }
                },
                scope: this
            }
        });

        this.searchValue = Ext.widget({
            xtype: 'radio',
            name: 'searchDisplayType',
            persistSelectedValueOnly: true,
            boxLabel: 'Search Value',
            inputValue: 'value',
            width: 300,
            checked: this.record.get('searchDisplayType') === 'value',
            listeners: {
                afterchange: function (cmp, newValue) {
                    if (newValue) {
                        this.record.set('searchDisplayValue', false);
                    }
                },
                scope: this
            }
        });

        this.searchDisplayContainer = Ext.widget('fieldcontainer', {
            id: 'searchDisplayContainer',
            margin: '0 0 0 25',
            layout: 'vbox',
            hidden: !this.record.supportsSearchDisplayType(),
            items: [
                this.searchLabel,
                this.searchValue
            ]
        });

        this.allowFilteringAndSorting = Ext.widget('checkboxfield', {
            name: 'allowFilteringAndSortingInStorefront',
            boxLabel: 'Available as Filter & Sort',
            itemId: 'allowFilteringAndSortingInStorefront',
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'allowFilteringAndSortingInStorefront',
                hoverTarget: 'boxLabelEl',
                messageKey: 'attribute.form.filterandsorting',
                offsetLeft: -220,
                offsetTop: 22,
                arrowPosition: 'left'
            })
        });

        return Ext.create('Ext.form.FieldContainer',
            {
                fieldLabel: "Search Options",
                items: [
                    this.searchInStorefront,
                    this.searchDisplayContainer,
                    this.allowFilteringAndSorting
                ]
            }
        );
    },

    buildFormComponents: function () {
        var me = this;

        this.subform = Ext.create('Taco.core.ux.form.Form', {
            defaults: this.defaults,
            header: false,
            listeners: {
                afterload: function () {
                    var attributeField = this.getForm().findField('attributeType');
                    this.populateMappingAttributeField();
                    if (this.isEdit() && this.record.get('isSeletedChooseMapAttr')) {
                        var valueMappingAttributeFQN = this.getForm().findField('valueMappingAttributeFQN');
                        valueMappingAttributeFQN.getStore().on('load', function (store, records, options) {

                            if (records && records[0]) {
                                this.genericAttributeData = records[0].data.values;
                            }

                        }, this);
                    }
                    if (!attributeField) {
                        return;
                    }

                    this.attributeField = attributeField;

                    attributeField.setVisible(this.record.supportsAttributeType());


                    if (!attributeField.isSelectField) {
                        return;
                    }

                    if (this.record.get('isProperty')) {
                        attributeField.setValue('Property');
                    } else if (this.record.get('isExtra')) {
                        attributeField.setValue('Extra');
                    } else if (this.record.get('isValueMappingAttribute')) {
                        attributeField.setValue('Mapping Attribute');
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
                maxLength: 100,
                enableKeyEvents: true,
                listeners: {
                    keyup: function (field) {
                        var adminName = this.findField('adminName'),
                            attributeCode = this.findField('code');

                        this.copyToField(field, adminName);
                        this.copyToField(field, attributeCode);
                    },
                    scope: this
                }
            }, {
                fieldLabel: 'Administration Name',
                name: 'adminName',
                allowOnlyWhitespace: false,
                emptyText: 'Enter an attribute name',
                width: 300,
                maxLength: 50,
                enableKeyEvents: true,
                listeners: {
                    keyup: function (field) {
                        field.hadKeyEvent = true;
                    },
                    scope: this
                }
            }, {
                fieldLabel: 'Attribute Code',
                name: 'code',
                allowOnlyWhitespace: !this.record.phantom,
                readOnly: !this.record.phantom,
                emptyText: 'Enter a unique attribute code',
                width: 300,
                maxLength: 30,
                xtype: this.record.phantom
                    ? 'taco-slugfield'
                    : 'textfield',      //display as-is for existing records
                enableKeyEvents: true,
                listeners: {
                    keyup: function (field) {
                        field.hadKeyEvent = true;
                    },
                    scope: this
                }
            }, {
                xtype: 'checkboxfield',
                name: 'isRequired',
                hidden: !this.record.supportsIsRequired(),
                boxLabel: 'This attribute is required'
            }, {
                xtype: 'checkboxfield',
                name: 'isVisible',
                hidden: !this.record.supportsIsVisible(),
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
                allowOnlyWhitespace: !this.record.supportsValueType(),
                hidden: !this.record.supportsValueType(),
                disabled: !this.record.supportsValueType(),
                readOnly: this.isEdit(),
                store: [
                    ['ShopperEntered', 'Shopper Entered'],
                    ['AdminOrShopperEntered', 'Admin or Shopper Entered'],
                    ['AdminEntered', 'Admin Entered']
                ],
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
                allowOnlyWhitespace: false,
                forceSelection: true,
                readOnly: this.isEdit(),
                allowBlank: false,
                store: [
                    ['List', 'List'],
                    ['TextBox', 'Text box'],
                    ['TextArea', 'Text area'],
                    ['YesNo', 'Yes/No'],
                    ['Date', 'Date']
                ],
                enableKeyEvents: true,
                listeners: {
                    change: this.onInputTypeChange,
                    keyup: function (field) {
                        field.hadKeyEvent = true;
                    },
                    scope: this
                }
            },
            this.subform
        ];
        if (this.record.supportsSearchOptions()) {
            this.items.push(this.createSearchOptions());
            this.mon(Taco.app, 'attribute-data-type-changed', function (newVal) {
                me.record.set('dataType', newVal);
                me.searchDisplayContainer.setVisible(me.record.supportsSearchDisplayType());
            });
        }

    },

    copyToField: function (fromField, toField) {
        var toFieldValue = toField.getValue();

        if (!toFieldValue) {
            toField.hadKeyEvent = false;
        }

        if (!toFieldValue
            || (!this.record.get(toField.name) && !toField.hadKeyEvent)) {

            toField.setValue(fromField.getValue());
        }
    },

    onInputTypeChange: function (input, value) {
        this.setAttributeInputType(value);
        this.hideShowChooseAttrMapping();
    },

    setAttributeInputType: function (inputType) {
        var buildForms = this.statics().subformCfg[inputType],
            form;

        if (!buildForms) {
            return;
        }
        this.subform.removeAll();

        // BUG 54788 - need to clean up if user switches the input type combo.
        if (this.record.phantom) {
            if (inputType == 'Date') {
                this.record.set('dataType', 'dateTime');
            } else {
                this.record.set('dataType', '');
            }
        }
        form = buildForms.apply(this, [this.statics()]);

        this.subform.add(form);


        this.subform.loadForm(this.record);

        var attributeField = this.getForm().findField('attributeType');

        if (attributeField) {
            attributeField.setVisible(this.record.supportsAttributeType());
            attributeField.allowOnlyWhitespace = !this.record.supportsAttributeType();
            attributeField.allowBlank = attributeField.allowOnlyWhitespace;
        }

        if (this.record.supportsSearchOptions()) {
            this.record.set('inputType', inputType);
            this.searchInStorefront.setVisible(this.record.supportsSearchInStorefront());
            this.searchDisplayContainer.setVisible(this.record.supportsSearchDisplayType());
        }
    },

    getAttrLabelWithVariations: function (productName, variationOptions) {
        if (!variationOptions || variationOptions.length === 0) return productName;
        var joinedOptions = Ext.Array.map(variationOptions, function (opt) {
            return opt.attributeFQN.split('~')[1] + ': ' + opt.value;
        }).join(', ');
        return productName + ' (' + joinedOptions + ')';
    },

    selectProduct: function (field, records) {
        if (records && records.length) {
            var productName = records[0].get('productName'),
                productCode = records[0].getId(),
                hasConfigOptions = records[0].get('hasConfigurableOptions'),
                variationOptions = records[0].get('variationOptions'),
                attributeId = this.record.getId(),
                attributeValue = productName;

            field.reset();

            var existing = this.valuesStore.findRecord('id', productCode, 0, false, false, true);
            if (existing) {
                Taco.app.fireEvent('setmessage', ('Product "' + existing.get('value') + '" already exists'), 'error');
                return;
            }
            if (hasConfigOptions) {
                attributeValue = this.getAttrLabelWithVariations(productName, variationOptions);
            }

            var positionSelector = Ext.ComponentQuery.query('#attr-productcode-value-placement-selector');
            var position = (positionSelector.length > 0) ? positionSelector[0].getValue() : 'bottom';
            Taco.app.fireEvent('added-attribute-value', {
                attributeId: attributeId,
                value: attributeValue,
                optionalValue: productName,
                id: productCode,
                position: position
            });
        }
    },




    openGenericAttributePopup: function (record, grid) {
        var me = this;
        Ext.create('Taco.view.attribute.modal.SelectGenericAttributeModal', {
            layout: 'hbox',
            width: 600,
            height: 400,
            record: record,
            title: 'Selected Values for : ' + record.get('value'),
            parent: me,
            listeners: {
                saveSuccess: {
                    fn: function () {
                        var allRecords = this.parent.genericAttributeData,
                            selectedValue = this.selectOptionValues.value,
                            mappedGenericValues = [];
                        if (selectedValue) {
                            for (var i = 0; i < selectedValue.length; i++) {
                                for (var j = 0; j < allRecords.length; j++) {
                                    if (allRecords[j].id === (selectedValue[i])) {
                                        mappedGenericValues.push(allRecords[j].id);
                                    }
                                }
                            }
                            this.record.set('mappedGenericValues', mappedGenericValues);
                        }
                    }
                }
            }
        });
    },

    populateMappingAttributeField: function () {
        var me = this,
            form = this.getForm(),
            mappingAttributeField = form.findField('valueMappingAttributeFQN');
        chooseMapAttrField = form.findField('isSeletedChooseMapAttr');
        if (me.record.get('isSeletedChooseMapAttr')) {
            mappingAttributeField.setVisible(true);
            chooseMapAttrField.setVisible(true);
        }
    },

    showStrikethroughAttributes: function (attributForm, value) {
        var me = this;
        genericAttributeData = attributForm.genericAttributeData;
        attributForm.strikethroughAttributes = [];
        if (value.length > 0) {
            var mappingAttrValues = [],
                htmlString = "";
            for (var i = 0; i < genericAttributeData.length; i++) {
                mappingAttrValues.push(genericAttributeData[i].id);
            }
            for (var i = 0; i < value.length; i++) {
                if (mappingAttrValues.includes(value[i])) {
                    (i == value.length - 1) ? htmlString += value[i] : htmlString += value[i] + ', ';
                } else {
                    attributForm.strikethroughAttributes.push(value[i]);
                    (i == value.length - 1) ? htmlString += '<span style="text-decoration: line-through;">' + value[i] + '</span>' : htmlString += '<span style="text-decoration: line-through;">' + value[i] + '</span>, ';
                }
            }
            return htmlString;
        }
    }

});
