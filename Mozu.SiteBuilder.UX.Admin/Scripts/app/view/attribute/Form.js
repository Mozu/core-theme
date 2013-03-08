/**
 * @class Taco.view.attribute.Form
 * @author Travis Johnson
 */

Ext.define('Taco.view.attribute.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.view.option.valueEditor.MultiValue'],

    
    title: 'Attribute',

    defaults: {
        xtype: 'textfield',
        labelAlign: 'top',
        labelSeparator: '',
    },

    statics: {
        fieldCfg: {
            attributeType: {
                xtype: 'selectfield',
                fieldLabel: 'Attribute Type',
                name: 'attributeType',
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
                    xtype: 'fieldcontainer',
                    defaults: this.defaults,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
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
                    xtype: 'fieldcontainer',
                    defaults: this.defaults,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [{
                        fieldLabel: 'Rows'
                    }, {
                        fieldLabel: 'Max char.'
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
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Range',
                    layout: {
                        align: 'stretch',
                        type: 'hbox'
                    },
                    items: [{
                        xtype: 'datefield',
                        name: 'min'
                    }, {
                        xtype: 'component',
                        html: 'to'
                    }, {
                        xtype: 'datefield',
                        name: 'max'
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
            emptyText: 'Enter an attribute name'
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
                ['Date', 'Date'],
            ],
            listeners: {
                change: this.onInputTypeChange,
                scope: this
            }
        }, this.subform];
    },

    onInputTypeChange: function (input, value) {
        var buildForms = this.statics().subformCfg[value],
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