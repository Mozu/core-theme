/**
 * @class  Taco.view.filter.Schema
 */

Ext.define('Taco.view.filter.Schema', {
    singleton: true,
    alternateClassName: "Taco.filter",
    required: [
        'Ext.data.Store'
    ],

    // Override this config when we i18L
    operatorData: [
        { id: "eq", text: "Is equal to: " },
        { id: "ne", text: "Does not equal: " },
        { id: "req", text: "Is equal to: ", recurse: true }, //Note: req is going to be defined by a seperate checkbox field when the user selects the eq. operator.
        { id: "lt", text: "Is less than: " },
        { id: "le", text: "Is less than or equal to: " },
        { id: "gt", text: "Is greater than: " }, 
        { id: "ge", text: "Is greater than or equal to: " },
        { id: "in", text: "Is one of the following: " }
        
    ],

    // Override this config when we i18L
    /*
     * config options:
     * id: the key for the lookup. will be all lower case and the store will be case insensitive with regard to the id's
     * field: Same as the id but Camel case for readability in the code editor.
     * text: the label used for display in the ui
     * defaultValue :  The default value to use when no valud is provided;
     * supportedOperators: Which operators do we currently support for this field. This can be optionaly over riden by the instance.
     * editorCfg: optional field config to apply to the field based on the data type. 
     * dataType: value type for this field. Determines the default type of field to use.
     * allowBlank: whether to allow the field to be left blank. will set the field as required or not.
     * validator: optional validation method,
     * validEnumValues: optional set of possible values; Typically used when the ui config is a combo.
    */

    // note that the attributes dataType values are: "String","Number","DateTime", "Bool"
    // note the inputType values: "Date", "YesNo", "TextBox", "TextArea"
    
    
    /*
        // sample property attribute json
        {
            adminName: "DateAttrProp",
            // for the premade snerst the attributreMeta data tells us to use a product picker instead of a text field.
            attributeMetadata: [{key: "uicontrol", value: "productPicker"}]
                0: {key: "uicontrol", value: "productPicker"}
                key: "uicontrol"
                value: "productPicker"
            code: "DateAttrProp",
            dataType: "DateTime",
            id: "tenant~DateAttrProp",
            inputType: "Date",
            isExtra: false,
            isOption: false,
            isProperty: true,
            isRequired: false,
            isVisible: false,
            name: "DateAttrProp",
            regex: "",
            valueType: "AdminEntered"
        }
    
    */
    fieldData: [
        {
            id: "productcode",
            field: "ProductCode",
            text: "Product code",
            defaultValue: "",
            dataType: "string", 
            supportedOperators: ["eq", "ne", "in"],
            editorCfg: {
                xtype:"textfield"
            },
            allowBlank:false
        }, {
            id: "categories.categorycode",
            field: "Categories.CategoryCode",
            text: "Category code",
            defaultValue: "",
            dataType: "string",
            supportedOperators: ["eq", "req", "ne", "in"],
            editorCfg: {
                xtype: "textfield"
            },
            allowBlank: false
        }, {
            id: "producttypeid",
            field: "ProductTypeId",
            text: "Product type id",
            defaultValue: "",
            dataType: "string",
            supportedOperators: ["eq", "ne", "in"],
            editorCfg: {
                xtype: "textfield"
            },
            allowBlank: false
        }, {
            id: "price.cataloglistprice",
            field: "Price.CatalogListPrice",
            text: "List price",
            defaultValue: "",
            dataType: "float",
            supportedOperators: ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            editorCfg: {
                xtype: "currencyfield"
            },
            allowBlank: false
        }, {
            id: "price.catalogsaleprice",
            field: "Price.CatalogSalePrice",
            text: "Sale price",
            defaultValue: "",
            dataType: "float",
            supportedOperators: ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            editorCfg: {
                xtype: "currencyfield"
            },
            allowBlank: false
        }
    ],

    fieldStoreCfg: {
        makeIdCaseInsensitive: true,
        fields: [
            { name: "id", type: "string", convert: function(value, record) {
                // force the id's lower case this store's id's need to be case insensitive;
                return value.toLowerCase();
            }},
            { name: "field", type: "string" },
            { name: "text", type: "string" },
            { name: "defaultVAlue", type: "auto" },
            { name: "dataType", type: "string" },
            { name: "supportedOperators", type: "array" },
            { name: "editorCfg", type: "object" },
            { name: "allowBlank", type: "boolean" }
        ]
    },

    // the default editor configs used to set the value for the fields based on the dataType of the field.
    // if the field needs anything specific (currency or a picker field) those will be set in the editorCfg in the fieldData json
    editorCfgs: {
        "string": {
            xtype:"textfield"
        },
        "float": {
            xtype: "numberfield"
        },
        "int": {
            xtype: "numberfield"
        },
        "date": {
            xtype: "datefield"
        }
    },

    getFieldStoreCfg: function () {
        return Ext.Object.merge({
            data: Ext.Array.clone(this.fieldData)
        }, this.fieldStoreCfg);
    },


    init: function() {
        
        // this store is used for label conversion. specifically inside of the expressionTreePanel
        var storeCfg = this.getOperatorStoreCfg();
        this.operatorStore = Ext.create('Ext.data.Store',storeCfg);
        
        var fieldStoreCfg = this.getFieldStoreCfg();
        this.fieldStore = Ext.create('Ext.data.Store', fieldStoreCfg);





/*
        
        ev.RegisterStaticField(
                fieldName: "ProductCode",
                supportedOperators:
                    Expression.PredicateOperator.eq |
                    Expression.PredicateOperator.ne |
                    Expression.PredicateOperator.@in,
 
                dataType: Expression.DataType.@string,
                allowNullOnRight: false);
 
            ev.RegisterStaticField(
                fieldName: "Categories.CategoryCode",
                supportedOperators:
                   Expression.PredicateOperator.eq |
                   Expression.PredicateOperator.req |
                   Expression.PredicateOperator.@in |
                   Expression.PredicateOperator.ne,
                   dataType: Expression.DataType.@string,
                   allowNullOnRight: false);
 
            ev.RegisterStaticField(
                fieldName: "ProductTypeId",
                supportedOperators:
                   Expression.PredicateOperator.eq |
                   Expression.PredicateOperator.@in |
                   Expression.PredicateOperator.ne,
               dataType: Expression.DataType.@int,
               allowNullOnRight: false);
 
 
            ev.RegisterStaticField(
                fieldName: "Price.CatalogListPrice",
                supportedOperators:
                    Expression.PredicateOperator.eq |
                    Expression.PredicateOperator.ne |
                    Expression.PredicateOperator.gt |
                    Expression.PredicateOperator.ge |
                    Expression.PredicateOperator.@in |
                    Expression.PredicateOperator.lt |
                    Expression.PredicateOperator.le,
                  dataType: Expression.DataType.@decimal,
                  allowNullOnRight: false);
 
            ev.RegisterStaticField(
                fieldName: "Price.CatalogSalePrice",
                supportedOperators:
                    Expression.PredicateOperator.eq |
                    Expression.PredicateOperator.ne |
                    Expression.PredicateOperator.gt |
                    Expression.PredicateOperator.ge |
                    Expression.PredicateOperator.@in |
                    Expression.PredicateOperator.lt |
                    Expression.PredicateOperator.le,
                    dataType: Expression.DataType.@decimal,
                    allowNullOnRight: true);
 
            ev.RegisterStaticField(
                fieldName: "DaysAvailableInCatalog",
                supportedOperators:
                    Expression.PredicateOperator.eq |
                    Expression.PredicateOperator.ne |
                    Expression.PredicateOperator.gt |
                    Expression.PredicateOperator.ge |
                    // Note: This one deferred. Expression.PredicateOperator.@in |
                    Expression.PredicateOperator.lt |
                    Expression.PredicateOperator.le,
                 dataType: Expression.DataType.@int,
                 allowNullOnRight: false);
 
            ev.RegisterStaticField(
                fieldName: "FulfillmentTypesSupported",
                supportedOperators:
                    Expression.PredicateOperator.eq |
                    Expression.PredicateOperator.ne |
                    Expression.PredicateOperator.@in,
                dataType: Expression.DataType.@string,
                allowNullOnRight: false,
                validEnumValues: new string[] { "DirectShip", "InStorePickup", "Digital" });
 
 
 
            ev.RegisterStaticField(
                fieldName: "Measurements.PackageWeight.Value",
                supportedOperators:
                    Expression.PredicateOperator.eq |
                    Expression.PredicateOperator.ne |
                    Expression.PredicateOperator.gt |
                    Expression.PredicateOperator.ge |
                    Expression.PredicateOperator.@in |
                    Expression.PredicateOperator.lt |
                    Expression.PredicateOperator.le,
                dataType: Expression.DataType.@decimal,
                allowNullOnRight: true);
 
            ev.RegisterStaticField(
                fieldName: "Measurements.PackageHeight.Value",
                supportedOperators:
                    Expression.PredicateOperator.eq |
                    Expression.PredicateOperator.ne |
                    Expression.PredicateOperator.gt |
                    Expression.PredicateOperator.ge |
                    Expression.PredicateOperator.@in |
                    Expression.PredicateOperator.lt |
                    Expression.PredicateOperator.le,
                dataType: Expression.DataType.@decimal,
                allowNullOnRight: true);
 
            ev.RegisterStaticField(
                fieldName: "Measurements.PackageWidth.Value",
                supportedOperators:
                    Expression.PredicateOperator.eq |
                    Expression.PredicateOperator.ne |
                    Expression.PredicateOperator.gt |
                    Expression.PredicateOperator.ge |
                    Expression.PredicateOperator.@in |
                    Expression.PredicateOperator.lt |
                    Expression.PredicateOperator.le,
                dataType: Expression.DataType.@decimal,
                allowNullOnRight: true);
 
            ev.RegisterStaticField(
                fieldName: "Measurements.PackageLength.Value",
                supportedOperators:
                    Expression.PredicateOperator.eq |
                    Expression.PredicateOperator.ne |
                    Expression.PredicateOperator.gt |
                    Expression.PredicateOperator.ge |
                    Expression.PredicateOperator.@in |
                    Expression.PredicateOperator.lt |
                    Expression.PredicateOperator.le,
                dataType: Expression.DataType.@decimal,
                allowNullOnRight: true);
 
 
            ev.RegisterDynamicField(
                fieldPrefix: "properties.",
                supportedOperators:
                    Expression.PredicateOperator.eq |
                    Expression.PredicateOperator.ne |
                    Expression.PredicateOperator.gt |
                    Expression.PredicateOperator.ge |
                    Expression.PredicateOperator.@in |
                    Expression.PredicateOperator.le |
                    Expression.PredicateOperator.lt,
                    allowNullOnRight: true);
 
RealTime Only: above +
 
            ev.RegisterStaticField(
                fieldName: "Price.SalePrice",
                supportedOperators:
                    Expression.PredicateOperator.eq |
                    Expression.PredicateOperator.ne |
                    Expression.PredicateOperator.gt |
                    Expression.PredicateOperator.ge |
                    Expression.PredicateOperator.@in |
                    Expression.PredicateOperator.lt |
                    Expression.PredicateOperator.le,
                dataType: Expression.DataType.@decimal,
                allowNullOnRight: true);
 
 
            ev.RegisterStaticField(
                fieldName: "Price.SaleType",
                supportedOperators:
                    Expression.PredicateOperator.eq |
                    Expression.PredicateOperator.ne |
                    Expression.PredicateOperator.@in,
                dataType: Expression.DataType.@string,
                allowNullOnRight: true,
                validEnumValues: new string[] {  "CatalogSalePrice", "DiscountedList", "DiscountedCatalogSalePrice" });


        */


    },

    
    // cfg: optional
    // cfg.includedOperators:[] // specific list of operators to include
    // cfg.excludedOperators:[] // specific list of operators to remove from the default list
    

    //getOperator: function (key, cfg) {
    //    var cfg = Ext.apply(this.getOperatorCfg(key), cfg);
    //    return this.buildField(cfg);
    //},

    operatorStoreCfg : {
        fields: [
            { name: "id", type: "string" },
            { name: "text", type: "string" },
            { name: "recurse", type: "boolean" }
        ]
    },

    
    getOperatorStoreCfg: function () {
        return Ext.Object.merge({
            data: Ext.Array.clone(this.operatorData)
        },this.operatorStoreCfg);
    },

    getOperatorCfg : function(key) {
        return Ext.clone(this.operators.getByKey(key));
    },

    getFilter : function(id) {
        
    },
    constructor: function () {
        this.init();

        this.callParent(arguments);
    }
},function() {
   // Taco.filter = this;
});