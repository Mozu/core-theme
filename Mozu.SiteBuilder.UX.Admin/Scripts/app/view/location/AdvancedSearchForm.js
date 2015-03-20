/**
 * @class Taco.view.location.AdvancedSearchForm
 */
Ext.define('Taco.view.location.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.FieldContainer',
        'Taco.model.Location'
    ],

    defaults: {
        width:500,
        xtype: 'textfield'
    },
    initComponent: function () {
        var me = this,
            fulfillmentTypes = Ext.create('Taco.model.Location', {}).getFulfillmentTypes(); // todo: move to common location for static lookups? - Greg Murray on 2015-03-19 

        this.fulfillmentStore = Ext.create('Ext.data.Store', {
            fields: ['code', 'name', "shippingRequired"],
            data: fulfillmentTypes
        });

        this.locationTypesStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.LocationTypes',
            autoLoad: true,
            listeners: {
                load: {
                    fn: Ext.emptyFn,
                    single: true,
                    scope: me
                }
            }
        });

        this.items = [
            {
                xtype: 'fieldcontainer',
                layout: "hbox",
                items: [
                    {
                        xtype: 'combobox',
                        name: 'locationtype',
                        fieldLabel: 'Location Type',
                        flex: 1,
                        margin: { right: 40 },
                        valueNotFoundText: 'not found',
                        editable: false,
                        autoSelect: false,
                        trigger2Cls: 'x-form-clear-trigger',
                        onTrigger2Click: function() {
                            this.clearValue();
                        },
                        queryMode: 'local',
                        valueField: 'code',
                        displayField: 'name',
                        store: this.locationTypesStore
                    },
                    {
                        xtype: 'combobox',
                        name: 'fulfillmentType',
                        fieldLabel: 'Fulfillment Type',
                        flex: 1,
                        valueNotFoundText: 'not found',
                        editable: false,
                        autoSelect: false,
                        trigger2Cls: 'x-form-clear-trigger',
                        onTrigger2Click: function() {
                            this.clearValue();
                        },
                        valueField: 'id',
                        displayField: 'name',
                        queryMode: 'local',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['id', 'name'],
                            data: [
                                { id: 'DS', name: 'Direct Ship' },
                                { id: 'SP', name: 'In Store Pickup' }
                            ]
                        })
                    }
                ]
            }, {
                xtype: 'fieldcontainer',
                layout: "hbox",
                items: [
                    {
                        xtype: 'combobox',
                        name: 'status',
                        fieldLabel: 'Status',
                        flex: 1,
                        margin: { right: 40 },
                        valueNotFoundText: 'not found',
                        editable: false,
                        autoSelect: false,
                        trigger2Cls: 'x-form-clear-trigger',
                        onTrigger2Click: function() {
                            this.clearValue();
                        },
                        valueField: 'id',
                        displayField: 'name',
                        queryMode: 'local',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['id', 'name'],
                            data: [
                                { id: 'all', name: 'All' },
                                { id: 'active', name: 'Active' },
                                { id: 'disabled', name: 'Disabled' }
                            ]
                        })
                    }, {
                        xtype: 'combobox',
                        name: 'supportsInventory',
                        fieldLabel: 'Supports Inventory',
                        flex: 1,
                        valueNotFoundText: 'not found',
                        editable: false,
                        autoSelect: false,
                        trigger2Cls: 'x-form-clear-trigger',
                        onTrigger2Click: function() {
                            this.clearValue();
                        },
                        valueField: 'id',
                        displayField: 'name',
                        queryMode: 'local',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['id', 'name'],
                            data: [
                                { id: true, name: 'Yes' },
                                { id: false, name: 'No' }
                            ]
                        })
                    }
                ]
            }, {
                xtype: 'textfield',
                name: 'code',
                fieldLabel: 'Code',
                width: 500
            }
        ];
         
        this.callParent(arguments);
    }
});