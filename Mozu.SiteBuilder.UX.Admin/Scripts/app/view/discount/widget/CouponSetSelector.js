/**
 * 
 */
Ext.define('Taco.view.discount.widget.CouponSetSelector', {
    extend: 'Ext.form.FieldContainer',
    alias: "widget.couponsetselector",
    mixins: {
        field: 'Ext.form.field.Field'
    },
    requires: [
        'Taco.core.ux.form.DateTime',
        'Ext.form.field.Text',
        'Ext.form.field.TextArea',
        'Ext.form.field.Number',
        'Ext.form.field.Date',
        'Ext.form.field.ComboBox',
        'Taco.core.ux.form.CurrencyField',
        'Taco.view.filter.MultiSelectorField'
    ],

    config: {
        fieldLabel: "Value",
        fieldRecord: null,
        autoHeightGrid:true,
        store:null,
        allowBlank: true,
        name: "",
        // warning this can cause layout run errors when the grid has no data. this is not ready for use yet
        autoHideGrid: false,
        singleSelect:false,
        value: null,
        stateful: false,
        stateId: null
    },

    layout: {
        type: "vbox",
        align: "stretch"
    },

    initComponent: function () {
        this.items = [];

        this.updateFieldEditability();
        this.createField();

        this.callParent(arguments);
    },

    // when we have a multi value situation;
    createMultiField: function () {
        var me = this,
            fieldCfg = this.getFieldConfig(),
            value = (this.field) ? this.field.getValue() : this.value;

        if (this.field) {
            if (this.fieldRelayers) {
                Ext.destroy(this.fieldRelayers);
            }
            Ext.destroy(this.field);
        }

        this.field = Ext.create('Taco.view.filter.MultiSelectorField', {
            valueType: this.fieldRecord.get("dataType"),
            singleSelect: this.singleSelect,
            hideHeaders: false,
            model: 'Taco.model.CouponSet',
            store: this.store,
            removeItemText: "Remove",
            fieldCfg: fieldCfg,
            removeAction: "remove",
            autoHideGrid: this.autoHideGrid,
            autoHeightGrid: this.getAutoHeightGrid(),
            stateful: this.getStateful(),
            stateId: this.getStateId(),
            gridActions: this.getGridActions(),
            gridEditAction : function(grid, record, item, index, e) {
                me.editCouponSet(record, record.get("couponSetType"), false);
            },
            fieldActions: [
                {
                    xtype: "button",
                    text: Localizer.langResources.MARKETING.CouponSets.create,
                    margin:{left:4},
                    ui: "action",
                    scale: "medium",
                    menuAlign: 'tr-br?',
                    menu: {
                        plain: true,
                        shadow: false,
                        items: [
                            {
                                text: Localizer.langResources.MARKETING.CouponSets.manual_coupon_set,
                                requiredBehaviors: {
                                    model: 'Taco.model.CouponSet',
                                    behavior: 'create'
                                },
                                listeners: {
                                    click: {
                                        fn: function(menu, menuItem) {
                                            if (!menuItem) {
                                                return
                                            }
                                            me.createCouponSet('Manual');
                                        },
                                        scope: me,
                                        delegate: "x-menu-item-link"
                                    }
                                }
                            }, {
                                text: Localizer.langResources.MARKETING.CouponSets.generated_coupon_set,
                                requiredBehaviors: {
                                    model: 'Taco.model.CouponSet',
                                    behavior: 'create'
                                },
                                listeners: {
                                    click: {
                                        fn: function(menu, menuItem) {
                                            if (!menuItem) {
                                                return
                                            }
                                            me.createCouponSet('Generated');
                                        },
                                        scope: me,
                                        delegate: "x-menu-item-link"
                                    }
                                }
                            }
                        ]
                    }
                }
            ],
            //flex: 1,
            emptyText: fieldCfg.emptyText || Localizer.langResources.MARKETING.CouponSets.select_coupon_sets,
            value: value,
            listeners: {
                'change':function () {
                    me.checkChange();
                },
                scope:me

            },
            getColumnConfig: function () {
                return [
                    {
                        xtype: 'gridcolumn',
                        dataIndex: 'name',
                        stateId: 'name',
                        text: Localizer.langResources.MARKETING.CouponSets.name,
                        hideable: false,
                        flex: 1,
                        minWidth: 150,
                        sortable: true
                    }, {
                        xtype: 'gridcolumn',
                        dataIndex: 'couponCodeType',
                        stateId: 'couponCodeType',
                        text: Localizer.langResources.MARKETING.CouponSets.type,
                        width: 150,
                        sortable: true
                    }, {
                        xtype: 'gridcolumn',
                        dataIndex: 'countOrSetSize',
                        stateId: 'countOrSetSize',
                        text: Localizer.langResources.MARKETING.CouponSets.total_codes,
                        width: 180,
                        hidden: false,
                        sortable: false,
                        renderer: Ext.util.Format.numberRenderer('0,000')
                    }, {
                        xtype: 'gridcolumn',
                        dataIndex: 'redemptionCount',
                        stateId: 'redemptionCount',
                        text: Localizer.langResources.MARKETING.CouponSets.hash_redeemed,
                        width: 180,
                        hidden: false,
                        sortable: false,
                        renderer: Ext.util.Format.numberRenderer('0,000')
                    }, {
                        xtype: 'gridcolumn',
                        dataIndex: 'redemptionPercent',
                        stateId: 'redemptionPercent',
                        text: Localizer.langResources.MARKETING.CouponSets.percent_redeemed,
                        width: 180,
                        hidden: false,
                        sortable: false,
                        renderer: Ext.util.Format.numberRenderer('0.00 %')

                    }, {
                        xtype: 'gridcolumn',
                        dataIndex: 'assignedDiscountCount',
                        stateId: 'assignedDiscountCount',
                        text: Localizer.langResources.MARKETING.CouponSets.hash_assigned_discounts,
                        width: 180,
                        hidden: false,
                        sortable: false,
                        renderer: Ext.util.Format.numberRenderer('0,000')
                    }, {
                        xtype: 'gridcolumn',
                        dataIndex: 'couponSetCode',
                        stateId: 'couponSetCode',
                        text: Localizer.langResources.MARKETING.CouponSets.code_prefix,
                        width: 180,
                        hidden: true,
                        sortable: true
                    }, {
                        xtype: 'datecolumn',
                        dataIndex: 'startDate',
                        stateId: 'startDate',
                        format: 'n/j/Y g:i a',
                        width: 130,
                        text: Localizer.langResources.MARKETING.CouponSets.start_date,
                        hidden: true,
                        sortable: true
                    }, {
                        xtype: 'datecolumn',
                        dataIndex: 'endDate',
                        stateId: 'endDate',
                        format: 'm-d-Y g:i a',
                        width: 130,
                        text: Localizer.langResources.MARKETING.CouponSets.end_date,
                        hidden: true,
                        sortable: true,
                        renderer: function (value, metaData, record) {
                            var val = "";
                            if (!record.get("endDate")) {
                                val = "Never";
                                return val;
                            }
                            return Ext.Date.format(value, "n/j/Y g:i a");
                        }
                    }
                ];

            }
            
        });

        this.initRelayEvents();

        if (this.rendered) {
            this.add(this.field);
        } else {
            this.items.push(this.field);
        }


    },

    getGridActions: function () {
        var me = this,
            gridActions = [];

        
        gridActions.push(
            {
                text: Localizer.langResources.SHARED.edit,
                requiredBehaviors: {
                    model: 'Taco.model.Discount',
                    behavior: 'update'
                },
                menuColumnHandler: function (item, eventData) {
                    var record = eventData.record;
                    item.scope.editCouponSet(record, record.get('couponSetType'), false);
                },
                scope:me
            },
            {
                text: Localizer.langResources.MARKETING.CouponSets.create_manual_coupon_set,
                requiredBehaviors: {
                    model: 'Taco.model.Discount',
                    behavior: 'update'
                },
                menuColumnHandler: function (item, eventData) {
                    item.scope.createCouponSet("Manual");
                },
                scope: me
            },
            {
                text: Localizer.langResources.MARKETING.CouponSets.create_generated_coupon_set,
                requiredBehaviors: {
                    model: 'Taco.model.Discount',
                    behavior: 'update'
                },
                menuColumnHandler: function (item, eventData) {
                    item.scope.createCouponSet("Generated");
                },
                scope: me
            });

        return gridActions;
    },

    createCouponSet: function (couponSetType) {
        var me = this;

        Ext.create('Taco.view.couponSet.modal.CouponSetEditor', {
            record: null,
            createType: couponSetType,
            isCreateMode: true,
            listeners: {
                aftersaveclose: function (window, newRecord, e) {
                    me.store.add(newRecord);
                },
                scope: me
            }
        });
    },

    editCouponSet: function(record, couponSetType, isCreateMode) {
        var me = this;

        Ext.create('Taco.view.couponSet.modal.CouponSetEditor', {
            // if we want to edit a draft only, pass recordId.
            // otherwise, pass the record.

            record: record,
            createType: couponSetType,
            isCreateMode: isCreateMode,
            listeners: {
                aftersaveclose: function (window, newRecord, e) {
                    me.store.remove(record);
                    me.store.add(newRecord);
                    //me.store.reload();
                },
                scope:me
            }
        });


    },


    // when we have a single value situation;
    createField: function () {
        var fieldCfg = this.getFieldConfig(),
            value = (this.field) ? this.field.getValue() : this.value,
            fieldRecord = this.getFieldRecord(),
            isDisabled = (!fieldRecord);

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

        if (!this.singleSelect) {
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
    updateFieldEditability: function () {
        var me = this,
            isEditable = (me.fieldRecord);

        if (me.rendered) {
            me.setDisabled(!isEditable);
        } else {
            me.disabled = !isEditable;
        }
    },

    getFieldConfigByDataType: function (dataType, fieldCfg) {
        var fieldCfg = fieldCfg || {};

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
                    allowDecimals: false,
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
    getFieldConfigByXType: function (fieldCfg, fieldRecord) {
        var me = this;

        switch (fieldCfg.xtype) {
            case "combo":
                var displayField = fieldCfg.displayField || "name";
                var valueField = fieldCfg.valueField || "id";

                Ext.applyIf(fieldCfg, {
                    store: Ext.create('Ext.data.Store', {
                        fields: [valueField, displayField],
                        data: fieldRecord.get("validEnumValues")
                    }),
                    queryMode: 'local',
                    valueNotFoundText: Localizer.langResources.MARKETING.CouponSets.not_found_text,
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
                fieldCfg = this.getFieldConfigByXType(fieldCfg, fieldRecord);
            }
        }

        cfg = Ext.Object.mergeIf({

        }, fieldCfg, {
            width: 300,
            xtype: "textfield",
            allowBlank: this.allowBlank,
            name: this.name || "valuefield"
        }
        );

        return cfg;
    },

    updateFieldRecord: function () {
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

    getErrors: function() {
        return this.callParent(arguments);
    },

    validate: function () {
        if (!this.isVisible() || this.isDisabled()) {
            return true;
        } else {
            if (!this.allowBlank) {
                return (this.getValue());
            }
        }
        
    },
    onDestroy: function () {
        this.callParent(arguments);
    }
});
