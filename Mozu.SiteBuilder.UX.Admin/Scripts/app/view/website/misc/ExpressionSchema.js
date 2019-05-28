/**
 * @class  Taco.view.Website.Misc.ExpressionSchema
 */

Ext.define('Taco.view.website.misc.ExpressionSchema', {
    singleton: true,
    alternateClassName: "Taco.ExpressionSchema",
    requires: [
        'Taco.model.FilterField'
    ],
    // Override this config when we i18L

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
            "stringarray": ["nin", "in"],
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


    operatorData: [
        { id: "eq", text: "is equal to " },
        { id: "ne", text: "does not equal " },
        { id: "req", text: "is equal to (plus its children) ", recurse: true }, //Note: req is going to be defined by a seperate checkbox field when the user selects the eq. operator.
        { id: "lt", text: "is less than " },
        { id: "le", text: "is less than or equal to " },
        { id: "gt", text: "is greater than " }, 
        { id: "ge", text: "is greater than or equal to " },
        { id: "in", text: "is one of the following  " },
        { id: "nin", text: "is not one of the following  " }
    ],

    fieldStoreCfg: {
        makeIdCaseInsensitive: true,
        model: "Taco.model.FilterField",
        sorters:["text"]
    },

    dataTypeMap: function(dataType){
        var type = null;
        switch (dataType) {
            case 'string':
                type = "string"
                break;
            case 'stringArray':
                type = "stringarray"
                break;
            case 'dateTime':
                type = "datetime"
              break;
            default:
              type = "string"
          }
          
        return type
    },

    getFieldStoreCfg: function () {
        var me = this;
        this.pageRuleMetaStore.load({
            callback: function (records) {
                var data = [];
                if(records) {
                    records.forEach(function(record){
                        var dataType = me.dataTypeMap(record.get('dataType'))
                        data.push(
                            {
                                id: record.get('propertyName').replace(" ", ""),
                                field: record.get('propertyName').replace(" ", ""),
                                text: record.get('propertyName'),
                                dataType: dataType,
                                supportedOperators: record.get('validOperators'),
                                editorCfg: {
                                    xtype: me.xtypeMappingsByName[record.get('propertyName')] || me.xtypeMappings[dataType],
                                    isPickerField: (me.xtypeMappingsByName[record.get('propertyName')]) ? true : false,
                                    valueField: 'code',
                                    displayField: 'code'
                                },
                                allowBlank: record.get('allowNull')
                            }
                        )
                    });
                }
                var fieldStoreCfg = Ext.Object.merge({
                    data: data
                }, me.fieldStoreCfg);        
                me.fieldStore = me.setFieldStore(fieldStoreCfg);
            }
        })
    },


    setFieldStore: function (fieldStoreCfg) {
        this.fieldStore = Ext.create('Ext.data.Store', fieldStoreCfg);
        return this.fieldStore;
    },

    getFieldStore: function () {
        return this.fieldStore;
    },

    xtypeMappings: {
        "string":"textfield",
        "stringarray":"textfield",
        "float": "numberfield",
        "int": "numberfield",
        "date": "datefield",
        "datetime": "datetime"
    },

    xtypeMappingsByName: {
        "customer.customersegments":"taco-customersegmentpickerfield"
    },
    
    init: function() {
        
        // this store is used for label conversion. specifically inside of the expressionTreePanel
        this.pageRuleMetaStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.PageRuleMeta');

        var storeCfg = this.getOperatorStoreCfg();
        this.operatorStore = Ext.create('Ext.data.Store',storeCfg);
        
        this.getFieldStoreCfg();
    },

    constructor: function () {
        //this.init();
        this.callParent(arguments);
    }
});