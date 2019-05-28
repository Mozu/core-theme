/**
 * The multiSelectorField is used when selecting multiple values. Is typically paired with a multiSelectorModal
 */
Ext.define('Taco.view.filter.MultiSelectorField', {
    extend: 'Ext.form.FieldContainer',
    alias: "widget.multiselectorfield",
    requires: [
        'Taco.model.CouponSet',
        'Taco.view.filter.Schema',
        'Ext.form.field.Text',
        'Ext.form.field.TextArea',
        'Ext.form.field.Number',
        'Ext.form.field.Date',
        'Ext.form.field.ComboBox',
        'Taco.core.ux.form.CurrencyField',
        'Taco.view.filter.MultiSelectorGrid',
        'Taco.view.filter.BulkEditModal', 
        'Taco.shared.view.field.CustomerSegmentPickerField'
    ],


    config: {
        maxSize: null,
        // force the field to replace the store values with a single record;
        fields:[
            'id'
        ],
        model: null,
        store: null,
        
        removeItemText : "Delete",
        autoHeightGrid:false,
        singleSelect: false,
        dataType: "string",
        fieldCfg:null,
        fieldLabel: "Values",
        allowBlank: false,
        hideHeaders: true,
        gridActions: [],
        gridEditAction : Ext.emptyFn,
        fieldActions: [],
        removeAction :"remove", // destroy or remove
        // warning this can cause layout run errors when the grid has no data. this is not ready for use yet
        autoHideGrid:true,
        value: null,
        stateful: false,
        stateId: null
    },

    //isFormField:true,

    //width:"300",

    initComponent: function () {
        var me = this,
            storeData = [],
            storeType = me.getStoreConfigByValue(me.getLeftFieldValue()),
            isGenericStore = storeType === 'Ext.data.Store';
        
            this.layout = {
                type:"vbox",
                align:"stretch"
            };

        if (this.store) {

        } else {
            if (this.value) {
                // make sure the data is in an array
                if (!Ext.isArray(this.value)) {
                    this.value = [this.value];
                }

                // need to transform the data into a format the store can consume and make the dataTypes consistant so that the id's will be the same type.
                storeData = Ext.Array.map(this.value, function (obj) {
                    var result = {};
                    if (me.fieldCfg && me.fieldCfg.valueField) {
                        result[me.fieldCfg.valueField] = me.coerceDataType(obj);
                    } else {
                        result['id'] = me.coerceDataType(obj);
                    }
                    return result;
                });
            }

            var storeConfig = {
                data: storeData
            };

            var storeType = me.getStoreConfigByValue(me.getLeftFieldValue());

            if (this.getModel()) {
                storeConfig.model = this.getModel();
            } else if (isGenericStore) {
                storeConfig.fields = this.getFields();
            }

            this.store = Ext.create(storeType, storeConfig);
        }

        if (!isGenericStore) { // only apply this loading logic when a resource is using a custom store
                
            switch (storeType) {
                case 'Taco.store.Attributes':
                    me.store.on('add', function() {
                        if (!me.store.data) { return; }
                        var attribute = me.parentForm.attributePickerField.getValue();
                        me.store.model.load(attribute, {
                            scope: me.store,
                            success: function(attribute) {

                                var values = attribute.get('values');

                                var records = me.store.data.items;
                                Ext.Array.each(records, function(record) {

                                    var property = Ext.Array.findBy(values, function(value) {
                                        return value.id === record.get('id');
                                    });
                                    var index = me.store.findExact('id', record.get('id'));
                                    var model = me.store.getAt(index);
                                    model.set(property);
                                });
                            }
                        });
                    });
                    break;
                case 'Taco.store.Categories':
                    me.store.on('add', function(store, catRecord) {
                        if (!me.store.data || (catRecord && catRecord.length > 0 && catRecord[0].get('categoryId') !== 0)) {
                            return;
                        }
                        var searchCodes = Ext.Array.map(me.store.data.items, function (record) {
                            return record.get('categoryCode');
                        });
                        var advSearch = 'advancedSearch=' + Ext.JSON.encodeValue({"categoryCodes": searchCodes.join(',')});
                        Ext.Ajax.request({
                            method: 'GET',
                            url: '/admin/app/category/read',
                            params: advSearch,
                            success: function (response) {
                                var json = Ext.decode(response.responseText, true);
                                if (!json || !json.success || !json.items) return;

                                Ext.Array.each(json.items, function (record) {
                                    var model = me.store.findRecord('categoryCode', record.categoryCode, 0, false, false, true);
                                    if (model) {
                                        model.set(record);
                                    }
                                });
                            }
                        });
                    });
                    break;
                case 'Taco.store.CustomerSegments':
                    me.store.on('add', function (store, segRecord) {
                        if (!me.store.data || (segRecord && segRecord.length > 0)) {
                            return;
                        }
                        var searchCodes = me.store.data.items.map( function (record) {
                            return record.get('code');
                        });
                        var searchCodeString = "'";
                        searchCodes.forEach(function (searchCode, index) {
                            searchCodeString += searchCode;
                            searchCodeString += "'";
                            if (index + 1 < searchCodes.length) {
                                searchCodeString+= ",'";
                            }
                        });
                        var filterString = 'filter=[{"property":"code","comparison":"in","value":"[' + searchCodeString + ']"}]';
                        Ext.Ajax.request({
                            method: 'GET',
                            url: window.location.protocol+'//'+window.location.hostname+'/admin/app/customer/segments/list',
                            params: filterString,
                            success: function (response) {
                                var json = Ext.decode(response.responseText, true);
                                if (!json || !json.success || !json.items) return;

                                Ext.Array.each(json.items, function (record) {
                                    var model = me.store.findRecord('code', record.code, 0, false, false, true);
                                    if (model) {
                                        model.set(record);
                                    }
                                });
                            }
                        });
                    });
                    break;
                default:
                    me.store.on('add', function() {
                        if (!me.store.data) { return; }
                        var records = me.store.data.items;
                        Ext.Array.each(records, function(record) {
                            me.store.model.load(record.get('id'), {
                                scope: me.store,
                                success: function(record) {
                                    var key = me.getKeyByStoreType(me.store.$className);
                                    var model = me.store.findRecord('id', record.get(key), 0, false, false, true);
                                    if (model) {
                                        model.set(record.data);
                                    }
                                },
                                failure: function(record, operation) {
                                    // ¯\_(ツ)_/¯ 
                                    // do nothing, let the code persist
                                }
                            });
                        }, me.store);
                    });
            }



            if (me.store.getCount()) {
                me.store.fireEvent('add');
            }
        }

        var fieldCfg = Ext.apply(this.getFieldCfg(), {
            //emptyText:"Add a value (Enter Key)",
            value: "",
            flex: 1,
            valueNotFoundText :"",
            allowBlank:true,
            name:"multiSelectorAddField"
        });
        
        if (!fieldCfg.isPickerField && fieldCfg.xtype != "combo") {
            fieldCfg = Ext.applyIf(fieldCfg, {
                emptyText: "Add a value and then hit ENTER Key"
            });
        } else {
            fieldCfg.emptyText = this.emptyText || "";
        }

        this.addField = Ext.widget(fieldCfg);

        if (fieldCfg.isPickerField || fieldCfg.xtype=="combo") {
            this.mon(this.addField, 'select', function(field, records) {
                var key = me.getKeyByStoreType(me.store.$className);
                var id = records[0].get(key);
                me.addValue(id, records[0]);
            }, me);
        } else {
            // dont' listen for enter on the picker field since the enter key in the picker field is already handled internally;
            this.mon(this.addField, "specialkey", function (field, e) {
                switch (e.getKey()) {
                    case e.ENTER:
                        me.addValue(this.getValue());
                        break;
                }
            });
        }

        this.mon(this.store, 'bulkremove', function (store) {
            
            if (store.count() == 0) {
                if (me.getAutoHideGrid()) {
                    me.list.hide();
                }
                me.addField.focus();
            }
        }, me);

        this.mon(this.store, 'datachanged', function (store) {
            //this.validate();
            
            var oldValue = this.value;
            this.fireEvent('change', this, this.getValue(), oldValue);
        }, me);


        


        var gridConfig = {
            hideHeaders:false, //this.getHideHeaders(),
            store: this.store,
            getColumnConfig: me.getColumnConfig.bind(me),
            removeItemText : this.removeItemText,
            removeAction: this.getRemoveAction(),
            gridActions: this.getGridActions(),
            hidden: (this.autoHideGrid && this.store.count() == 0),
            stateful: this.getStateful(),
            stateId: this.getStateId()
        };

        if (this.getAutoHeightGrid()) {
            gridConfig.autoHeight = true;
            gridConfig.minHeight = 90;
            //gridConfig.height = 200;
            //gridConfig.width = 500;
            //gridConfig.height = 500;
            //this.width = 500;
            //this.height = 500;
            //this.autoHeight = true;
            //this.minHeight = 200;
        }

        this.list = Ext.create('Taco.view.filter.MultiSelectorGrid', gridConfig);


        this.mon(this.list, 'itemdblclick', this.gridEditAction, me);

        this.addBarItems = [
            this.addField
        ];

        // dont' need the add button for picker fields;
        if (!fieldCfg.isPickerField && fieldCfg.xtype != "combo") {
            this.addBarItems.push({
                xtype: "button",
                ui: "action",
                scale: "medium",
                text: "Add",
                margin: {
                    left: 4
                },
                handler: function() {
                    this.addValue();
                },
                scope: me
            });
        }

        this.addBarItems.push({
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            menuAlign: 'tr-br?',
            cls: 'taco-more-action-button taco-general-more-action',
            itemId: 'moreActionsButton',
            disabled: me.singleSelect,
            menu: [
                {  
                    text: 'Bulk Edit',
                    itemId: 'bulkEdit',
                    handler: function() {
                        Ext.create('Taco.view.filter.BulkEditModal', {
                            values: me.store.data.items,
                             listeners: {
                                aftersaveclose: function() {
                                    var self = me,
                                        formValue = this.down('#bulkvalue-field').getValue(),
                                        values = formValue.split(/\s|[ ,]+/),
                                        idField = me.getKeyByStoreType(me.store.$className),
                                        cleanedValues = Ext.unique(
                                            values.map(function(val) {
                                                var cleanedVal = val.replace(/\s/g,'');
                                                var result = { data: {} };
                                                result.data[idField] = self.coerceDataType(cleanedVal);
                                                return result;
                                            })
                                        );
                                    me.store.removeAll();
                                    cleanedValues.reverse().forEach(function(rec) {
                                        me.addValue(rec.data[idField], rec);
                                    })
                                }
                            }
                        });
                    }
                }
            ]
        });
        
        //  insert any field actions (buttons typically) to the right of the field and its add button
        if (this.fieldActions.length) {
            Ext.Array.insert(this.addBarItems, this.addBarItems.length, this.fieldActions);
        }


        this.items = [
            {
                xtype:"container",
                layout: "hbox",
                margin:{bottom:2},
                items: this.addBarItems
            }, {
                xtype:"container",
                layout: "fit",
                flex:1,
                items: [
                    this.list
                ]
            }
        ];

        this.callParent(arguments);

    

        //this.relayEvents(this.addField, ["change"]);

    },

    getStoreConfigByValue: function(val) {
        var configs = {};

        configs['default'] = 'Ext.data.Store';
        configs['productcode'] = 'Taco.store.Products';
        configs['producttypeid'] = 'Taco.store.ProductTypes';
        configs['categories.categorycode'] = 'Taco.store.Categories';
        configs['properties.'] = 'Taco.store.Attributes';
        configs['customer.customersegments'] = 'Taco.store.CustomerSegments';

        return val && configs[val] ? configs[val] : configs['default'];
    },

    getKeyByStoreType: function(type) {
        // custom mapping for store/models that don't use the 'id' property
        switch (type) {
            case 'Taco.store.Products':
                return 'productCode';
            case 'Taco.store.Categories':
                return 'categoryCode';
            case 'Taco.store.CustomerSegments':
                return 'code';
        }
        return 'id';
    },

    getColumnConfigByValue: function(val) {
        var configs = {};

        configs['default'] = [
            {
                dataIndex: 'id',
                text: 'Id',
                hideable: false,
                flex: 1,
                minWidth: 150
            }
        ];

        configs['productcode'] = [
            {
                dataIndex: 'id',
                text: 'Product Code',
                hideable: false,
                flex: 1,
                minWidth: 150
            },
            {
                dataIndex: 'productName',
                text: 'Product Name',
                flex: 1
            },
            {
                dataIndex: 'price',
                text: 'Price',
                flex: 1,
                renderer: function(val) {
                    return Taco.app.context.getCurrent().formatCurrency(val);
                }
            },
            {
                dataIndex: 'salePrice',
                text: 'Sale Price',
                flex: 1,
                renderer: function(val) {
                    return Taco.app.context.getCurrent().formatCurrency(val);
                }
            }
        ];

        configs['producttypeid'] = [
            {
                dataIndex: 'id',
                text: 'ID',
                hideable: false,
                flex: 1,
                minWidth: 150
            },
            {
                dataIndex: 'name',
                text: 'Name',
                flex: 1
            }
        ];

        configs['categories.categorycode'] = [
            {
                dataIndex: 'categoryCode',
                text: 'Category Code',
                hideable: false,
                flex: 1,
                minWidth: 150
            },
            {
                dataIndex: 'name',
                text: 'Category Name',
                flex: 1
            },
            {
                dataIndex: 'categoryType',
                text: 'Type',
                flex: 1
            }
        ];

        configs['properties.'] = [
            {
                dataIndex: 'value',
                text: 'Label',
                hideable: false,
                flex: 1,
                minWidth: 150
            },
            {
                dataIndex: 'id',
                text: 'Value',
                flex: 1
            }
        ];

        configs['customer.customersegments'] = [
            {
                dataIndex: 'code',
                text: 'Code',
                hideable: false,
                flex: 1,
                minWidth: 150
            },
            {
                dataIndex: 'name',
                text: 'Name',
                flex: 1
            }
        ];

        return val && configs[val] ? configs[val] : configs['default'];
    },

    getColumnConfig: function () {
        var me = this;
        return me.getColumnConfigByValue(me.getLeftFieldValue());
    },

    getLeftFieldValue: function() {
        var me = this;
        return me.parentForm ? me.parentForm.leftField.getValue() : undefined;
    },

    addValue: function(value,record) {
        var me = this,
            // need to make sure that id goes into the store with the right dataType so that it matches what's going to be persisted.
            id = me.coerceDataType(value || this.addField.getValue());

        if (!id) {
            return;
        }

        var idField = me.getKeyByStoreType(me.store.$className);
        var recordToSelect = me.store.findRecord(idField, id, 0, false, false, true);
        if (!recordToSelect) {
            if (this.getSingleSelect()) {
                //clear out any old records;
                me.store.removeAll();
            }

            if (record) {
                var json = record.data;
                json.id = id;
                
                recordToSelect = me.store.insert(0, json);
            } else {
                recordToSelect = me.store.insert(0, {
                    id: id
                });
            }

            
        }
        me.list.getSelectionModel().select(recordToSelect);
        me.addField.reset();
        me.addField.focus();
        
        if (this.list.isHidden()) {
            this.list.show();
        }
    },

    onAddFieldChange : function() {
        
    },

    coerceDataType: function (value) {
        var dataType = this.getDataType(),
            isNumber =  (dataType=="int" || dataType=="float"),
            isDate =  (dataType=="date" || dataType=="datatime"),
            isString =  (dataType=="string");
        if (value) {
            if (isNumber) {
                value = parseFloat(value);
            } else if (isString) {
                value.toString();
            } else if (isDate) {
                //todo
            }
        }

        return value;
    },

    getValue: function () {
        var me = this,
            data = [];

        this.store.each(function (record) {
            var key = me.getKeyByStoreType(record.store.$className);
            var id = me.coerceDataType(record.get(key));
            data.push(id);
        });
        
        if (!data.length){return null}

        // if single select and array need to flatten;
        if (this.getSingleSelect()) {
            if (Ext.isArray(data)) {
                data = data[0];
            }
        }

        return data;
    },

    setValue: function (value) {
        this.value = value;
        
        if (!value) {
            this.store.removeAll();
        }
    },

    isValid : function() {
        return this.callParent(arguments);
    },

    validate: function () {
        var value = this.getValue();
        return (value);
    },

    onDestroy: function () {
        this.callParent(arguments);
    }
});
