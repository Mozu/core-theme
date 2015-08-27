///**
// * @class Taco.core.FormPanel
// * @author Jimmy Sanford
// * The form base class
// * Supports model binding for validation
// */

//Ext.define('Taco.core.FormPanel', {
//    extend: 'Ext.form.Panel',
//    alias: 'widget.formpanel',
//    boundModel: null,
//    record: null,
//    fieldDefaults: {
//        msgTarget: 'under'
//    },
//    trackResetOnLoad: true,
//    dataBinding: 'oneway',
//    initComponent: function () {
//        var me = this,
//            model = me.boundModel,
//            // get model name, specified by the form
//            called = false;

//        if (model) {
//            Ext.require([model]); // require model so it can be instantiated
//            var instance = Ext.create(model, {
//                name: 'Validation Instance'
//            }),
//                validations = Ext.ModelManager.getModel(model).prototype.validations,
//                // get validations array from the model
//                rules = {}; // set up rules object
//            // fill rules object with validations grouped by field name
//            for (i = 0; i < validations.length; i++) {
//                var curName = validations[i].name;
//                if (typeof (rules[curName]) === 'undefined') {
//                    rules[curName] = [];
//                }
//                rules[curName].push(validations[i]);
//            }

//            me.callParent();
//            called = true;

//            var fields = [];
//            Ext.Object.each(Ext.ComponentManager.all.map, function (key, value, myself) {
//                if (value.xtype === 'textfield') {
//                    fields.push(myself[key]);
//                }
//            });

//            // attach rules to fields as object properties
//            for (i = 0; i < fields.length; i++) {
//                var curItem = fields[i],
//                    curName = curItem.name;
//                for (j = 0; j < (rules[curName] ? rules[curName].length : 0); j++) {
//                    curItem.vtype = 'custom';
//                    if (rules[curName][j].type === "format") {
//                        curItem.filter = rules[curName][j].matcher;
//                        curItem.filterType = 'format';
//                    }
//                    else if (rules[curName][j].type === "exclusion") {
//                        curItem.filter = rules[curName][j].list;
//                        curItem.filterType = 'exclusion';
//                    }
//                    else if (rules[curName][j].type === "inclusion") {
//                        curItem.filter = rules[curName][j].list;
//                        curItem.filterType = 'inclusion';
//                    }
//                    else if (rules[curName][j].type === "length") {
//                        curItem.minLength = rules[curName][j].min;
//                        curItem.maxLength = rules[curName][j].max;
//                    }
//                    else if (rules[curName][j].type === "presence") {
//                        curItem.allowBlank = false;
//                    }
//                }
//            }

//            // generate regex
//            var allowedValues = function (list) {
//                    var pattern = '';
//                    for (i = 0; i < list.length; i++) {
//                        pattern += ('|^' + list[i] + '$');
//                    }
//                    var regex = new RegExp(pattern.substr(1), 'i');
//                    return regex;
//                };

//            // finally validate fields
//            Ext.apply(Ext.form.field.VTypes, {
//                custom: function (val, field) {
//                    var result = true;

//                    if (field.filterType === 'format') {
//                        result = field.filter.test(val) ? result : false;
//                    }
//                    if (field.filterType === 'exclusion') {
//                        result = !allowedValues(field.filter).test(val) ? result : false;
//                    }
//                    if (field.filterType === 'inclusion') {
//                        result = allowedValues(field.filter).test(val) ? result : false;
//                    }
//                    if (field.minLength > 0) {
//                        result = val.length >= field.minLength ? result : false;
//                    }
//                    if (field.maxLength > 0) {
//                        result = val.length <= field.maxLength ? result : false;
//                    }

//                    return result;
//                },
//                customText: 'Did not pass the filter'
//            });
//        }

//        if (!called) {
//            me.callParent();
//        }
//        if (this.trackResetOnLoad) {
//            this.getForm().trackResetOnLoad = true;
//        }
//        if (this.record) {
//            this.loadRecord(this.record);
//        }
        
//        if (this.dataBinding !== 'oneway') {
//            this.on({
//                dirtychange: function (form, isDirty, eOpts) {
//                    var record = form.getRecord();
//                    if (record) {
//                        form.updateRecord(record);
//                        Ext.each(form.getFields().items, function (field) {
//                            field.resetOriginalValue();
//                        });

//                    }
//                }
//            });
//        }

//    }
//});