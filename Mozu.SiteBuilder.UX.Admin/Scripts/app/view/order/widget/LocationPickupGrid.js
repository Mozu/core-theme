/**
 * @class Taco.view.order.widget.LocationPickupGrid
 */
Ext.define('Taco.view.order.widget.LocationPickupGrid', {
    extend: 'Taco.core.ux.browser.SearchList',
    requires: [
        'Taco.store.LocationPickup',
        'Taco.model.LocationPickup'
    ],
    title: "",
    cls: Taco.baseCSSPrefix + 'locationpickupgrid',
    enableSearch: false,
    enablePaging: true,
    enableRowEditing: false,
    hideSearchToolbar: true,
    selType: 'checkboxmodel',
    selModel: {
        mode:"SINGLE"  
    },
    width: "100%",
    initComponent: function () {
        var me = this;        
        Ext.apply(me, {
            viewConfig: {
                deferEmptyText: false,
                emptyText: "No locations available"
            },
            listeners: {
                
            },
            columns: this.getColumnConfig()
        });

        this.store = Ext.create('Ext.data.Store', {
            model: 'Taco.model.LocationPickup'
        });

        this.store.on('load', function() {
            var code = this.record.data.fulfillmentLocationCode;
            var selModel = this.getSelectionModel();
            var record = this.store.getById(code);
            if (!record) {
                // if no selection found, select the first rrecord;
                record = 0;
            }
            selModel.select(record);
        }, me);
       

        this.store.load(
            {
                params: {
                    productCode: this.record.get('productCode')
                }
            });
       
        this.callParent(arguments);
    },
    
    getColumnConfig: function () {
        var me = this;
        
        return [
            {
                flex:1,
                text: "Location",
                menuDisabled: true,
                dataIndex: 'location',
                xtype: "templatecolumn",
                tpl: [
                    '<div>{location.name}</div>',
                    '<tpl for="location.address">',
                        '<tpl if ="address1">',
                            '<div>{address1}</div>',
                        '</tpl>',
                        '<tpl if ="address2">',
                            '<div>{address2}</div>',
                        '</tpl>',
                        '<tpl if ="address3">',
                            '<div>{address3}</div>',
                        '</tpl>',
                        '<tpl if ="address4">',
                            '<div>{address4}</div>',
                        '</tpl>',
                        '<div>{cityOrTown} {stateOrProvince} {postalOrZipCode} {countryCode}</div>',
                    '</tpl>'
                    
                ]
            },{
                flex: 1,
                text: "Hours",
                sortable:false,
                menuDisabled: true,
                dataIndex: 'location',
                xtype: "templatecolumn",
                tpl: [
                    '<div>Sunday: {location.hours.sunday.label}</div>',
                    '<div>Monday: {location.hours.monday.label}</div>',
                    '<div>Tuesday: {location.hours.tuesday.label}</div>',
                    '<div>Wednesday: {location.hours.wednesday.label}</div>',
                    '<div>Thursday: {location.hours.thursday.label}</div>',
                    '<div>Friday: {location.hours.friday.label}</div>',
                    '<div>Saturday: {location.hours.saturday.label}</div>'
                ]
            },{
                width: 100,
                text: "Available",
                menuDisabled: true,
                dataIndex: 'stockAvailable'
            }, {
                width: 100,
                text: 'On Reserve',
                menuDisabled: true,
                dataIndex: 'stockReserved'
            }, {
                width: 100,
                text: 'On Hand',
                menuDisabled: true,
                dataIndex: 'stockOnHand'
            }
        ];
    }
});
