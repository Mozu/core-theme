/**
 * @class  Taco.view.filter.Schema
 */

Ext.define('Taco.view.filter.Schema', {
    singleton: true,
    alternateClassName: "Taco.filter",
    requires: [
        'Taco.model.FilterField'
    ],

    // Override this config when we i18L
    operatorData: [
        { id: "eq", text: "is equal to " },
        { id: "ne", text: "does not equal " },
        { id: "req", text: "is equal to (plus its children) ", recurse: true }, //Note: req is going to be defined by a seperate checkbox field when the user selects the eq. operator.
        { id: "lt", text: "is less than " },
        { id: "le", text: "is less than or equal to " },
        { id: "gt", text: "is greater than " }, 
        { id: "ge", text: "is greater than or equal to " },
        { id: "in", text: "is one of the following  " }
        
    ],

    // Override this config when we i18L
    /*
     * config options:
     * id: the key for the lookup. will be all lower case and the store will be case insensitive with regard to the id's
     * field: Same as the id but Camel case for readability in the code editor.
     * filterType: Used to control when a filter is available.
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
            text: "Product Code",
            defaultValue: "",
            dataType: "string", 
            supportedOperators: ["eq", "ne", "in"],
            editorCfg: {
                xtype: "taco-productpickerfield",
                //tells the valueField that we need a multiSelectorGrid to display the selected value since the id we save isn't particularly useful information to users
                isPickerField: true
            },
            
            allowBlank:false
        }, {
            id: "categories.categorycode",
            field: "Categories.CategoryCode",
            text: "Category Code",
            defaultValue: "",
            dataType: "string",
            supportedOperators: ["eq", "req", "ne", "in"],
            //editorCfg: {
            //    xtype: "textfield"
            //},
            allowBlank: false
        }, {
            id: "producttypeid",
            field: "ProductTypeId",
            text: "Product Type",
            defaultValue: "",
            dataType: "string",
            supportedOperators: ["eq", "ne", "in"],
            editorCfg: {
                xtype: "taco-producttypepickerfield",
                isPickerField: true
            },
            allowBlank: false
        }, {
            id: "price.cataloglistprice",
            field: "Price.CatalogListPrice",
            text: "List Price",
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
            text: "Sale Price",
            defaultValue: "",
            dataType: "float",
            supportedOperators: ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            editorCfg: {
                xtype: "currencyfield"
            },
            allowBlank: true
        }, {
            id: "daysavailableincatalog",
            field: "DaysAvailableInCatalog",
            text: "Days Available In Catalog",
            defaultValue: "",
            dataType: "int",
            supportedOperators: ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            //editorCfg: {
            //    xtype: "numberfield"
            //},
            allowBlank: false
        }, {
            id: "fulfillmenttypessupported",
            field: "FulfillmentTypesSupported",
            text: "Fulfillment Types Supported",
            defaultValue: "",
            dataType: "string",
            supportedOperators: ["eq", "ne", "in"],
            editorCfg: {
                xtype: "combo"
            },
            validEnumValues: [
                { id: "DirectShip", name: "Direct Ship" },
                { id: "InStorePickup", name: "In Store Pickup" },
                { id: "Digital", name: "Digital" }
             ],
            allowBlank: false
        }, {
            id: "measurements.packageweight.value",
            field: "Measurements.PackageWeight.Value",
            text: "Weight",
            defaultValue: "",
            dataType: "float",
            supportedOperators: ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            //editorCfg: {
            //    xtype: "numberfield"
            //},
            allowBlank: true
        }, {
            id: "measurements.packageheight.value",
            field: "Measurements.PackageHeight.Value",
            text: "Height",
            defaultValue: "",
            dataType: "float",
            supportedOperators: ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            //editorCfg: {
            //    xtype: "numberfield"
            //},
            allowBlank: true
        }, {
            id: "measurements.packagelength.value",
            field: "Measurements.PackageLength.Value",
            text: "Length",
            defaultValue: "",
            dataType: "float",
            supportedOperators: ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            //editorCfg: {
            //    xtype: "numberfield"
            //},
            allowBlank: true
        }, {
            id: "measurements.packagewidth.value",
            field: "Measurements.PackageWidth.Value",
            text: "Width",
            defaultValue: "",
            dataType: "float",
            supportedOperators: ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            //editorCfg: {
            //    xtype: "numberfield"
            //},
            allowBlank: true
        }, {
            id: "price.saleprice",
            field: "Price.SalePrice",
            filterType: "DynamicRealTime",
            text: "Post-Discount Price",
            defaultValue: "",
            dataType: "float",
            supportedOperators: ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            editorCfg: {
                xtype: "currencyfield"
            },
            allowBlank: true
        }, {
            id: "price.saletype",
            field: "Price.SaleType",
            filterType: "DynamicRealTime",
            text: "Sale Type",
            defaultValue: "",
            dataType: "string",
            supportedOperators: ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            editorCfg: {
                xtype: "combo"
            },
            validEnumValues: [
                { id: "CatalogSalePrice", name: "Catalog Sale Price" },
                { id: "DiscountedList", name: "Discounted List Price" },
                { id: "DiscountedCatalogSalePrice", name: "Discounted Catalog Sale Price" }
            ],
            allowBlank: true
        }, {
            id: "properties.",
            field: "properties.",
            text: "Attribute Property",
            defaultValue: "",
            dataType: "string",
            supportedOperators: ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            allowBlank: true
        }
    ],

    fieldStoreCfg: {
        makeIdCaseInsensitive: true,
        model: "Taco.model.FilterField",
        sorters:["text"]

        //,
        //fields: [
        //    { name: "id", type: "string", convert: function(value, record) {
        //        // force the id's lower case this store's id's need to be case insensitive;
        //        return value.toLowerCase();
        //    }},
        //    { name: "field", type: "string" },
        //    { name: "text", type: "string" },
        //    { name: "defaultValue", type: "auto" },
        //    { name: "dataType", type: "string" },
        //    { name: "supportedOperators", type: "array" },
        //    { name: "validEnumValues", type: "array" },
        //    { name: "editorCfg", type: "object" },
        //    { name: "filterType", type: "string", defaultValue:"DynamicPreComputed" },
        //    { name: "allowBlank", type: "boolean" }
        //]
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
        },
        "datetime": {
            xtype: "datetime"
        }
    },

    getFieldStoreCfg: function () {

        var data = Ext.Array.clone(this.fieldData);
        return Ext.Object.merge({
            data: data
        }, this.fieldStoreCfg);
    },


    getFieldStore: function (fieldStoreCfg) {
        var fieldStore = Ext.create('Ext.data.Store', fieldStoreCfg);
        return fieldStore;
    },

    init: function() {
        
        // this store is used for label conversion. specifically inside of the expressionTreePanel
        var storeCfg = this.getOperatorStoreCfg();
        this.operatorStore = Ext.create('Ext.data.Store',storeCfg);
        
        var fieldStoreCfg = this.getFieldStoreCfg();
        this.fieldStore = this.getFieldStore(fieldStoreCfg);


    },


    operatorStoreCfg : {
        fields: [
            { name: "id", type: "string" },
            { name: "text", type: "string" },
            { name: "recurse", type: "boolean" }
        ]
    },

    getOperatorByType: function (type) {
        var operators =  {
            "boolean": ["eq"],
            "string": ["eq", "ne", "in"],
            "int": ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            "float": ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            "date": ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            "datetime": ["eq", "ne", "in", "lt", "le", "gt", "ge"],
            "pickerfield": ["eq", "ne", "in"]
        }

        return Ext.Array.clone(operators[type]) || [];
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