/**
 * @class Taco.view.location.subform.Location
 */
Ext.define('Taco.view.location.subform.Location', {    
    // this is the secret sauce. Your subform panel must extend Taco.core.ux.form.Form in order to participate in the automated saveTasks behavior of the parent form
    extend: 'Taco.core.ux.form.Form',
    // gives the form the correct ux
    ui: 'subform',
    
    requires: [
        'Taco.core.ux.form.BoxSelect',
        'Taco.shared.view.modal.Address',
        'Taco.shared.view.field.Address',
        'Taco.core.ux.form.field.EditableDisplayField'
    ],
    title: 'Location',
    margin: "0 0 20 0",
    tools: null,    
    config: {    
        record: null,
        itemId:"location"
    },
    initComponent: function () {
        var me = this;

        me.cls = [me.cls, Taco.baseCSSPrefix + 'locationform-location'].join(' ');

        var locationTypesStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.LocationTypes',
            listeners: {
                load: {
                    fn: function () {
                        
                    },
                    single:true,
                    scope:me
                }
            }
        });
        
        // note there are two different boxSelects. Dont' use the other one. your welcome.
        me.locationTypeIds = Ext.create('Ext.ux.form.field.BoxSelect', {
            width: 300,
            fieldLabel: 'Location Types',
            name: 'locationTypeIds',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'code',
            emptyText: 'Select',
            allowBlank: false,
            store: locationTypesStore
        });

        

        // note there are two different boxSelects. Dont' use the other one. your welcome.
        me.fulfillmentTypeIds = Ext.create('Ext.ux.form.field.BoxSelect', {
            width: 300,
            fieldLabel: 'Fulfillment Types',
            name: 'fulfillmentTypeIds',
            queryMode: 'local',
            //multiSelect: true,
            displayField: 'name',
            valueField: 'code',
            emptyText: 'Select',
            allowBlank: true,
            store: Ext.create('Ext.data.Store', {
                autoLoad:true,
                fields: ['code', 'name', "shippingRequired"],
                data: me.record.getFulfillmentTypes()
            })
        });
      


        me.addressView = Ext.create('Taco.shared.view.field.Address', {
            name: "address",
            allowBlank: false,
            // extra components to be inserted after the edit button
            buttonItems: [
                {
                    xtype: "splitter"
                }, {
                    xtype: 'button',
                    ui: "action",
                    scale: "medium",
                    text: "Get Latitude/Longitude",
                    handler: function () {
                        me.record.getGeo({
                            jsonData: {
                                address: me.addressView.addressField.getValue()
                            },
                            success: function (response) {
                                // update the lat long fields
                                var json = Ext.decode(response.responseText, true);
                                if (json && json.success) {
                                    me.getForm().findField("lat").setValue(json.geo.lat);
                                    me.getForm().findField("lng").setValue(json.geo.lng);
                                }
                            },
                            scope: this
                        });
                    },
                    scope: this
                }
            ]
        });
        


        /*
        this.addressView = Ext.create('Ext.form.field.Display',{
            fieldLabel: 'Address',
            name:"address",
            fieldStyle : "color: #333333;padding: 5px 10px 3px 10px;background: white repeat-x 0 0;border-width: 1px;border-style: solid;border-color: #bfbfbf;",
            width: 400,
            allowBlank: false,
            
            isValid: function () {
                var value = this.getValue();
                return (value && value.addressIsValidated);
            },
            
            validate: function () {
                return this.isValid();
            },
            
            renderer: function (value, field) {
                return Ext.create('Ext.XTemplate', [
                    '<tpl if="!address1 && !address2 && !address3 && !address4">',
                        //'<div class="address-none" style="color:#ccc;"><br></div>',
                    '<br>',
                    '<tpl else>',
                        '<div class="address-line-1">{address1}</div>',
                        '<div class="address-line-2">{address2}</div>',
                        '<div class="address-line-3">{address3}</div>',
                        '<div class="address-line-4">{address4}</div>',
                        '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
                        '<div class="country">{countryCode}</div>',
                    '</tpl>'
                ]).apply(value);
            }
        });

        this.editAddressButton = Ext.create('Ext.button.Button',{
            ui: "action",
            scale:"medium",
            text: 'Edit Address',
            handler: function () {
                    var modal = Ext.create('Taco.shared.view.modal.Address', {
                    record: me.addressView.getValue(),
                    scale: null,
                    addressHasNames: false,
                    showCompanyName: false,
                    showEmail: false,
                    showPhoneNumbers: false,
                    validateAddress: true,
                    listeners: {
                        savesuccess: function (win, record) {
                            var updatedAddressData = record.data;
                            var address = Ext.clone(me.addressView.originalValue);
                            var addressFields = Ext.Object.getKeys(address);
                            address = Ext.copyTo(address, updatedAddressData, addressFields);
                            me.addressView.setValue(address);
                        }
                    }
                });
            },
            scope:this

        });

        */
                
        this.items = [
            this.locationTypeIds,
            this.fulfillmentTypeIds,
            {
                xtype: "textfield",
                name: "name",
                width: '100%',
                fieldLabel: 'Name',
                allowBlank: false
            }, {
                xtype: "textfield",
                name: "description",
                width: '100%',
                fieldLabel: 'Description',                
                allowBlank: true
            }, {
                xtype: "textfield",
                name: "code",
                width: 300,
                fieldLabel: 'Code',
                allowBlank: false
            }, {
                // note: may need to convert this to a checkbox of on/off toggle if the service supports undelete. TBD
                xtype:"displayfield",
                name: "isDeleted",
                hidden: (!me.record.get("isDeleted")),
                width:200,
                fieldLabel: "Location Status",
                renderer: function (value, field) {
                    if (value==="true") {
                        return "Location has been deleted";
                    } else {
                        return "Active";
                    }
                }
            },
            this.addressView,
            
            /*
            this.addressView,
            {
                xtype: 'fieldcontainer',
                width: 400,
                layout: 'hbox',
                items: [
                    this.editAddressButton,
                    {
                        xtype: "splitter"
                    },{
                        xtype: 'button',
                        ui: "action",
                        scale: "medium",
                        text: "Get Latitude/Longitude",
                        handler: function () {
                            this.record.getGeo({
                                jsonData: {
                                    address: this.addressView.getValue()
                                },
                                success: function (response) {
                                    // update the lat long fields
                                    this.getForm().findField("latitude").setValue(json.geolocation.latitude);
                                    this.getForm().findField("longitude").setValue(json.geolocation.longitude);
                                },
                                failure: function(response) {
                                    
                                },
                                scope:this
                            });
                        },
                        scope: this
                    }
                ]
            }, 
            
            
            */
            
            {
                xtype: 'fieldcontainer',
                width:"100%",
                layout: 'hbox',
                items: [{
                    xtype: 'textfield',
                    fieldLabel:"Latitude",
                    name: "lat",
                    allowBlank: false,
                    value: this.record.get("geo").lat,
                    flex: 1
                }, {
                    xtype:"splitter"
                }, {
                    xtype: 'textfield',
                    fieldLabel: "Longitude",
                    allowBlank: false,
                    name: "lng",
                    value: this.record.get("geo").lng,
                    flex: 1
                }]
            },
            
            {
                xtype: "textfield",
                name: "phone",
                width: 200,
                fieldLabel: 'Phone',
                allowBlank: true
            }, {
                xtype: "textfield",
                name: "fax",
                width: 200,
                fieldLabel: 'Fax',
                allowBlank: true
            }, {
                xtype: "textarea",
                name: "notes",
                width: '100%',
                fieldLabel: 'Notes',
                allowBlank: true
            }, {
                xtype: "checkbox",
                name: "supportsInventory",
                width: 200,
                fieldLabel: 'Supports Inventory Flag',
                boxLabel: "Enabled",
                allowBlank: true
            }
        ];
        
        this.callParent(arguments);
    },

    // this is optional. Do some additional save tasks after the automatic update-record task executes. This allows you to extract complext data from the form and write it to the record
    addSaveTasks: function (tasks) {
        var me = this;
        console.log("subForm level save task ");

        tasks.add({
            // the name of your task
            key: 'update-location',
            // the name of the task you want to follow
            dependencies: this.tasksKeyPrefix + "update-record",
            // executes when the task exectutes
            fn: function () {
                // manually update the record
                var form = me.getForm();
                
                // this data member wants the record data instead of the array of values that is return by combo. need to translate to record.data objects
                var locationTypes = form.findField("locationTypeIds");
                me.record.set('locationTypes', locationTypes.getValueRecordsData());
                // updating the non persisted field just to be consistant
                me.record.set('locationTypeIds', locationTypes.getValueRecordsData());

                // this data member wants the record data instead of the array of values that is return by combo. need to translate to record.data objects
                var fulfillmentTypes = form.findField("fulfillmentTypeIds");
                me.record.set('fulfillmentTypes', fulfillmentTypes.getValueRecordsData());
                // updating the non persisted field just to be consistant
                me.record.set('fulfillmentTypeIds', fulfillmentTypes.getValueRecordsData());
                
                me.record.set("geo", {
                    lat: form.findField("lat").getValue(),
                    lng: form.findField("lng").getValue()
                });
            }
        });
        return tasks;
    }
});
