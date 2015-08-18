/**
* The Discount list (grid) view
*/

Ext.define('Taco.view.discount.Index', {
    extend: 'Taco.view.discount.Grid',
    alias: 'widget.discountlist'    
});


/*


Ext.define('Taco.view.discount.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.discountlist',
    requires: ['Ext.Date', 'Taco.store.TargetedShippingMethods', 
        'Ext.form.Panel', 'Taco.core.ux.BaseGrid', 
        'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter', 
        'Taco.view.discount.Edit', 'Taco.core.ux.FilterableDataView', 'Taco.core.ux.grid.MenuColumn'
    ],
    modelName: 'Taco.model.Discount',
    store: {
        type: 'Taco.store.DiscountGrid'
    },
    editorName: 'Taco.view.discount.Edit',
    typeName: 'Discount',

   
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },
    
    gridPanelConf: {
        stateful: true,
        stateId: 'statefulDiscountsGrid',
        columns: [{
            xtype: 'gridcolumn',
            dataIndex: 'name',
            stateId: 'name',
            text: 'Name',
            hideable: false,
            flex: 1,
            minWidth: 150
            //renderer: function (value, metaData, record, rowIndex, colIndex, store) {
            //    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
            //}
        }, {
            xtype: 'gridcolumn',
            dataIndex: 'amountType',
            stateId: 'amountType',
            text: 'Type',
            width: 150,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {

                // percentage
                if (value == "Percentage") {
                    return record.get("amount") + "% OFF";
                }

                // amount
                if (value == "Amount") {
                    return Taco.app.context.getCurrent().formatCurrency( record.get("amount") ) + " OFF";
                }

                // freeShipping
                if (value == "Free") {
                    return "Free";
                }

                return Ext.emptyString;
            }
        }, {
            xtype: 'gridcolumn',
            dataIndex: 'target',
            stateId: 'appliesTo',
            text: 'Applies To',
            width: 180,
            hidden: false,
            sortable:false,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                var val = "",
                    cats = record.get("categories").length,
                    prods = record.get("products").length;

                if (record.get('includeAllProducts')) {
                    val = "All products";
                } else {
                    if (prods) {
                        val = prods + ((prods > 1) ? " Products" : " Product");
                    }

                    if (cats) {
                        val += (val ? " &amp; " : Ext.emptyString) + cats + ((cats > 1) ? " Categories" : " Category");
                    }
                }

                if (record.get("targetType") == "Order") {
                    val += " Min. Order (" + Taco.app.context.getCurrent().formatCurrency(record.get("minimumOrderAmount")) + ")";
                }

                if (val === '') {
                    val = 'Nothing';
                }

                return val;
            }
        }, {
            xtype: 'datecolumn',
            dataIndex: 'startDate',
            stateId: 'startDate',
            width: 100,
            text: 'Start Date'
        }, {
            xtype: 'datecolumn',
            dataIndex: 'expirationDate',
            stateId: 'expirationDate',
            width: 100,
            text: 'End Date',
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {

                var val = "";

                if (!record.get("expirationDate")) {
                    val = "Never";
                    return val;
                }

                return Ext.Date.format(value, "n/j/Y");
            }
        }, {
            xtype: 'gridcolumn',
            dataIndex: 'status',
            stateId: 'status',
            text: 'Status',
            sortable: false
        }, {
            xtype: 'gridcolumn',
            dataIndex: 'couponCode',
            stateId: 'couponCode',
            text: 'Coupon Code',
            width: 130,
            hidden: false
        }, {
            xtype: 'numbercolumn',
            dataIndex: 'currentRedemptionCount',
            stateId: 'currentRedemptionCount',
            format: "0",
            text: 'Used',
            width: 80,
            hidden: false
        },{
            xtype: 'taco.menucolumn',
            text: 'Actions',
            flex: 1,
            menuItems: [
                {
                    text: 'Edit',
                    requiredBehaviors: {
                        model: 'Taco.model.Discount',
                        behavior: 'update'
                    },
                    menuColumnHandler: function (item, eventData) {
                        var record = eventData.record;
                        Ext.defer(function () {
                            Taco.core.StateManager.attemptNavigate('discounts/edit/' + record.getId(), { complexMetaData: { record: record } });
                        }, 1, this);
                    }
                },{
                    text: 'Duplicate',
                    requiredBehaviors: {
                        model: 'Taco.model.Discount',
                        behavior: 'create'
                    },
                    menuColumnHandler: function (item, eventData) {
                        var record = eventData.record,
                            metaData = {
                                id: record.getId()
                            };

                        Taco.app.StateManager.attemptNavigate('discounts/duplicate/' + record.getId(), metaData);
                    }
                }
            ]
        }
        

        //// BUG:  15695
        //// http://tfs.ads.volusion.com:8080/tfs/VNext/Mozu/_workitems/edit/15695
        //// (Simeon K.) delete of discounts causes orders that had that discount to spontaneously combust. Poof! Removing delete action trigger until we have a better solution;

        //, {
        //    xtype: 'taco.menucolumn',
        //    text: 'Actions',
        //    menuItems:[{
        //        text: 'Delete',
        //        requiredBehaviors: {
        //            model: 'Taco.model.Discount',
        //            behavior:'destroy'
        //        },
        //        menuColumnHandler: 'destroyMenuColumnHandler'
        //    }]
        //}
        
        
        
        ]
    },

    initComponent: function () {
        this.callParent(arguments);
    },

    
    // Handler for the list item click event
    
    onItemClick: function (view, record, elm, index, e) {
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.launchEditor(record);
            Taco.app.StateManager.addState('discounts/edit/' + record.getId(), { id: record.getId() });
        }
    },

    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('discounts/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }
});
*/
