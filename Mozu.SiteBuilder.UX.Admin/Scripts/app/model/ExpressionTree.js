/**
 * @class Taco.model.Discount
 */
Ext.define('Taco.model.ExpressionTree', {
    extend: 'Taco.core.data.Model',
    behaviors: {
        read: 24,
        create: 25,
        update: 26,
        destroy: 27
    },
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    fields: [
        {
            name: "hackToTransformData",
            type: "string",
            persist: false,
            convert: function (v, record) {
                if (record.data.type == "container") {
                    record.set("expanded", true);
                } else {
                    record.set("leaf", true);
                }
                return true;
            }
        }, {
            name: "type",
            type: "string"
        }, {
            name: "id",
            persist: false
        }, {
            name: "parentId",
            persist: false
        }, {
            name: "leaf",
            persist: false
        }, {
            name: "left",
            persistType: "predicate",
            type: "string"
        }, {
            name: "right",
            defaultValue:null,
            persistType: "predicate",
            type: "auto"
        }, {
            name: "operator",
            persistType: "predicate",
            type: "string"
        }, {
            name: "logicalOperator",
            persistType: "container",
            type: "string"
        }
    ],
    // helper method used when serializing the tree to determine which fields are persistable based on the node type. Since there is one model for different nodes the fields are a combination of the fields from both;
    isFieldPersistable : function(field,model) {
        if (field.persist) {
            return (!field.persistType || field.persistType === model.get("type"));
        }
        return false;
    }
});