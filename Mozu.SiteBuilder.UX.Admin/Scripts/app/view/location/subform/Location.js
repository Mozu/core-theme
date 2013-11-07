/**
 * @class Taco.view.location.subform.Location
 */
Ext.define('Taco.view.location.subform.Location', {    
    // this is the secret sauce. Your subform panel must extend Taco.core.ux.form.Form in order to participate in the automated saveTasks behavior of the parent form
    extend: 'Taco.core.ux.form.Form',
    // gives the form the correct ux
    ui: 'subform',
    
    requires: [
        'Ext.ux.form.field.BoxSelect',
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
            autoLoad:true,
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
            width: 350,
            fieldLabel: 'Location Types',
            name: 'locationTypeIds',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'code',
            //emptyText: 'Select',
            allowBlank: false,
            store: locationTypesStore
        });

        

        // note there are two different boxSelects. Dont' use the other one. your welcome.
        me.fulfillmentTypeIds = Ext.create('Ext.ux.form.field.BoxSelect', {
            width: 350,
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
            allowBlank: true
            // extra components to be inserted after the edit button
            
                //(Simeon) commented this out pending acquisition of services to do this address to geo location conversion;
                //http://tfs.ads.volusion.com:8080/tfs/VNext/Mozu/_workitems/edit/19745
                /*
                ,buttonItems: [
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
                ]*/
            
            
        });
                
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
                // don't allow the code to be changed once its persisted;
                readOnly : me.record.get("code"),
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
            {
                xtype: 'fieldcontainer',
                width:"100%",
                layout: 'hbox',
                items: [{
                    xtype: 'numberfield',
                    fieldLabel:"Latitude",
                    name: "lat",
                    emptyText:"Example: 87.728056",
                    allowBlank: true,
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    value: this.record.get("geo").lat,
                    flex: 1
                }, {
                    xtype:"splitter"
                }, {
                    xtype: 'numberfield',
                    fieldLabel: "Longitude",
                    emptyText: "Example: 87.728056",
                    allowBlank: true,
                    hideTrigger: true,
                    mouseWheelEnabled: false,
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
                name: "note",
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

    beforeSave: function () {
        var me = this;
        // do any form validation. return false if the form is not valid for save;

        // do any manual record updates from the form;
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
      
        // need to manually mark dirty since the setValue with complex data doesn't trigger the dirty state on the model
        me.record.setDirty();
        
        return true;
    }
});
