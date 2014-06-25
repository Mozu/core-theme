/**
 * @class Taco.view.settings.shipping.subform.ShippingFrom
 *
 */

Ext.define('Taco.view.settings.shipping.subform.ShippingFrom', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.store.LocationTypes',
        'Taco.store.Locations',
        'Ext.ux.form.field.BoxSelect',
        'Ext.form.FieldContainer',
        'Ext.form.CheckboxGroup',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Text'
    ],
    title: 'Fulfillment Options',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",
    
    initComponent: function () {
        var me = this, isAddressEmpty = true;
        this.shipFromCombo = Ext.create('Ext.form.field.ComboBox', {
            name: 'shippingLocationCode',
            width:300,
            fieldLabel: 'Shipping From',
            editable: false,
            forceSelection: true,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'code',
            allowBlank: true,
            store: Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Locations',
                autoLoad: true,
                remoteFilter: false
            })
        });

        // note there are two different boxSelects. Dont' use the other one. your welcome.
        me.locationTypeIds = Ext.create('Ext.ux.form.field.BoxSelect', {
            width: 450,
            fieldLabel: 'In Store Pickup From Location Types',
            name: 'storePickupLocationTypeCodes',
            hidden: !this.record.get("enableInStorePickup"),
            queryMode: 'local',
            displayField: 'name',
            valueField: 'code',
            allowBlank: true,
            store: Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.LocationTypes',
                autoload:true
            })
        });


        this.items = [
            this.shipFromCombo,
            {
                xtype: 'fieldcontainer',
                fieldLabel: "Enabled Fulfillment Methods",
                layout:"column",
                items: [
                    {
                        xtype: "checkboxgroup",
                        columnWidth: .5,
                        layout: {
                            layout : "hbox"
                        },
                        columns:1,
                        items: [
                            {
                                xtype: "checkboxfield",
                                boxLabel: "Direct Ship",
                                inputValue: true,
                                name: "enableDirectShip",
                                checked: true,
                                disabled: true,
                                readOnly: true
                            },{
                                xtype: "checkboxfield",
                                boxLabel: "In Store Pickup",
                                inputValue: true,
                                name: "enableInStorePickup",
                                listeners: {
                                    change: {
                                        fn: function (cmp, newValue, oldValue, eOpts) {
                                            me.locationTypeIds.setVisible(newValue);
                                        },
                                        scope: me
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            
            me.locationTypeIds
            
        ];

        this.callParent(arguments);

    }
    
});