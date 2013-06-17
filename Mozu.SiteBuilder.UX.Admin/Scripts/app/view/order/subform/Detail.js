/**
 * @class Taco.view.order.Header
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.subform.Detail', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [],
    config: {
        
        // order model
        record: null,
        
        // title for the panel header
        title: 'Order Details',
        
        // determines whether the detailGrid allows field editing
        editMode: true,
        
        // width of the actionColumn. used to align the grid total container
        actionColumnWidth: 60,
        
        // width of the row total Column. used to align the grid total container
        rowTotalColumnWidth: 100,
        
        itemId:"orderDetails",
        
        
        


        // components to add to the panel header. typically used to add an actions menu button
        tools: [{
            xtype: 'taco.button',
            width: 50,
            height: 30,
            text: ' ',
            menuAlign: 'tr-br',
            cls: Taco.baseCSSPrefix + 'editcontainer-menu-button',
            autoEl: {
                tag: 'a'
            },
            menu: {
                plain: true,
                items: [{
                    text: 'Edit Details'
                }, {
                    text: 'Cancel Order'
                }]
            }
        }]
    },
    
    // todos:remove border and style info after base class css is setup.
    
    
    initComponent: function (eOpts) {
        var me = this,
            orderItemStore,
            siteContext;

        siteContext = Taco.app.context.getCurrent().urlToken;
        

        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-detail'].join(' ');
        
        // store that contains the orderItems for this order model
        orderItemStore = this.record.itemsStore;

        
        if (!orderItemStore) {
            // no order items is an edge case but needs to be handled
            // show a no order items 
        }

        // test data for exercising the grid
        //this.initTestData();

        
        
        // plugin to add suppourt to the grid for editing the price and quantity columns
        var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });
        
        me.detailGrid = Ext.create('Ext.grid.Panel', {
            editMode: this.getEditMode(),
            store: orderItemStore,
            autoHeight: true,
            listeners: {
                beforeedit: {
                    fn: function(plugin, edit) {
                        // disable editing when the grid is not editMode:true
                        return this.editMode;
                    }
                },
                click: {
                    element: "el",
                    fn: function (e,target,eOpts) {
                        // handler for when user clicks on an order item product link
                        var productId = target.getAttribute("productCode");
                        this.viewProductDetail(productId);
                    },
                    scope:me, 
                    delegate: '.productLink'
                }
            },
                
            features: [

                // This is the plugin for enabling the adding of an adustment row for each orderItem
                {
                    ftype: 'rowbody',
                    rowBodyTrCls : "x-grid-row-adjustment",
                    rowBodyDivCls: "x-grid-cell-inner adustment-cell-inner",
                    rowBodyTdCls: "x-grid-cell adjustment-cell",
                    getAdditionalData: function (data, rowIndex, record, orig) {
                        var colspan = 1,
                            discount = record.get("discount"),
                            rowBodyCls = (discount) ? "hasDiscount" : "noDiscount";
                    
                        return {
                            discountData : discount,
                            rowBodyCls: rowBodyCls,
                            rowBodyColspan: colspan
                        };
                    },
                
                    getRowBody: function (values) {

                        return [
                            '<tr class="' + this.rowBodyTrCls + ' {rowBodyCls}">',
                                '<td  class="' + this.rowBodyTdCls + '" colspan="{rowBodyColspan}">',
                                    '<div class="' + this.rowBodyDivCls + '">Discount: {discountData.description}</div>',
                                '</td>',
                                '<td  class="' + this.rowBodyTdCls + '">',
                                    '<div style="text-align: right;" class="' + this.rowBodyDivCls + '">-{discountData.unitPrice:usMoney}</div>',
                                '</td>',
                                '<td class="' + this.rowBodyTdCls + '">',
                                    '<div style="text-align: right;" class="' + this.rowBodyDivCls + '">{discountData.quantity}</div>',
                                '</td>',
                                '<td  class="' + this.rowBodyTdCls + '">',
                                    '<div style="text-align: right;" class="' + this.rowBodyDivCls + '">-{discountData.total:usMoney}</div>',
                                '</td>',
                                '<td  class="' + this.rowBodyTdCls + '">',
                                    '<div class="' + this.rowBodyDivCls + '"></div>',
                                '</td>',
                            '</tr>'
                        ].join('');
                    }
                }
            

            ],
            
            
            viewConfig: {
                
                // changing the hover class to get rid of taco overrides of grid
                overItemCls: 'taco-orderItem-grid-row-over',
                emptyText: '<div class="emptyGridMessage">No order items to display</div>',
                deferEmptyText:false,
                stripeRows:false,
                disabled:false,  // disables the grid, prevents the field editors from opening. prevents default hover behavior. Makes text grey and background grey. TODOs, explore this as an option for making the grid readony.
                disabledCls: "taco-order-orderItemGrid-disabled", // css class to add when the order grid is disabledstripeRows: false,
                //   enableTextSelection: true
                listeners: {
                    itemmouseenter: {
                        fn: function (view, record, item, index, e, eOpts) {
                            
                        },
                        scope: me
                    },
                    highlightitem: {
                        fn: function (view, record, item, index, e, eOpts) {
                            
                        },
                        scope: me
                    }
                },
                
                // provides selective row class addition based on record.
                getRowClass: function (record) {
                    if (!record) return '';
                    if (record.get("discount")) {
                        return 'taco-order-orderItem-hasDiscount';
                    }
                    return '';
                }
            },
            
            
            selModel: {
                selType: 'cellmodel'
            },
            
            plugins: [cellEditing],
            
            columns: [
                {
                    text: 'Products',
                    draggable: false,
                    xtype: 'templatecolumn',
                    flex: 1,
                    sortable: false,
                    menuDisabled: true,
                    tpl: [
                            '<tpl if="isDeleted">',
                                '<span class="productLinkDisabled" productCode="{productCode}">{productName}</span>',
                            '<tpl else>',
                                '<a class="productLink" productCode="{productCode}" target="_blank" href="/admin/' + siteContext + '/products/edit/{productCode}">{productName}</a>',
                            '</tpl>',
            
                            '<div class="productOptions">',
                                '<tpl for="options">',
                                    '<span class="option">{.}, </span>',
                                '</tpl>',
                                '<span class="weight">{weight} lbs</span>',
                            '</div>'
                        ],
                    dataIndex: 'productName'
                },
                {
                    text: 'Price',
                    draggable: false,
                    width: 100,
                    sortable: false,
                    menuDisabled: true,
                    align: "right",
                    renderer: 'usMoney',
                    tdCls: "editableCell",  // adds the dotted line hover to the cells in the column
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
                    draggable: false,
                    width: 100,
                    sortable: false,
                    menuDisabled: true,
                    align: "right",
                    tdCls: "editableCell",  // adds the dotted line hover to the cells in the column
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
                    draggable: false,
                    menuDisabled: true,
                    width: this.getRowTotalColumnWidth(),
                    sortable: false,
                    align: "right",
                    renderer: 'usMoney',
                    dataIndex: 'subtotal'
                },
                {
                    xtype: 'taco.menucolumn',
                    draggable: false,
                    text: '',
                    width:this.getActionColumnWidth(),
                    menuDisabled: true,
                    iconCls: Taco.baseCSSPrefix + 'grid-row-menu-trigger ' + Taco.baseCSSPrefix + 'grid-row-menu-trigger-remove',
                    menuItems: [],
                    handler: function (grid, rowIndex, colIndex, header, e, record, item) {
                        Ext.Msg.alert('Remove Item', 'TODO: Confirm the removal of item.');
                    },
                    renderer: function (value, metaData, record) {
                        
                    },
                    onMenuShow: function (menu, eventData) {
                        // todos: remove item from grid
                        
                    }
                }
            ]
        });
        
        
      
        var totalData = this.record.getData();

        this.totalRow = Ext.create('Ext.container.Container', {
            cls: "orderform-detail-totalRow x-grid-row",
            layout: {
                type: 'hbox',
                align: 'stretch',
                pack: 'start'
            },
            //move to scss
            defaults: { xtype: "component"},
            items: [
                {
                      
                    tpl: [
                        '<div class="orderTotal-labels">',
                            '<div class="subTotalGroup">',
                                '<div class="subTotal">Subtotal:</div>',
                                '<tpl if="discountDescription!=\'\'">',
                                    '<div class="orderLevelCoupon">Order level coupon ($30 off $150):</div>',
                                '</tpl>',
                            '</div>',
                        
                            '<div class="shippingGroup">',
                                '<div class="shipping">Shipping(USPS Standard):</div>',
                                '<tpl if="shippingDiscount">',
                                    '<div class="shippingCoupon">{shippingDiscountDescription}:</div>',
                                '</tpl>',
                            '</div>',
                        
                            '<div class="totalGroup">',
                                // todos: add tpl:if to filter out adjusments and adjusment total if there is none;
                                '<tpl if="adjustmentDescription!=\'\'">',
                                    '<div class="adjustmentDescription">{adjustmentDescription}:</div>',
                                '</tpl>',
                                '<div class="tax">Tax:</div>',
                                '<div class="total">Total:</div>',
                            '</div>',
                        '</div>'
                    ],
                    data: totalData,
                    style:"text-align:right;",
                    flex:1
                }, {
                    data: totalData,
                    tpl: [
                        
                        '<div class="orderTotal-values">',
                            '<div class="subTotalGroup">',
                                '<div class="subTotal">{subTotal:usMoney}</div>',
                                '<tpl if="discountTotal">',
                                    '<div class="discountTotalValue">{discountTotal:usMoney}</div>',
                                '</tpl>',
                            '</div>',
                        
                            '<div class="shippingGroup">',
                                '<div class="shipping">{shippingTotal:usMoney}</div>',
                                '<tpl if="shippingDiscount">',
                                    '<div class="shippingCoupon">{shippingDiscount:usMoney}</div>',
                                '</tpl>',
                            '</div>',
                            
                            '<div class="totalGroup">',
                                '<tpl if="adjustmentTotal!=\'\'">',
                                    '<div class="adjustmentTotal">{adjustmentTotal:usMoney}</div>',
                                '</tpl>',
                                '<div class="tax">{taxTotal:usMoney}</div>',
                                '<div class="total">{total:usMoney}</div>',
                            '</div>',
                        '</div>'
                    ],
                    width: this.getRowTotalColumnWidth()
                }, {
                    width: this.getActionColumnWidth()
                }
            ]
        });
        
    
        // customer notes class
        this.customerNoteRow = Ext.create('Ext.Component', {
            cls: "orderform-detail-customerNotesRow",
            tpl: [
                '<div class="customerNote">',
                    '<span class="label">Customer Notes:</span> {customerNote}',
                '</div>'
            ],
            data:this.record.getData()
        });
        

        
        Ext.apply(this, {
            items: [
                me.detailGrid,
                this.totalRow,
                this.customerNoteRow
            ]
        });

        this.callParent(arguments);
    },
        
    // handler for when user clicks on an order item product link
    viewProductDetail: function (productId) {
        
        return;
        // disabled this method and made and used link instead;
        // leaving this code temporarily in case I need to add some logic to inhibit the link


        if (!productId) {
            return;
        }
        //link to the store front version
        //window.open('/_gosite/' + record.getId() + '?environment=preview&redir=' + encodeURIComponent('/product/' + eventData.record.getId()), 'taco-preview');
        window.open("/product/" + productId);


        //link to the editor
        //window.open("http://dev.mozu.com:8081/admin/c-1/products/edit/" + productId);
    },
    


    // test data for exercising the grid and totalRow
    initTestData : function() {

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
                "weight": 1.1,
                "options": ["red", "small", "itchy"],
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
                "weight": 1.1,
                "options": ["red", "small", "itchy"],
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
                "id": "i123_" + i,
                "productCode": "HOBO-LL",
                "productName": "Slouchy leather... lace hobo" + i,
                "unitPrice": 90.0,
                "quantity": 2,
                "weight": 1.1,
                "options": ["red", "small", "itchy"],
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



        var testDataStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.OrderItem',
            data: testData.items
        });




    }
});
