/**
 * @class Taco.view.discount.AdvancedSearchForm
 */
Ext.define('Taco.view.attribute.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.FieldContainer',
        'Taco.core.ux.form.DateTime'
    ],

    defaults: {
        width:500,
        xtype: 'textfield'
    },
    initComponent: function () {
        var me = this;

        this.items = [
            {
                name: 'keyword',
                fieldLabel: 'Keyword Search'
            }, {
                name: 'adminName',
                fieldLabel: 'Administration Name'
            }, {
                name: 'name',
                fieldLabel: 'Name'
            }, {
                xtype: 'combobox',
                name: 'type',
                fieldLabel: 'Type',
                flex: 1,
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: false,
                forceSelection: true,
                initialValue: "Active",
                trigger2Cls: 'x-form-clear-trigger',
                onTrigger2Click: function () {
                    this.clearValue();
                },
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        {
                            name: "Property",
                            id: "Property"
                        }, {
                            name: "Option",
                            id: "Option"
                        }, {
                            name: "Extra",
                            id: "Extra"
                        }, {
                            id: "isvaluemappingattribute",
                            name: "Mapping Attribute"
                        }
                    ]
                })
            }, {
                xtype: 'combobox',
                name: 'inputType',
                fieldLabel: 'Input Type',
                flex: 1,
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: false,
                forceSelection: true,
                initialValue: "Active",
                trigger2Cls: 'x-form-clear-trigger',
                onTrigger2Click: function () {
                    this.clearValue();
                },
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        {
                            name: "List",
                            id: "List"
                        }, {
                            name: "Text Box",
                            id: "TextBox"
                        }, {
                            name: "Yes No",
                            id: "YesNo"
                        }, {
                            name: "Date",
                            id: "Date"
                        }
                    ]
                })
            },
        ];
            
        this.callParent(arguments);
    }
});