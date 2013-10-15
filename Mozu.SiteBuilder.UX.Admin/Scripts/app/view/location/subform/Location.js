/**
 * @class Taco.view.location.subform.Location
 */
Ext.define('Taco.view.location.subform.Location', {    
    extend: 'Taco.core.ux.EditContainer',
    //extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.BoxSelect',
        'Taco.shared.view.modal.Address'
    ],
    
    title: 'Location',

    margin: "0 0 20 0",
    
    width: '100%',

    tools: null,    

    config: {    
        record: null,
        itemId:"location"
    },
    
    initComponent: function (eOpts) {
        var me = this;

        this.cls = [this.cls, Taco.baseCSSPrefix + 'locationform-location'].join(' ');

        this.locationType = Ext.widget({
            xtype: 'combo',
            width: 300,
            fieldLabel: 'Location Type',            
            name: 'locationTypeId',
            forceSelection: true,
            editable: false,
            emptyText: 'Select',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
            allowBlank: false,            
            store: Ext.create('Ext.data.Store', {
                fields: ['code', 'name'],
                data: [
                    {			
                        "name":"Warehouse 123",
                        "code": "W123",
                        "id":1
                    },
		            {			
		                "name":"Warehouse 224",
		                "code": "W224",
		                "id":2
		            },
		            {			
		                "name":"Retail Store 1",
		                "code": "RS1",
		                "id":3
		            },
		            {			
		                "name":"Kiosk",
		                "code": "K1",
		                "id":4
		            },
		            {			
		                "name":"Merge Center",
		                "code": "MC1",
		                "id":5
		            }
                ]
            })
        });        

        
        

        // fulfillmentType
        // needs a multiselect;
        this.fulfillmentType = Ext.create('Taco.core.ux.form.BoxSelect', {
            width: 300,
            fieldLabel: 'Fulfillment Type',
            name: 'fulfillmentTypeId',
            queryMode: 'local',
            //multiSelect: true,
            displayField: 'name',
            valueField: 'id',
            emptyText: 'Select',
            store: Ext.create('Ext.data.Store', {
                autoLoad:true,
                fields: ['code', 'name', "id", "shippingRequired"],
                data: this.record.getFulfillmentTypes()
            })
        });
        

        this.addressView = Ext.create('Ext.form.field.Display',{
            fieldLabel: 'Address',
            name:"address",
            fieldStyle : "color: #333333;padding: 5px 10px 3px 10px;background: white repeat-x 0 0;border-width: 1px;border-style: solid;border-color: #bfbfbf;",
            width:400,
            //Note: this is required to get a display field to accept a value thats an object; otherwise the value gets auto converted to a string;
            valueToRaw: function (value) {
                return value;
            },
            renderer: function(value, field) {
                return Ext.create('Ext.XTemplate', [
                    '<tpl if="!address1 && !address2 && !address3 && !address4">',
                        '<div class="address-none">none</div>',
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


        var addressData = this.record.get("address");

        this.editAddressButton = Ext.create('Ext.button.Button',{
            ui: "action",
            scale:"medium",
            text: 'Edit Address',
            handler: function () {
                var me = this
                
                var modal = Ext.create('Taco.shared.view.modal.Address', {
                    record: addressData,
                    scale: null,
                    addressHasNames: false,
                    showCompanyName: false,
                    showEmail: false,
                    showPhoneNumbers: false,
                    validateAddress: true,
                    listeners: {
                        savesuccess: function (win, record) {
                            //debugger;
                            //me.record.set('siteShippingOriginAddress', Ext.apply({}, me.addressRecord.data));
                            //me.addressView.update(me.addressRecord.data);
                        }
                    }
                });
            },
            scope:this

        });

        

        

               
        
                
        this.items = [            
            this.locationType,
            this.fulfillmentType,
            {
                xtype: "textfield",
                name: "name",
                width: '100%',
                fieldLabel: 'Name',
                allowBlank: false
            },
            {
                xtype: "textfield",
                name: "description",
                width: '100%',
                fieldLabel: 'Description',                
                allowBlank: true
            },
            this.addressView,
            this.editAddressButton,
            {
                xtype: "textfield",
                name: "Phone",
                width: 200,
                fieldLabel: 'Phone',
                allowBlank: true
            },
            {
                xtype: "textfield",
                name: "fax",
                width: 200,
                fieldLabel: 'Fax',
                allowBlank: true
            },
            {
                xtype: "textarea",
                name: "notes",
                width: '100%',
                fieldLabel: 'Notes',
                allowBlank: true
            },
            {
                xtype: "checkbox",
                name: "supportsInventory",
                width: 200,
                fieldLabel: 'Supports Inventory Flag',
                boxLabel: "Enabled",
                allowBlank: true
            }
            
        ];
        
        this.callParent(arguments);
    }
});
