/**
 * @class Taco.view.order.Header
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.subform.Detail', {
    extend: 'Ext.container.Container',
    requires: [],
    config : {
        
    },
    
    cls: Taco.baseCSSPrefix + 'orderform-detail',
    
    // todos:remove border and style info after base class css is setup.
    // border: 1,
    style: {
        // margin:"10px 0 0 0",
        // borderColor: "#666",
        // borderStyle: "solid",
        backgroundColor:"#fff",
        // padding: 0
    },
    
    initComponent: function (eOpts) {
        var me = this;
        


        // gridHeader class
        /*

        this.gridHeader = Ext.create('Ext.container.Container',{
            cls: "orderform-detail-columnHeader",
            layout: {
                type: 'hbox',
                align: 'stretch',
                pack: 'start'
            },
            //move to scss
            defaults: { xtype: "component", style: "border-bottom:1px solid #ccc;padding:2px 2px 2px 2px" },
            items: [
                {
                    html: 'Products',
                    flex: 1
                }, {
                    html: 'Price',
                    width: 120
                }, {
                    html: 'Quantity',
                    width: 120
                }, {
                    html: 'Row Total',
                    width: 120
                }
            ]
        });
        */
        /*

        var testRowCfg = {
            xtype:"container",
            cls: "orderform-detail-orderItem",
            layout: {
                type: 'hbox',
                align: 'stretch',
                pack: 'start'
            },
            //move to scss
            defaults: { xtype: "component", style: "border-bottom:1px dashed #ccc;padding:2px 2px 2px 2px;;text-align:rights" },
            items: [
                {
                    html: 'Slouchy leather lace',
                    flex: 1
                }, {
                    html: '$90.00',
                    width: 120
                }, {
                    html: '2',
                    width: 120
                }, {
                    html: '$180',
                    width: 120
                }
            ]
        }
        */
        
        // orderItem class
        // needs adjustment support
        // gridHeader class
        //this.orderItem = Ext.create('Ext.container.Container', testRowCfg);
        /*
        var testRowsCfg = [];
        for (var i = 0; i < 500;i++)
        {
            testRowsCfg.push(testRowCfg);
        }
        */
        
        /*
        this.orderItems = Ext.create('Ext.container.Container', {
            xtype: "container",
            cls: "orderform-detail-orderItems",
            layout: {
                type: 'auto'
            },
            
            items: testRowsCfg
            
        });

        */
        
        // Need total class
        
        
        

        var testData = {
            "id": "o124",
            "orderNumber": 107363,
            "createDate": "2013-03-18T00:00:00",
            "customer": {
                "id": "c12346",
                "firstName": "John",
                "lastName": "Smith",
                "customerSince": "2011-03-18T00:00:00",
                "totalOrders": 4,
                "totalSpent": 597.96,
                "groups": ["VIP", "Company ABC", "Coupon User"]
            },
            "ipAddress": "173.194.46.2",
            "items": [{
                "id": "i123",
                "productCode": "HOBO-LL",
                "productName": "Slouchy leather... lace hobo",
                "unitPrice": 90.0,
                "quantity": 2,
                "discount": {
                    "quantity": 2,
                    "description": "$10 off all leather bags",
                    "unitPrice": 10.0,
                    "total": 20.0
                },
                "subtotal": 180.0,
                "total": 160.0
            }, {
                "id": "i124",
                "productCode": "789MAE",
                "productName": "Mary Mae's... Summer Sandals",
                "unitPrice": 30.0,
                "quantity": 2,
                "subtotal": 60.0,
                "total": 60.0
            }
            ],
            "subtotal": 0.0,
            "discountTotal": 0.0,
            "shippingTotal": 0.0,
            "taxTotal": 0.0,
            "total": 229.48,
            "customerNote": "Please take special care in packaging. Thanks!"
        };
        
        for (var i = 0; i < 500; i++) {
            testData.items.push({
                "id": "i123_"+i,
                "productCode": "HOBO-LL",
                "productName": "Slouchy leather... lace hobo",
                "unitPrice": 90.0,
                "quantity": 2,
                "discount": {
                    "quantity": 2,
                    "description": "$10 off all leather bags",
                    "unitPrice": 10.0,
                    "total": 20.0
                },
                "subtotal": 180.0,
                "total": 160.0
            });
        }
        
        

        var store = Ext.create('Ext.data.Store', {
            model: 'Taco.model.OrderItem',
            data: testData.items
        });
        
        var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });
        
        
        var grid = Ext.create('Ext.grid.Panel', {
            store: store,
            autoHeight: true,
            managerHeight:false,
            viewConfig: {
                stripeRows: false,
                //   enableTextSelection: true
            },
            
            selModel: {
                selType: 'cellmodel'
            },
            
            plugins: [cellEditing],
            
            columns: [
                {
                    text: 'Products',
                    flex: 1,
                    sortable: false,
                    menuDisabled: true,
                    dataIndex: 'productName'
                },
                {
                    text: 'Price',
                    width: 100,
                    sortable: false,
                    menuDisabled: true,
                    align: "right",
                    renderer: 'usMoney',
                    editor: {
                        xtype: 'unitfield',
                        unitString:"$",
                        unitAtEnd:false,
                        allowBlank: true,
                        minValue: 0,
                        maxValue: 100000
                    },
                    dataIndex: 'unitPrice'
                },
                {
                    text: 'Quantity',
                    width: 100,
                    sortable: false,
                    menuDisabled: true,
                    align: "right",
                    //renderer: 'usMoney',
                    editor: {
                        xtype: 'textfield',
                        allowBlank: true,
                        minValue: 0,
                        maxValue: 100000
                    },
                    dataIndex: 'quantity'
                },
                {
                    text: 'Row Total',
                    menuDisabled: true,
                    width: 100,
                    sortable: false,
                    align: "right",
                    renderer: function (value, metaData, record) {
                        return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
                    },
                    dataIndex: 'subtotal'
                },
                {
                    xtype: 'taco.menucolumn',
                    text: '',
                    width:60,
                    menuDisabled: true,
                    iconCls: Taco.baseCSSPrefix + 'grid-row-menu-trigger ' + Taco.baseCSSPrefix + 'grid-row-menu-trigger-remove',
                    menuItems: [],
                    renderer: function (value, metaData, record) {
                        
                    },
                    onMenuShow: function (menu, eventData) {
                        // todos: remove item from grid
                        
                    }
                }
            ]
        });



        
        
        this.totalRow = Ext.create('Ext.container.Container', {
            cls: "orderform-detail-totalRow",
            layout: {
                type: 'hbox',
                align: 'stretch',
                pack: 'start'
            },
            //move to scss
            defaults: { xtype: "component", style: "border-bottom:1px dashed #ccc;padding:2px 2px 2px 2px;text-align:rights" },
            items: [
                {
                    html: '2',
                    flex:1
                }, {
                    html: '$180',
                    width: 120
                }
            ]
        });


        // need a customer notes class

        
        Ext.apply(this, {
            items: [
                //this.gridHeader,
                //this.orderItem,
                //this.orderItems,
                grid,
                this.totalRow
            ]

        })

        

        this.callParent(arguments);

    }
});
