/**
 * The discount editor view
 */
Ext.define('Taco.view.filter.Form', {   
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.model.Attribute',
        'Taco.shared.view.field.AttributePickerField',
        'Taco.model.FilterField',
        'Taco.view.filter.OperatorField',
        'Taco.view.filter.ValueField',
        'Taco.view.filter.Schema'
    ],

    addContentViewPadding:false,

    rejectRecordOnCancel:false,

    originalTitle: true,

    config: {
        // DynamicPreComputed or DynamicRealTime
        fieldRecord :null,
        type:null
    },

    layout: {
        type: "vbox",
        align:"stretch"
    },
    
    //createTitle: 'Create Filter',

    //editTitle: '{[values.record.data.name]}',

    initComponent: function () {
        var me = this;
        
        this.callParent(arguments);

        this.mon(me, 'boxready', function() {

            // if the left member is "properties." we will end up with two fields that define the left member;

            var fieldStoreCfg = Taco.filter.getFieldStoreCfg();
            this.fieldStore = Ext.create('Ext.data.Store', fieldStoreCfg);
            // filter out the real time fields from the dynamicPrecomputedExpressions
            if (this.getType() === "DynamicPreComputed") {
                this.fieldStore.filterBy(function (filter) {
                    var retVal = (filter.get("filterType") !== "DynamicRealTime");
                    return retVal;
                });
            }



            // if we have a fieldRecord then init the ui. otherwise call to get field record;
            var fieldValue = this.record.get("left").toLowerCase();
            var fieldRecord = this.fieldStore.getById(fieldValue);
            var isAttributeProperty = this.isAttributeProperty(fieldValue);

            if (fieldRecord) {
                this.setFieldRecord(fieldRecord);
                this.initUI();
            } else {

                if (isAttributeProperty) {

                    
                    

                        // call to attribute service; init on callback;q
                        var attributeId = this.getAttributeId(fieldValue);
                        if (attributeId) {
                            var attributeRecord = Ext.ModelManager.getModel("Taco.model.Attribute");

                            me.setLoading(true, me.body);
                            attributeRecord.load(attributeId, {
                                failure: function(record, operation) {
                                    Taco.app.fireEvent('setmessage', "Error loading attribute", 'error');
                                    me.setLoading(false, me.body);
                                },
                                success: function(record, operation) {

                                    me.setLoading(false, me.body);
                                    // need to map the attribute record into a filterField model;
                                    me.attributeRecord = record;

                                    me.fieldRecord = me.getFieldRecordFromAttribute(record);

                                    me.initUI();

                                },
                            });
                        }

                

                } else {
                    //error handling;
                }


            }

            //TODO: add a valueStore to collect records for each value in the value field that are entities (product, productType, category) so that the list can display the name instead of the code;

        }, me);
    },

    getFieldRecordFromAttribute: function (record) {
        
        var me = this,
            uicontrol = null,
            editorCfg = null,
            meta = record.data.attributeMetadata;

        if (meta && meta.length) {
            uicontrol = Ext.Array.findBy(meta, function (item) {
                if (item.key == "uicontrol") {
                    return item.value.toLowerCase();
                }
                return false;
            }, me);
           
            if (uicontrol) {
                editorCfg = {
                    xtype: "taco-producttypepickerfield",
                    isPickerField: true
                }
            }
        }
        
        if (!editorCfg) {
            editorCfg = (record.data.inputType === "List") ? { xtype: "combo", displayField: "value" } : null;
        }


        var dataType = record.data.dataType.toLowerCase();

        // map the attribute data types to the ones we support
        dataType = (dataType == "number") ? "float" : dataType;
        dataType = (dataType == "bool") ? "boolean" : dataType;


        var fieldRecord = Ext.create('Taco.model.FilterField', {
            id: record.data.code,
            field: record.data.code,
            text: record.data.name,
            defaultValue: "",
            dataType: dataType,
            supportedOperators: [],
            validEnumValues: record.data.values,
            editorCfg: editorCfg,
            //filterType: "DynamicPreComputed" },
            allowBlank:false
        });

        

        // if the attribute requires a picker override the editorCfg; This will be based on the attributeMetadata
        // if the inputType=="List" set the editorCfg to combo that loads the validEnumValues;

        
        return fieldRecord;

        /*
        adminName: "availability"
        attributeId: 0
        attributeMetadata: Array[0]
        code: "availability"
        dataType: "String"
        displayGroup: "Admin"
        id: "tenant~availability"
        inputType: "List"
        isActive: false
        isExtra: false
        isOption: false
        isProperty: true
        isRequired: false
        isVisible: false
        max: ""
        maxDate: ""
        min: ""
        minDate: ""
        name: "Availability"
        regex: ""
        rows: ""
        valueType: "Predefined"
        values: Array[9]                            
        */


    },

    initUI : function() {
        var me = this;    

        var fieldValue = this.record.get("left").toLowerCase();

        
        if (this.fieldRecord) {

        } else {

            //    var fieldRecord = this.fieldStore.getById(fieldValue);
            //    this.setFieldRecord(fieldRecord);
        }



        var leftFieldValue = (fieldValue && fieldValue.indexOf("properties.") === 0) ? "properties." : fieldValue;

        
        this.leftField = Ext.widget({
            //    xtype: 'filterfield',
            xtype: "combo",
            //includeAttributeProperties: true,
            name: 'leftField',
            fieldLabel: 'Field',
            width: 300,
            //triggerAction: 'all',
            lastQuery: '',
            valueField: 'id',
            allowBlank: false,
            displayField: 'text',
            queryMode: 'local',
            valueNotFoundText: 'not found',
            editable: false,
            forceSelection: true,
            value: leftFieldValue,
            store: this.fieldStore
        });


        var isAttributeProperty = this.isAttributeProperty(this.leftField.getValue());

        this.attributePickerField = Ext.create('Taco.shared.view.field.AttributePickerField', {
            hidden: !isAttributeProperty,
            disabled: !isAttributeProperty,
            includePropertyAttributes: true,
            includeExtraAttributes: false,
            includeOptionAttributes: false,
            allowBlank: false,
            value:this.getAttributeId(this.record.get("left")),
            fieldLabel: "Attribute"
        });

        this.operatorField = Ext.widget({
            xtype: 'operatorfield',
            width: 300,
            fieldLabel: "Operator",
            value: this.record.get("operator"),
            name: 'operator'
        });

        this.rightField = Ext.create('Taco.view.filter.ValueField', {
            name: "right",
            flex: 1,
            allowBlank: false,
            fieldRecord: this.getFieldRecord(),
            operatorRecord: this.getOperatorRecord(),
            value: this.record.get("right"),
            fieldLabel: "Value"
        });

        this.add([
            this.leftField,
            this.attributePickerField,
            this.operatorField,
            this.rightField
        ]);



        
            me.mon(me.leftField, 'change', me.onFieldChange, me);
            me.mon(me.attributePickerField, 'select', me.onAttributeChange, me);
            me.mon(me.operatorField, 'change', me.onOperatorFieldChange, me);
            me.refreshOperatorField();
        
    },


    attributePropertyPrefix: "properties.",

    isAttributeProperty: function (id) {
        return (id && id.indexOf(this.attributePropertyPrefix) === 0);
    },

    getAttributeId: function (id) {
        var attId = "";
        if (this.isAttributeProperty(id)) {
            attId = id.slice(this.attributePropertyPrefix.length);
        }
        return attId;
    },

    // state of this field is driven by the field and operator
    //refreshValueField: function () {
    //    var me = this,
    //        leftValue,
    //        operatorValue,
    //        fieldRecord,
    //        operatorRecord;


    //    leftValue = this.leftField.getValue();
    //    operatorValue = this.operatorField.getValue();

    //    fieldRecord = this.fieldStore.getById(leftValue);
    //    operatorRecord = Taco.filter.operatorStore.getById(operatorValue);

    //    this.rightField.setFieldRecord(fieldRecord);
    //    this.rightField.setOperatorRecord(operatorRecord);
    //},

    getOperatorRecord : function() {
        var me = this,
            operatorValue = (this.operatorField) ? this.operatorField.getValue() : this.record.get("operator");

        return Taco.filter.operatorStore.getById(operatorValue);
    },

    onOperatorFieldChange: function (field, newValue, oldValue, eOpts ) {
        var me = this,
            operatorRecord;
        

        operatorRecord = this.getOperatorRecord();
        this.rightField.setOperatorRecord(operatorRecord);
    },

    refreshOperatorField: function() {
        var me = this,
            fieldRecord = this.getFieldRecord();

        //leftValue = leftValue || this.record.get("left");

        if (this.operatorField) {
            this.operatorField.setDisabled(!fieldRecord);
        }

        if (!fieldRecord) {
            return;
        }

        // first check to see if the field has specified supporte operators
        var supportedOperators = fieldRecord.get("supportedOperators");

        
        if (supportedOperators.length == 0) {
            // get the operators based on the editorCfg or by using the dataType;
            var type = (fieldRecord.editorCfg && fieldRecord.editorCfg.isPickerField) ? "pickerfield" : fieldRecord.get("dataType");
            supportedOperators = Taco.filter.getOperatorByType(type);
        }

        if (this.operatorField) {
            this.operatorField.setSupportedOperators(supportedOperators);
        }
    },

    beforeSave: function () {

        var operator = this.operatorField.getValue();
        this.record.set("operator", operator);

        var leftValue = this.leftField.getValue();
        var attributeValue = this.attributePickerField.getValue();

        var newLeftValue = leftValue;

        if (leftValue == "properties.") {
            newLeftValue = leftValue + attributeValue;
        }
        this.record.set("left", newLeftValue);

        var rightValue = this.rightField.getValue();
        this.record.set("right", rightValue);

        return true;
    },

    //getFieldRecord: function () {
    //    var me = this,
    //        fieldRecord,
    //        fieldValue = (this.leftField) ? this.leftField.getValue() : this.record.get("left");

        
    //        fieldRecord = Taco.filter.fieldStore.getById(fieldValue);
        


    //    return fieldRecord;
    //},

    doFieldChange: function(fieldRecord) {
        this.setFieldRecord(fieldRecord);
        this.refreshOperatorField();
        this.rightField.setFieldRecord(fieldRecord);
    },
    
    // when user changes which attribute is selected;
    onAttributeChange: function (combo, records) {
        var me = this;
        

        me.attributeRecord = records[0];
        var fieldRecord = me.getFieldRecordFromAttribute(me.attributeRecord);

        // update the operators for attribute

        me.doFieldChange(fieldRecord);

    },

    // when user changes which field is selected (static or attribute)
    onFieldChange: function (field, newValue, oldValue, e) {
        var me = this,
            isAttributeProperty = this.isAttributeProperty(newValue);
        
        // store the field locally
        var fieldRecord = this.fieldStore.getById(newValue);
        
        this.attributePickerField.setVisible(isAttributeProperty);
        
        this.attributePickerField.setDisabled(!isAttributeProperty);
        
        // if no field record, the left field isn't valid or the field is a attribute and we need to get the attribute record before procedding.
        if (isAttributeProperty) {
            // call attribute service and then doFieldChange on Callback
            this.doFieldChange(null);
        } else {
            this.attributePickerField.reset();
            this.doFieldChange(fieldRecord);
        }
    },

    
    onDestroy: function () {
        var me = this;
        this.callParent(arguments);
    }
});
