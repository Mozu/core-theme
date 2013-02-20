/**
 * @class Taco.view.attribute.Form
 * @author Travis Johnson
 */

Ext.define('Taco.view.attribute.Form', {
    extend: 'Taco.core.ux.form.Form',

    
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
                    ['Numeric', 'Number']
                ]
            }
        },
        subformCfg: {
            'List': function (statics) {
                return [{
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Attribute Type',
                    vertical: true,
                    columns: 1,
                    items: [
                        {boxLabel: 'Option', name: 'isOption', inputValue: true},
                        {boxLabel: 'Property', name: 'isProperty', inputValue: true},
                        {boxLabel: 'Extra', name: 'isExtra', inputValue: true}
                    ]
                },
                statics.fieldCfg.dataType, 
                {
                    xtype: 'component',
                    fieldLabel: 'Values',
                    html: 'Values...TBD'
                }];
            },

            'TextBox': function (statics) {
                return [
                    statics.fieldCfg.attributeType,
                    statics.fieldCfg.dataType,
                {
                    fieldLabel: 'Min char/val',
                    name: 'min'
                }, {
                    fieldLabel: 'Max char/val',
                    name: 'max'
                }, {
                    fieldLabel: 'Input validation',
                    name: 'regex',
                    emptyText: 'RegEx'
                }];

            },

            'TextArea': function (statics) {
                return [
                    statics.fieldCfg.attributeType,
                {
                    fieldLabel: 'Rows',
                }, {
                    fieldLabel: 'Max char.'
                }];
            },

            'YesNo': function (statics) {
                return [statics.fieldCfg.attributeType];
            },

            'Date': function (statics) {
                return [{
                    xtype: 'checkboxgroup',
                    name: 'includeTime',
                    inputValue: true,
                    boxLabel: 'Include time selector'
                },
                statics.fieldCfg.attributeType,
                {
                    xtype: 'selectfield',
                    name: 'dateForm'
                }, {
                    xtype: 'datefield',
                    name: 'min'
                }, {
                    xtype: 'datefield',
                    name: 'max'
                }];
            }
        }
    },

    initComponent: function () {

        this.buildFormComponents();

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
        var buildForms = this.statics().subformCfg[value];

        if (!buildForms) {
            return;
        }

        this.subform.removeAll();

        this.subform.add(buildForms.apply(this, [this.statics()]));


        this.subform.loadForm(this.record);
    }
})