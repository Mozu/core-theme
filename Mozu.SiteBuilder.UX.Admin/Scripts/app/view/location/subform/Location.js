/**
 * @class Taco.view.location.subform.Location
 */

Ext.define('Taco.view.location.subform.Location', {
    // this is the secret sauce. Your subform panel must extend Taco.core.ux.form.Form in order to participate in the automated saveTasks behavior of the parent form
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.ux.form.field.BoxSelect',
        'Taco.shared.view.modal.Address',
        'Taco.shared.view.field.Address',
        'Taco.core.ux.form.field.EditableDisplayField',
        'Taco.core.ux.form.PhoneNumberField'
    ],

    ui: 'subform', // gives the form the correct ux    
    title: 'Location',
    margin: '0 0 20 0',
    tools: null,

    config: {
        record: null,
        itemId: "location"
    },

    initComponent: function () {
        var me = this;

        me.cls = [me.cls, Taco.baseCSSPrefix + 'locationform-location'].join(' ');

        var locationTypesStore = Taco.core.data.StoreManager.getOrCreate({
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

        // note there are two different boxSelects. Dont' use the other one. your welcome.
        me.locationTypeIds = Ext.create('Ext.ux.form.field.BoxSelect', {
            width: 400,
            fieldLabel: 'Location Types',
            name: 'locationTypeIds',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'code',
            emptyText: 'Select',
            allowOnlyWhitespace: false,
            store: locationTypesStore
        });        

        // note there are two different boxSelects. Dont' use the other one. your welcome.
        me.fulfillmentTypeIds = Ext.create('Ext.ux.form.field.BoxSelect', {
            width: 400,
            fieldLabel: 'Fulfillment Types',
            name: 'fulfillmentTypeIds',
            queryMode: 'local',
            //multiSelect: true,
            displayField: 'name',
            valueField: 'code',
            emptyText: 'Select',
            allowOnlyWhitespace: true,
            store: Ext.create('Ext.data.Store', {
                autoLoad: true,
                fields: ['code', 'name', "shippingRequired"],
                data: me.record.getFulfillmentTypes()
            })
        });

        me.shippingContextField = Ext.create('Taco.core.ux.form.field.EditableDisplayField', {
            name: 'shippingOriginContact',
            width: 400,
            fieldLabel: 'Shipping Origin Contact',
            //allowOnlyWhitespace: false,
            allowBlank:false,
            validator: function (value) {
                // check for required fields;
                if (value && value.phoneNumber && value.companyOrOrganization) {
                    return true
                } else {
                    return "Shipping Origin Contact Is required"
                }
            },
            onClick: function () {
                var modal = Ext.widget('taco-modal', {
                    autoShow: true,
                    scale: 'large',
                    closeAction:"destroy",
                    title: "Shipping origin contact",
                    items: [{
                        xtype: 'formform',
                        defaults: {
                            xtype: 'textfield',
                            anchor: '100%'
                        },
                        items: [
                            {
                                name: 'firstName',
                                fieldLabel: 'First Name'
                            }, {
                                name: 'middleNameOrInitial',
                                fieldLabel: 'Middle Name'
                            }, {
                                name: 'lastNameOrSurname',
                                fieldLabel: 'Last Name'
                            }, {
                                name: 'companyOrOrganization',
                                allowOnlyWhitespace: false,
                                fieldLabel: 'Company Name'
                            }, {
                                xtype: 'phonefield',
                                name: 'phoneNumber',
                                fieldLabel: 'Phone Number',
                                allowOnlyWhitespace: false
                            }, {
                                xtype: 'textfield',
                                name: 'email',
                                fieldLabel: 'Email',
                                // allow blank: if directship, then no.
                                allowOnlyWhitespace: me.fulfillmentTypeIds && me.fulfillmentTypeIds.value && !Ext.Array.contains(me.fulfillmentTypeIds.value, "DS")
                            }
                        ]
                    }],
                    listeners: {
                        close: function () {                            
                            me.shippingContextField.focus();
                        },
                        savesuccess: function (view, data) {                            
                            me.shippingContextField.setValue(data);
                        }
                    }
                });

                modal.form.getForm().setValues(me.shippingContextField.getValue());
            },
            tpl: [
                '<tpl if="values.firstName || values.middleNameOrInitial ||  values.lastNameOrSurname">',
                    '<div class="address-line-1">Name: {firstName} {middleNameOrInitial} {lastNameOrSurname}</div>',
                '</tpl>',
                '<tpl if="values.companyOrOrganization">',
                    '<div class="city-state-zip">Company Name: {companyOrOrganization}</div>',
                '</tpl>',
                '<tpl if="values.phoneNumber">',
                    '<div class="country">Phone Number: {phoneNumber}</div>',
                '</tpl>'
            ]
        });

        me.addressView = Ext.create('Taco.shared.view.field.Address', {
            name: "address",
            //allowOnlyWhitespace: false
            allowBlank:false

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
                allowOnlyWhitespace: false
            }, {
                xtype: "textfield",
                name: "description",
                width: '100%',
                fieldLabel: 'Description',
                allowOnlyWhitespace: true
            }, {
                xtype: "textfield",
                name: "code",
                // don't allow the code to be changed once its persisted;
                readOnly: me.record.get("code"),
                width: 300,
                fieldLabel: 'Code',
                allowOnlyWhitespace: false
            }, {
                // note: may need to convert this to a checkbox of on/off toggle if the service supports undelete. TBD
                xtype: "displayfield",
                name: "isDeleted",
                hidden: (!me.record.get("isDeleted")),
                width: 200,
                fieldLabel: "Location Status",
                renderer: function (value, field) {
                    if (value === "true") {
                        return "Location has been deleted";
                    } else {
                        return "Active";
                    }
                }
            },
            this.addressView,
            me.shippingContextField,
            {
                xtype: 'fieldcontainer',
                width: "100%",
                layout: 'hbox',
                items: [{
                    xtype: 'numberfield',
                    fieldLabel: "Latitude",
                    name: "lat",
                    margin:"0 2 0 0",
                    emptyText: "Example: 87.728056",
                    decimalPrecision: 10,
                    allowOnlyWhitespace: true,
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    value: this.record.get("geo").lat,
                    flex: 1
                }, {
                    xtype: 'numberfield',
                    fieldLabel: "Longitude",
                    emptyText: "Example: 87.728056",
                    margin: "0 0 0 2",
                    allowOnlyWhitespace: true,
                    decimalPrecision:10,
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    name: "lng",
                    value: this.record.get("geo").lng,
                    flex: 1
                }]
            }, {
                xtype: "phonefield",
                name: "phone",
                width: 200,
                fieldLabel: 'Phone',
                allowOnlyWhitespace: true
            }, {
                xtype: "phonefield",
                name: "fax",
                width: 200,
                fieldLabel: 'Fax',
                allowOnlyWhitespace: true
            }, {
                xtype: "textarea",
                name: "note",
                width: '100%',
                fieldLabel: 'Notes',
                allowOnlyWhitespace: true
            }, {
                xtype: "checkbox",
                name: "supportsInventory",
                width: 200,
                fieldLabel: 'Supports Inventory Flag',
                boxLabel: "Enabled",
                allowOnlyWhitespace: true
            }];

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