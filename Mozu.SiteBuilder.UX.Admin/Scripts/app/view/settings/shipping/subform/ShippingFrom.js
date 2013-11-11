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

        /*  { name: 'shippingLocationCode', type: 'string' },
            { name: 'inStorePickupLabel', type: 'string' },
            { name: 'enableInStorePickup', type: 'boolean' },
            { name: 'storePickupLocationTypeCodes', type: 'auto', defaultValue: [] },
           */
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
                remoteFilter: false,
                listeners: {
                    load: {
                        fn: function () {
                            //this.shipFromCombo.clearInvalid();
                        },
                        single: true,
                        scope: me
                    }
                }
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
            //{
            //    xtype: "textfield",
            //    width: 300,
            //    emptyText: "In Store Pickup",
            //    fieldLabel: "Override In Store Pickup Label",
            //    name:"inStorePickupLabel"
            //},
            {
                xtype: 'fieldcontainer',
                fieldLabel: "Enabled Fulfillment Methods",
                // note this layout is required for radiogroups to have the proper height;
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
                                            //toggle the visibility and set the toggle field to be required when visible and not required when hidden;
                                            // need to determine if this is required or not.
                                            //me.locationTypeIds.allowBlank = !newValue;
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

            //,this.addressView,
            //this.editButton,
            
        ];

        this.callParent(arguments);

        /*
        // address is deprecated as part of the omnichannel update
        // todo remove this code when complete;
        if (isAddressEmpty) {
            this.on('boxready', function () {
                this.editAddress();
            }, this);

        }

        */

    }
    /*
    // address is deprecated as part of the omnichannel update
        // todo remove this code when complete;
    ,
    editAddress: function () {
        var me = this,
            modal = Ext.create('Taco.shared.view.modal.Address', {
            record: me.addressRecord,
            addressHasNames: false,
            validateAddress: true,
            listeners: {
                savesuccess: function () {
                    me.record.set('siteShippingOriginAddress', Ext.apply({}, me.addressRecord.data));
                    me.addressView.update(me.addressRecord.data);
                }
            }
        });
    }
    */
    
});