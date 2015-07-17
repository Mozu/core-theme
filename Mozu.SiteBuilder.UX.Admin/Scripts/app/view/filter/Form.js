/**
 * The discount editor view
 */
Ext.define('Taco.view.filter.Form', {   
    extend: 'Taco.core.ux.form.Form',
    requires: [
      'Taco.view.filter.OperatorField',
      'Taco.view.filter.Schema'
    ],

    addContentViewPadding:false,

    rejectRecordOnCancel:false,

    createTitle: 'Create Filter',

    editTitle: '{[values.record.data.name]}',

    initComponent: function () {
        var me = this;
        // if the left member is "properties." we will end up with two fields that define the left member;

        

        var fieldStoreCfg = Taco.filter.getFieldStoreCfg();

        this.fieldStore = Ext.create('Ext.data.Store', fieldStoreCfg);

        var fieldValue = this.record.get("left").toLowerCase();
        
        this.leftField = Ext.widget({
            xtype: 'combobox',
            name: 'leftField',
            fieldLabel: 'Field',
            width: 300,
            valueField: 'id',
            displayField: 'text',
            queryMode: 'local',
            valueNotFoundText: 'not found',
            editable: false,
            forceSelection: true,
            value: fieldValue,
            store: this.fieldStore
        });

        this.operatorField = Ext.widget({
            xtype: 'operatorfield',
            fieldLabel: "Operator",
            value: this.record.get("operator"),
            name: 'operator'
        });

        this.rightField = Ext.create('Ext.form.field.Text', {
            name: "right",
            value: this.record.get("right"),
            fieldLabel: "Value"
        });

        this.items = [
            this.leftField,
            this.operatorField,
            this.rightField
        ];

        this.callParent(arguments);

        this.mon(me, 'boxready', function() {
            me.mon(me.leftField, 'change', this.onFieldChange, me);
            // reset the operator field based on the current field value;
            me.refreshOperatorField();
            // reset the value field based on the curretn field and operator 
            me.refreshValueField();
        }, me);
    },

    // state of this field is driven by the field and operator
    refreshValueField: function () {
        var me = this,
            leftValue,
            operatorValue,
            fieldRecord,
            operatorRecord,
            rightFieldDisabled;

        

        leftValue = this.leftField.getValue();
        operatorValue = this.operatorField.getValue();

        rightFieldDisabled = (!leftValue || !operatorValue);

        this.rightField.setDisabled(rightFieldDisabled);
        if (rightFieldDisabled) {
            return;
        }


        fieldRecord = this.fieldStore.getById(leftValue);
        operatorRecord = Taco.filter.operatorStore.getById(operatorValue);


         
        

    },

    refreshOperatorField: function (leftValue) {
        var me = this,
            fieldRecord;

        leftValue = leftValue || this.record.get("left");

        if (this.operatorField) {
            this.operatorField.setDisabled(!leftValue);
        }

        if (!leftValue) {
            return;
        }

        fieldRecord = this.fieldStore.getById(leftValue);

        if (!fieldRecord) {
            console.error(" error:" + leftValue + " is not a valid field");
            return;
        }

        var supportedOperators = fieldRecord.get("supportedOperators");

        if (this.operatorField) {
            this.operatorField.setSupportedOperators(supportedOperators);
        }
    },

    onFieldChange: function (field, newValue, oldValue, e) {
        var me = this
        this.refreshOperatorField(newValue);
    },
    onDestroy: function () {
        var me = this;
        this.callParent(arguments);
    }
});
