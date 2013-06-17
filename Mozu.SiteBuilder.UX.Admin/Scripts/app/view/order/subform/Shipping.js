/**
 * @class Taco.view.order.subform.Shipping
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.subform.Shipping', {
    extend: 'Taco.view.order.subform.Subform',
    requires: ['Taco.view.order.widget.OrderItemGrid'],
    config: {
        
        // order model
        record: null,
        
        editMode:false,

        // title for the panel header
        title: 'Shipment & Shipping Information',
                
        // width of the actionColumn. used to align the grid total container
        actionColumnWidth: 60,
        
        itemId:"orderShipping",
        
        // components to add to the panel header. typically used to add an actions menu button
        tools: []
    },
    
    initComponent: function (eOpts) {
        var me = this,
            unPackagedItemsStore;

        
        

        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping'].join(' ');
        
        // store that contains the orderItems for this order model
        unPackagedItemsStore = Ext.create('Ext.data.JsonStore', {
            fields: [                

                {
                    "name": "quantity",
                    "type": "int",
                    "useNull": true
                },

                {
                    "name": "productCode",
                    "type": "string",
                    "useNull": false
                },
                {
                    "name": "productName",
                    "type": "string",
                    "useNull": true
                },
                
                {
                    "name": "weight",
                    "type": "float",
                    "useNull": true,
                    "defaultValue": 1
                }
            ]
        });
        
        var data = this.record.get("unPackagedItems");

        unPackagedItemsStore.loadData(data);
        
        
        if (!unPackagedItemsStore) {
            // no order items is an edge case but needs to be handled
            // show a no order items 
        }
        
        // plugin to add suppourt to the grid for editing the price and quantity columns
        var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });
        
        me.unPackagedItemsGrid = Ext.create('Taco.view.order.widget.OrderItemGrid', {
            store: unPackagedItemsStore,
            autoHeight: true,
            listeners: {
                beforeedit: {
                    fn: function(plugin, edit) {
                        // disable editing when the grid is not editMode:true
                        return this.editMode;
                    }
                }
            },
                
            features: [],
                        
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
            selModel: Ext.create('Ext.selection.CheckboxModel', {
                selType: 'checkboxmodel',
                checkOnly: true,
                showHeaderCheckbox: true
            }),
            
            plugins: [
                cellEditing
            ],
            
            columns: [

                {
                    text: 'Quantity',
                    draggable: false,
                    width: 100,
                    sortable: false,
                    menuDisabled: true,
                    align: "left",
                    tdCls: "editableCell",  // adds the dotted line hover to the cells in the column
                    editor: {
                        xtype: 'textfield',
                        allowBlank: true,
                        minValue: 0,
                        maxValue: 100000
                    },
                    dataIndex: 'quantity'
                }, {
                    text: 'Code',
                    draggable: false,
                    width: 140,
                    sortable: false,
                    menuDisabled: true,
                    align: "left",
                    dataIndex: 'productCode'
                },
                {
                    text: 'Products',
                    draggable: false,
                    xtype: 'templatecolumn',
                    flex: 1,
                    sortable: false,
                    menuDisabled: true,
                    tpl: [
                            '<span class="productname" >{productName}</span>',
                            '<span class="productOptions">',
                                '<tpl for="options">',
                                    '<span class="option">{.}, </span>',
                                '</tpl>',
                            '</span>'
                        ],
                    dataIndex: 'productName'
                }, {
                    text: 'Weight (lbs)',
                    draggable: false,
                    width: 140,
                    sortable: false,
                    menuDisabled: true,
                    align: "left",
                    dataIndex: 'weight'
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
        
        Ext.apply(this, {
            items: [
                me.unPackagedItemsGrid
            ]
        });

        this.callParent(arguments);
    }
});
