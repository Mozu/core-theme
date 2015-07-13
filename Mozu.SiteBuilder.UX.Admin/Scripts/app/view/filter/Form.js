/**
 * The discount editor view
 */
Ext.define('Taco.view.filter.Form', {   
    extend: 'Taco.core.ux.form.Form',
    requires: [
        
    ],

    rejectRecordOnCancel:false,

    createTitle: 'Create Filter',
    editTitle: '{[values.record.data.name]}',

    initComponent: function () {

        var me = this;
        // if the left member is "properties." we will end up with two fields that define the left member;


        this.leftField = Ext.widget({
            xtype: 'combobox',
            name: 'left',
            fieldLabel: 'Field',
            width: 300,
            valueField: 'id',
            displayField: 'name',
            queryMode: 'local',
            valueNotFoundText: 'not found',
            editable: false,
            forceSelection: true,
            initialValue: "Active",
            listeners: {
                scope:me,
                'change' : function() {
                    
                }
            },
            store: Ext.create('Ext.data.Store', {
                fields: ['id', "name"],
                data: [
                    {
                        name: "Category",
                        id: "categoryCode"
                    }, {
                        name: "Not Equals",
                        id: "ne"
                    }, {
                        name: "Greater Than",
                        id: "gt"
                    }, {
                        name: "Greater Than Equal",
                        id: "ge"
                    }, {
                        name: "Less Than",
                        id: "lt"
                    }, {
                        name: "Less Than Equal",
                        id: "le"
                    }
                ]
            })
        });


        this.operatorField = Ext.widget({
            xtype: 'combobox',
            name: 'operator',
            fieldLabel: 'Operator',
            width:120,
            valueField: 'id',
            displayField: 'name',
            queryMode: 'local',
            valueNotFoundText: 'not found',
            editable: false,
            forceSelection: true,
            initialValue: "Active",
            //trigger2Cls: 'x-form-clear-trigger',
            onTrigger2Click: function () {
                this.clearValue();
            },
            store: Ext.create('Ext.data.Store', {
                fields: ['id', "name"],
                data: [
                    {
                        name: "Equals",
                        id: "eq"
                    }, {
                        name: "Not Equals",
                        id: "ne"
                    }, {
                        name: "Greater Than",
                        id: "gt"
                    }, {
                        name: "Greater Than Equal",
                        id: "ge"
                    }, {
                        name: "Less Than",
                        id: "lt"
                    }, {
                        name: "Less Than Equal",
                        id: "le"
                    }
                ]
            })
        });

        this.rightField = Ext.create('Ext.form.field.Text', {
            name: "right",
            fieldLabel: "Value"
        });

        this.items = [
            this.leftField,
            this.operatorField,
            this.rightField
        ];


        this.callParent(arguments);
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});
