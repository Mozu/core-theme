/**
 * The operator field is used when defining the filter.
 */
Ext.define('Taco.view.filter.ValueField', {
    extend: 'Ext.form.FieldContainer',
    alias: "widget.valuefield",
    mixins: {
        field: 'Ext.form.field.Field'
    },


    requires: [
        'Taco.view.filter.Schema',
        'Taco.core.ux.form.DateTime',
        'Ext.form.field.Text',
        'Ext.form.field.TextArea',
        'Ext.form.field.Number',
        'Ext.form.field.Date',
        'Ext.form.field.ComboBox',
        'Taco.core.ux.form.CurrencyField',
        'Taco.view.filter.MultiSelectorField',
        'Taco.shared.view.field.ProductPickerField',
        'Taco.shared.view.field.ProductTypePickerField'
    ],

    config: {
        fieldLabel: "Value",
        fieldRecord: null,
        operatorRecord: null,
        allowBlank: true,
        name: "",
        value: null
    },

    layout: {
        type:"vbox",
        align:"stretch"
    },

    initComponent: function() {
        var me = this;
        this.items = [];

        this.updateFieldEditability();
        this.createField();

        this.callParent(arguments);
    },

    // when we have a multi value situation;
    createMultiField: function () {
        var me = this,
            previousFieldXtype,
            fieldCfg = this.getFieldConfig(),
            value = (this.field) ? this.field.getValue() : this.value;

        if (this.field) {
            if (this.fieldRelayers) {
                Ext.destroy(this.fieldRelayers);
            }
            previousFieldXtype = this.field.xtype;
            Ext.destroy(this.field);
        }


        this.field = Ext.create('Taco.view.filter.MultiSelectorField', {
            valueType: this.fieldRecord.get("dataType"),
            singleSelect: this.operatorRecord.get("id") != "in",
            fieldCfg:fieldCfg,
            flex: 1,
            emptyText:fieldCfg.emptyText || "",
            value:value
        });

        this.initRelayEvents();

        if (this.rendered) {
            this.add(this.field);
        } else {
            this.items.push(this.field);
        }

        
    },

    // when we have a single value situation;
    createField: function () {
        var me = this,
            previousFieldXtype,
            fieldCfg = this.getFieldConfig(),
            value = (this.field) ? this.field.getValue() : this.value,
            operatorRecord = this.getOperatorRecord(),
            fieldRecord = this.getFieldRecord(),
            isDisabled = (!operatorRecord || !fieldRecord),
            opId = operatorRecord.get("id"),
            operatorAllowsBlank = (opId == "eq" || opId == "ne"),
            allowBlank = (fieldCfg.allowBlank && operatorAllowsBlank);
        
        this.setAllowBlank(allowBlank);
        // need to override the field config's allow blank since the operator can force it to be required;
        fieldCfg.allowBlank = allowBlank;

        if (isDisabled) {
            return;
        }

        //if the field is a combo we need to cast values to string since the code editor validation will cast the value to int, but the cat. service returns the id's in string format.
        if (fieldCfg.xtype == "combo") {
            value = this.castValue(value, "string");
        }

        // if we have a multi value situation (ie the "in" operator) then we need to add some ui to store the array of selected values.
        // the field no longer is the ui for displaying the value;
        // if we are using a picker field to select the values we need to show the multiSelectGrid to display the selected value. The persisted value will be the id, but the grid 
        // will display more useful information about the record;
        
        if (operatorRecord && (operatorRecord.get("id") == "in" || fieldCfg.isPickerField)) {
            this.createMultiField();
            return;
        }

        // need to clean up the value when the user switches from an in operator
        if (Ext.isArray(value)) {
            value = "";
        }

        if (this.field) {
            if (this.fieldRelayers) {
                Ext.destroy(this.fieldRelayers);
            }
            previousFieldXtype = this.field.xtype;
            Ext.destroy(this.field);
        }

        //if (value) {
        //    if (previousFieldXtype != "combo") {
        //        fieldCfg.value = previousValue;
        //    }
        //}

        fieldCfg.value = value;


        this.field = Ext.widget(fieldCfg);


        



        this.initRelayEvents();


        

        

        if (this.rendered) {
            this.add(this.field);
        } else {
            this.items.push(this.field);
        }




    },
    

    initRelayEvents: function () {
        if (this.fieldRelayers) {
            Ext.destroy(this.fieldRelayers);
        }
        this.fieldRelayers = this.relayEvents(this.field, ["change"]);
    },

    // checks the state of the fieldRecord and operatorRecord to determine if the operator is editable
    updateFieldEditability : function() {
        var me = this,
            isEditable = (me.fieldRecord && me.operatorRecord);

        if (me.rendered) {
            me.setDisabled(!isEditable);
        } else {
            me.disabled = !isEditable;
        }
    },

    getFieldConfigByDataType: function (dataType, fieldCfg) {
        var me = this,
            fieldCfg = fieldCfg || {};
        
        switch (dataType) {
            case "string":
                Ext.apply(fieldCfg, {
                    xtype: "textfield"
                });
                break;
            case "float":
                Ext.apply(fieldCfg, {
                    xtype: "numberfield",
                    hideTrigger: true,
                    allowDecimals: true,
                    //minValue: 0,
                    mouseWheelEnabled: true,
                    selectOnFocus: true
                });
                break;
            case "int":
                Ext.apply(fieldCfg, {
                    xtype: "numberfield",
                    hideTrigger: true,
                    allowDecimals:false,
                    //minValue: 0,
                    mouseWheelEnabled: true,
                    selectOnFocus: true
                });
                break;
            case "boolean":
                Ext.apply(fieldCfg, {
                    xtype: "checkbox",
                    boxLabel: "true"
                });
                break;
            case "date":
                Ext.apply(fieldCfg, {
                    xtype: "datefield"
                });
                break;
            case "datetime":
                Ext.apply(fieldCfg, {
                    xtype: "datetime"
                });
                break;
            case "textarea":
                Ext.apply(fieldCfg, {
                    xtype: "textarea"
                });
                break;
        }

        return fieldCfg;

    },

    // fill in any common default values for the field config; can be overwritten in the schema.
    getFieldConfigByXType: function (fieldCfg,fieldRecord) {
        var me = this;

        switch (fieldCfg.xtype) {
            case "combo":
                var displayField = fieldCfg.displayField || "name";
                var valueField = fieldCfg.valueField ||  "id";
                
                Ext.applyIf(fieldCfg, {
                    store: Ext.create('Ext.data.Store', {
                        fields:[valueField,displayField],
                        data: fieldRecord.get("validEnumValues")
                    }),
                    queryMode: 'local',
                    valueNotFoundText: 'not found',
                    editable: false,
                    forceSelection: true,
                    displayField: displayField,
                    triggerOnClick: true,
                    valueField: valueField,
                    width: 300
                });

                

                //validEnumValues


                break;
            case "currencyfield":
                Ext.applyIf(fieldCfg, {
                    currencyCode: Taco.app.context.getCurrent().currencyCode,
                    forcePrecision: true,
                    unitAtEnd: false,
                    hideTrigger: true,
                    width: 100,
                    minValue: 0
                });
                break;
        }

        return fieldCfg;

    },

    getFieldConfig: function () {
        var me = this,
            fieldRecord = me.getFieldRecord(),
            operatorRecord = me.getOperatorRecord(),
            fieldCfg = {},
            dataType,
            cfg;
        
        if (fieldRecord) {
            // if record provides a fieldCfg then use it.
            fieldCfg = fieldRecord.get("editorCfg");

            if (!fieldCfg) {
                // get a fieldCfg based on the dataType
                dataType = fieldRecord.get("dataType");
                fieldCfg = this.getFieldConfigByDataType(dataType);
            } else {
                fieldCfg = this.getFieldConfigByXType(fieldCfg,fieldRecord);
            }
        }

        cfg = Ext.Object.mergeIf({
            
        }, fieldCfg, {
                width:300,
                xtype: "textfield",
                allowBlank: this.fieldRecord.get("allowBlank"),
                name: this.name || "valuefield"
            }
        );

        return cfg;
    },

    updateFieldRecord: function (record) {
        var me = this;
        this.updateFieldEditability();
        this.createField();
    },

    updateOperatorRecord: function (record) {
        this.updateFieldEditability();
        this.createField();
    },

    castValue: function (value, castTo) {


        if (!value) {
            return value;
        }

        var dataType = castTo || this.fieldRecord.data.dataType;

        if (dataType == "float") {
            value = parseFloat(value);
        } else if (dataType == "int") {
            value = parseInt(value);
        } else if (dataType == "string") {
            if (!Ext.isString(value)) {
                if (value.toString()) {
                    value = value.toString();
                }
            }
        }

        return value;
    },

    getValue: function () {
        var me = this,
            value = (this.field) ? this.field.getValue() : null;

        // need to cast the value to the dataType since combo converts it to string;

        if (Ext.isArray(value)) {
            Ext.Array.each(value, this.castValue, me);
        } else {
            this.castValue(value);
        }

        return value;
    },

    setValue: function (value) {


        this.value = value;
        this.field.setValue(value);
    },
    isValid: function () {
        return this.validate();
    },
    validate: function () {
        return (this.allowBlank || this.getValue());
    },
    onDestroy: function () {
        var me = this;

        this.callParent(arguments);
    }
});
