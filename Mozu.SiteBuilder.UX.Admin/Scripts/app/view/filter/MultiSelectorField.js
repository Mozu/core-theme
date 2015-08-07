/**
 * The multiSelectorField is used when selecting multiple values. Is typically paired with a multiSelectorModal
 */
Ext.define('Taco.view.filter.MultiSelectorField', {
    extend: 'Ext.form.FieldContainer',
    alias: "widget.multiselectorfield",
    requires: [
        'Taco.view.filter.Schema',
        'Ext.form.field.Text',
        'Ext.form.field.TextArea',
        'Ext.form.field.Number',
        'Ext.form.field.Date',
        'Ext.form.field.ComboBox',
        'Taco.core.ux.form.CurrencyField',
        'Taco.view.filter.MultiSelectorGrid'
    ],


    config: {
        maxSize: null,
        // force the field to replace the store values with a single record;
        singleSelect: false,
        dataType: "string",
        fieldCfg:null,
        fieldLabel: "Values",
        allowBlank: false,
        value: null
    },

    layout: {
        type:"vbox",
        align:"stretch"
    },

    //isFormField:true,

    //width:"300",

    initComponent: function () {
        var me = this,
            storeData = [];
        
        if (this.value) {
            // make sure the data is in an array
            if (!Ext.isArray(this.value)) {
                this.value = [this.value];
            }

            // need to transform the data into a format the store can consume and make the dataTypes consistant so that the id's will be the same type.
            storeData = Ext.Array.map(this.value, function (obj) {
                //return { id: obj.toString() };
                return { id: me.coerceDataType(obj) };
            });
        }
        
        
        this.store = Ext.create('Ext.data.Store', {
            fields: [
                "id"
            ],
            data:storeData
        });

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
                emptyText:"Add a value and then hit ENTER Key"
            });
        }


        this.addField = Ext.widget(fieldCfg);

        if (fieldCfg.isPickerField || fieldCfg.xtype=="combo") {
            this.mon(this.addField, 'select', function(field, records) {
                var id = records[0].getId();
                me.addValue(id);
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
                this.list.hide();
                this.addField.focus();
            }
        }, me);

        this.mon(this.store, 'datachanged', function (store) {
            this.validate();
        }, me);


        

        this.list = Ext.create('Taco.view.filter.MultiSelectorGrid', {
            hideHeaders:true,
            store: this.store,
            hidden: storeData.length == 0
        });



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

    addValue: function(value) {
        var me = this,
            // need to make sure that id goes into the store with the right dataType so that it matches what's going to be persisted.
            id = me.coerceDataType(value || this.addField.getValue());

        if (!id) {
            return
        }

        


        var recordToSelect = me.store.getById(id);
        if (!recordToSelect) {
            if (this.getSingleSelect()) {
                //clear out any old records;
                me.store.removeAll();
            } 

            recordToSelect = me.store.insert(0, {
                id: id
            });
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
            isString =  (dataType=="string")
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
            var id = me.coerceDataType(record.get("id"));
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

    validate: function () {
        var value = this.getValue();
        return (value);
    },

    onDestroy: function () {
        var me = this;
        this.callParent(arguments);
    }
});
