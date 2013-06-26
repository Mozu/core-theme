/**
 * @class Taco.view.attribute.Form
 * @author Travis Johnson
 */

Ext.define('Taco.view.attribute.Form', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.view.option.valueEditor.MultiValue', 'Taco.core.ux.form.FlexBox'],

    
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
                isDirty:function() { return false; },
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
                ]
            }
        },
        subformCfg: {
            'List': function (statics) {
                var dataType = statics.fieldCfg.dataType;

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
                    xtype: 'optionvalueeditor',
                    store: this.valuesStore
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
                    xtype: 'formflexbox',
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
                    xtype: 'formflexbox',
                    width: 308,
                    defaults: this.defaults,
                    items: [{
                        xtype: 'numberfield',
                        fieldLabel: 'Rows',
                        hideTrigger: true,
                        name: 'rows'
                    }, {
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
                    xtype: 'formflexbox',
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

        this.stores = [this.valuesStore];

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
            enableKeyEvents :true,
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