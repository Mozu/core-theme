/**
 * The operator field is used when defining the filter.
 */
Ext.define('Taco.view.filter.OperatorField', {   
    extend: 'Ext.form.FieldContainer',
    alias:"widget.operatorfield",
    requires: [
        'Taco.view.filter.Schema',
        'Ext.form.field.ComboBox'
    ],

    config: {
        fieldLabel: "Operator",
        fieldCfg: null,
        allowBlank: false,
        value: null,
        supportedOperators: [
            "eq", "ne", "req", "lt", "le", "gt", "ge", "in"
        ],
        recurseText: 'Include Child Categories'
    },

    layout:"vbox",

    initComponent: function () {
        var me = this;
        
        var storeCfg = Taco.filter.getOperatorStoreCfg();
        this.store = Ext.create('Ext.data.Store', storeCfg);

        this.recurseField = Ext.widget({
            name: 'recurseField',
            width: "100%",
            xtype: 'checkboxfield',
            hidden: !this.isRecursiveOperator(this.value),
            boxLabel: this.recurseText
        });

        // recursive equal and eq share the same combo value;
        var comboValue = (this.value && this.value == "req") ? "eq" : this.value;

        this.operatorCombo = Ext.widget({
            xtype: 'combobox',
            name: 'operatorCombo',
            width: "100%",
            valueField: 'id',
            displayField: 'text',
            allowBlank: this.allowBlank,
            queryMode: 'local',
            valueNotFoundText: '',
            editable: false,
            lastQuery:"",
            forceSelection: true,
            initialValue: "Active",
            value: comboValue,
            listeners: {
                scope:me,
                'change' : this.onOperatorChange
            },
            store: this.store
        });

        this.items = [
            this.operatorCombo,
            this.recurseField
        ];

        this.callParent(arguments);

        this.relayEvents(this.operatorCombo, ["change"]);

    },

    getValue: function () {
        var value = (this.operatorCombo) ? this.operatorCombo.getValue() : null;
        if ((value == "eq") && this.recurseField.getValue()) {
            // check to see if the recursive checkbox is checked. if so we are "req" instead of "eq"
            value = "req";
        }
        return value;
    },

    setValue: function (value) {
        this.value = value;
        var comboValue = value;
        
        if (!value) {
            this.recurseField.setVisible(false);
        }

        this.recurseField.setVisible(this.isRecursiveOperator(value));

        // if this is a recursive field we alwasys set the combo value to eq. the checkbox will decide between req and eg when we out put the value;
        if (this.isRecursiveOperator(value)) {
            comboValue = "eq";
        }
            
        this.operatorCombo.setValue(comboValue);
    },

    isValid : function() {

        return this.validate();
    },

    validate: function () {

        return (this.getValue());
    },

    isRecursiveAllowed : function() {
        return (Ext.Array.contains(this.getSupportedOperators(), "req"));
    },

    isRecursiveOperator : function(value) {
        value = value || this.getValue();
        return (this.isRecursiveAllowed() && value && (value == "eq" || value == "req"));
    },

    onOperatorChange: function (field, newValue, oldValue, e) {
        if (this.recurseField) {
            this.recurseField.setVisible(this.isRecursiveOperator(newValue));
        }
    },

    // when the supportedOperators array gets set we need to update the fields;
    updateSupportedOperators: function (supportedOperators) {
        // update the fields on change of the supportedOperators
        if (this.rendered) {
            // toggle the recursive checkbox based on the supportedOperators if its already rendered
            this.recurseField.setVisible((Ext.Array.contains(supportedOperators, "req")));

            // check to see if the current selection is still supported if not, reset it;
            if (!Ext.Array.contains(supportedOperators, this.getValue())) {
                this.setValue("");
            }
        }

        // update the store filter to reflect the newly defined supported operators;
        this.store.clearFilter();
        this.store.filterBy(function (operator) {
            var id = operator.get("id"),
            isSupported = (id != "req" && Ext.Array.contains(supportedOperators, id));
            // remove any unsupported operators and the req operator(its consolidated into the equals option).
            return isSupported;
        }, this);

        return supportedOperators;
    },

    onDestroy: function () {
        var me = this;
        this.callParent(arguments);
    }
});
