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
                var dataType = statics.fieldCfg.dataType;

                dataType.readOnly = this.isEdit();

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
                dataType, 
                {
                    xtype: 'component',
                    fieldLabel: 'Values',
                    html: 'Values...TBD'
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
                        //xtype: 'textfield',
                        name: 'min'
                    }, {
                        fieldLabel: 'Max char/val',
                        //xtype: 'textfield',
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