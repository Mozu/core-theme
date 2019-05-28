/**
 * @class Taco.model.Discount
 */
Ext.define('Taco.model.PageRuleExpression', {
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
                record.editing = true;
                if (record.data.type == "container") {

                    record.set("expanded", true);
                    if (record.get("operator") && record.get("logicalOperator") !== record.get("operator")) {
                        record.set("logicalOperator", record.get("operator"));
                    }

                } else {
                    record.set("leaf", true);
                }
                record.editing = false;
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
            defaultValue: null,
            persistType: "predicate",
            type: "auto",
            convert: function (v, record) {
                // if (record.data.rightType === "datetime" && !(v instanceof Date)) {
                //     var date = new Date(v);
                //     var utcDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
                //     var offset = (new Date()).getTimezoneOffset() * 60000;
                //     return new Date(utcDate + offset);
                // }
                return v;
            }
        }, {
            name: "operator",
            type: "string"
        }, {
            name: "logicalOperator",
            type: "string",
            persist: false,
            convert: function (v, record) {
                if (record.data.type == "container") {
                    if (v && v !== record.get("operator")) {
                        record.editing = true;
                        record.set("operator", v);
                        record.editing = false;
                    }
                }
                return v;
            }
        }, {
            name: "rightType",
            type: "string"
        }

    ],
    validatePageRule: function () {
        var me = this;
        var json = me.proxy.getWriter().getRecordData(me);
        delete json.logicalOperator;
        //json.rightType= me.get('dataType');

        return Ext.Ajax.request({
            url: '/admin/app/cmsdocument/pagerule/validate',
            method: 'POST',
            jsonData: json,
            success: function (resp) {
                var res = Ext.JSON.decode(resp.responseText);
                if (res.items) {
                    if (res.items[0].validationResult.hasErrors) {
                        var errorMessage = res.items[0].validationResult.errors[0].message;
                        Taco.app.fireEvent('setmessage', errorMessage, 'error');
                        return;
                    }
                }
                me.fireEvent('PageRuleValidated');

            },
            failure: function (resp) {
                me.fireEvent('PageRuleValidationFailure');
                Taco.app.fireEvent('setmessage', resp, 'error');
            },
        });
    },
    isFieldPersistable: function (field, model) {
        if (field.persist) {
            return (!field.persistType || field.persistType === model.get("type"));
        }
        return false;
    }
});