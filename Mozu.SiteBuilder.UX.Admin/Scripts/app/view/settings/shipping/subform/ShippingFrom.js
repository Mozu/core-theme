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
        


        // need to define the store seperate from the combo so that the combo gets a paging toolbar. 
        var locationStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Locations',
            pageSize: 10,
            autoLoad: true,
            remoteFilter: false
        })

        this.shipFromCombo = Ext.create('Ext.form.field.ComboBox', {        
            name: 'shippingLocationCode',
            width: 300,

            // this enables the combo to call the service when the field initializes to retrieve the displayField value for the current valueField;
            autoFetchDisplayValue: true,


            fieldLabel: 'Shipping From',
            editable: false,            
            forceSelection: true,            
            displayField: 'name',
            valueField: 'code',
            allowBlank: true,
            enableKeyboardPaging: true,
            store: locationStore,
            pageSize: 10,
            listConfig: {
             //   cls: "location-picker-menu",
                maxWidth: "400",
                // Custom rendering template for each item
               // getInnerTpl: function () {
               //     return "<span class='name'>{name}</span> <span class='code'>{code}</span>"
               // },

                // this is an override that hides the paging toolbar when the list only contains a single page of results;
                refresh: function () {
                    var me = this,
                        toolbar = me.pagingToolbar;

                    Ext.view.View.prototype.refresh.call(me);
                    if (me.rendered && toolbar && toolbar.rendered && !me.preserveScrollOnRefresh) {
                        me.el.appendChild(toolbar.el);
                        if (me.getStore().getTotalCount() <= me.pageSize) me.el.last().hide();
                        else me.el.last().show();
                    }
                }
            }
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