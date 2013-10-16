/**
 * @class Taco.view.attribute.Form
 * @author Travis Johnson
 */

Ext.define('Taco.view.attribute.Form', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.view.option.valueEditor.MultiValue'],
    createTitle: 'Create New Attribute',

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
                name: 'attributeType',
                isDirty: function () { return false; },
                listeners: {
                    select: function (field, records) {
                        var record = this.up('form').record, isProperty = false, isExtra = false;
                        
                        if (field.getValue() == 'Property') {
                            isProperty = true;
                        }
                        if (field.getValue() == 'Extra') {
                            isExtra = true;
                        }

                        record.set('isExtra',isExtra);
                        record.set('isProperty',isProperty);
                       
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
                    ['Number', 'Number']
                ],
                listeners: {
                    change: function (field, newValue, oldValue) {
                        var form = field.up('formform').getForm(),
                            stringField = form.findField('addValueString'),
                            numberField = form.findField('addValueNumber'),
                            isNumber = (newValue === 'Number');

                        stringField.setVisible(!isNumber);
                        numberField.setVisible(isNumber);
                    }
                }
            }
        },
        subformCfg: {
            'List': function (statics) {
                var me = this ;
                dataType = statics.fieldCfg.dataType;

                dataType.readOnly = this.isEdit();

                return [{
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Attribute Type',
                    vertical: true,
                    columns: 1,
                    items: [
                        {boxLabel: 'Option', name: 'isOption', inputValue: true, readOnly: this.isEdit()},
                        {boxLabel: 'Property', name: 'isProperty', inputValue: true, readOnly: this.isEdit()},
                        {boxLabel: 'Extra', name: 'isExtra', inputValue: true, readOnly: this.isEdit()}
                    ]
                },
                dataType,
                {
                    xtype: 'textfield',
                    name: 'addValueString',
                    enableKeyEvents: true,
                    ignoreParentFormTracking: true,
                    submitValue: false,
                    maxLength: 50,
                    width: 300,
                    hideMode: 'display',
                    fieldLabel: 'Values',
                    emptyText: 'Add another',
                    checkDirty: Ext.emptyFn,
                    isDirty: function () { return false; },
                    validate: function() {
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
                                var value = field.getValue();

                                if (!Ext.isEmpty(Ext.String.trim(value))) {
                                    field.reset();

                                    me.valuesStore.add({
                                        value: value
                                    });


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
                    width: 300,
                    hideMode: 'display',
                    fieldLabel: 'Values',
                    emptyText: 'Add another',
                    checkDirty: Ext.emptyFn,
                    isDirty: function () { return false; },
                    validate: function() {
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
                    xtype: 'grid',
                    width: 300,
                    disableSelection: true,
                    hideHeaders: true,
                    store: this.valuesStore,
                    plugins: [{
                        ptype: 'cellediting',
                        clicksToEdit: 1
                    }],
                    viewConfig: {
                        stripeRows: false,
                        onRowFocus: Ext.emptyFn
                    },
                    columns: [{
                        dataIndex: 'value',
                        text: 'Value',
                        flex: 1,
                        editor: me.isEdit() ? {
                            xtype: me.record.get('dataType') === 'Number' ? 'numberfield' : 'textfield',
                            hideTrigger: true,
                            ignoreParentFormTracking: true,
                            keyNavEnabled: false,
                            mouseWheelEnabled: false,
                            checkDirty: Ext.emptyFn,
                            isDirty: function () { return false; },
                            validate: function() {
                                var me = this,
                                    isValid = me.isValid();
                                if (isValid !== me.wasValid) {
                                    me.wasValid = isValid;
                                }
                                return isValid;
                            }
                        } : undefined
                    }, {
                        xtype: 'templatecolumn',
                        text: 'Actions',
                        tdCls: 'taco-actioncolumn',
                        width: 26,
                        tpl: ['<div class="taco-actioncolumn-icon taco-actioncolumn-icon-remove"></div>']
                    }],
                    listeners: {
                        cellclick: function (view, td, cellIndex, record, tr, rowIndex, e) {
                            if (cellIndex === 1 && e.getTarget('.taco-actioncolumn-icon-remove', 10)) {
                                view.getStore().remove(record);
                            }
                        }
                    }
                // }, {
                //     xtype: 'optionvalueeditor',
                //     getDataType:function () {
                //         return me.form.findField('dataType').getValue() == 'String' ?'string' :'number';
                //     },
                //     store: this.valuesStore
                }];
            },

            'TextBox': function (statics) {
                var attributeType = statics.fieldCfg.attributeType,
                    dataType = statics.fieldCfg.dataType;

                attributeType.readOnly = dataType.readOnly = this.isEdit();
                
                return [
                    attributeType,
                    dataType,
                {
                    xtype: 'container',
                    width: 308,
                    defaults: this.defaults,
                    items: [{
                        fieldLabel: 'Min char/val',
                        xtype: 'numberfield',
                        hideTrigger: true,
                        name: 'min'
                    }, {
                        fieldLabel: 'Max char/val',
                        xtype: 'numberfield',
                        hideTrigger: true,
                        name: 'max'
                    }],
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
                }];
            },

            'TextArea': function (statics) {
                var attributeType = statics.fieldCfg.attributeType;

                attributeType.readOnly = this.isEdit();

                return [
                    attributeType,
                {
                    xtype: 'container',
                    width: 308,
                    defaults: this.defaults,
                    items: [{
                        xtype: 'numberfield',
                        fieldLabel: 'Max char.',
                        hideTrigger: true,
                        name: 'max'
                    }],
                    listeners: {
                        boxready: function () {
                            this.doLayout();
                        },
                        scope: this
                    }
                }];
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

                return [{
                    xtype: 'checkboxgroup',
                    name: 'includeTime',
                    inputValue: true,
                    boxLabel: 'Include time selector',
                    readOnly: this.isEdit()
                },
                attributeType,
                {
                    xtype: 'container',
                    width: 339,
                    fieldLabel: 'Range',
                    cls: 'taco-date-value-input',
                    items: [{
                        xtype: 'datefield',
                        name: 'minDate'
                    }, {
                        xtype: 'label',
                        text: 'to'
                    }, {
                        xtype: 'datefield',
                        name: 'maxDate'
                    }],
                    listeners: {
                        boxready: function () {
                            this.doLayout();
                        },
                        scope: this
                    }
                }];
            }
        }
    },

    initComponent: function () {

        this.buildFormComponents();



        this.valuesStore = this.record.getAttributeValues();
        this.valuesStore.rejectChanges();
        
        this.stores = [this.valuesStore];

        this.title = this.record.data.name;
        this.callParent(arguments);
        

       
        if (this.record.get('inputType')) {
            this.setAttributeInputType(this.record.get('inputType'));
        }
    },

    buildFormComponents: function () {

        this.subform = Ext.create('Taco.core.ux.form.Form', {
            defaults: this.defaults,
            header: false,
            listeners: {
                afterload: function () {
                    var attributeField = this.getForm().findField('attributeType');

                    if (!attributeField || !attributeField.isSelectField) {
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

       

        this.items = [{
            fieldLabel: 'Name',
            name: 'name',
            allowBlank: false,
            emptyText: 'Enter an attribute name',
            width: 300,
            enableKeyEvents: true,
            listeners:{
                keyup: function(field, e, eOpts) {
                    var adminName = this.findField('adminName');
                    if ( !adminName.getValue() ||  (!this.record.get('adminName') && !field.hadKeyEvent) ) {
                        adminName.setValue(field.getValue());
                    }
                },
                scope:this
            }
        }, {
            fieldLabel: 'Administration Name',
            name: 'adminName',
            allowBlank: false,
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
            xtype: 'selectfield',
            fieldLabel: 'Input Type',
            name: 'inputType',
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
            }
        }, this.subform];
        


        
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
    }
})