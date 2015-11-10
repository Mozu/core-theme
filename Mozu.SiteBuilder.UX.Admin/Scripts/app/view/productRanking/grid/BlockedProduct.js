/**
* @class Taco.view.productRanking.BlockedProduct
*/

Ext.define('Taco.view.productRanking.grid.BlockedProduct', {
   extend: 'Taco.core.ux.browser.SearchList',
   alias: 'widget.productRanking-blocked-grid',
   requires: [],
   stateful: false,
   enableNavHeader: false,
   //minHeight: 240,
   autoHeight: true,
   //height:300,
   pageSize: 5,
   //store: {
   //    type: 'Taco.store.DiscountGrid',
   //    createOnly:true,
   //    pageSize:10
   //},
   launchEditorOnClick: false,
   deferEmptyText:false,
   emptyText: 'None Available',

   autoScroll: false,

   config: {
       code: null
   },


   deferEmtpyText: false,

   showActionsColumn : true,

   autoHidePagingToolbar:false,

   minHeight: 240,
   enableEditAction: false,
   enableDuplicateAction: false,
   enableDeleteAction: false,
   enablePaging: false,

   enableAutoSelect:false,

   initComponent: function() {
    var me = this;

    me.dockedItems = me.dockedItems || [];
    me.mixins = me.mixins || [];
     
    me.viewConfig = me.viewConfig || {};
    me.viewConfig.deferEmptyText = me.deferEmptyText;

    me.columns = me.getColumnConfig();

    me.store = Ext.create('Ext.data.Store', {
      fields: ['code', 'price', 'salePrice'],
      data: []
    });

    if (me.showActionsColumn) {
        var actionColumn = me.getActionColumn();
        if (actionColumn) {
            me.columns.push(actionColumn);
        }
    }

    me.callParent(arguments);

   },

    listeners: {
        afterrender: function() {
            var record = this.up('#taco-productRanking-form').record;
            var products = record.data.blockedProducts;

            for (var i = products.length - 1; i >= 0; i--) {
                this.store.data.add(Ext.create('Taco.model.BlockedProduct', products[i]));
            }
        },
        recordadded: function(records) {

            var me = this,
                findFunc = function(rec) {
                    return me.store.find(me.filterProperty, rec.get(me.filterProperty), 0, false, false, true) === -1;
                },
                recordsToAdd =[];

            if (!records) {
                console.warn('No record found!');
                return false;
            }

            if (Ext.isArray(records)) {
                Ext.Array.each(records, function(rec) {
                    if (findFunc(rec)) {
                        recordsToAdd.push(rec);
                    }
                });
            }

            else { 
                if (findFunc(records)) {
                    recordsToAdd.push(records);
                }
            }

            me.store.add(recordsToAdd);

        }
    },

    removeProduct: function(record) {
        this.store.remove(record);
    },

    getActionColumn: function () {
        var actionColumn = null,
            actions = this.getActionItems();

        // as long as we have actions;
        if (actions.length) {
            actionColumn = {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuItems: actions
            }
        }

        return actionColumn;
    },

    getActionItems: function() {
        var me = this;

        return [{
              text: 'Remove',
              menuColumnHandler: function(item, eventData) {
                var record = eventData.record;
                me.removeProduct(record);
              }
            },
            {
                xtype: 'menuseparator',
                style: 'border:0px;height:1px;background-color:#ccc;margin:6px 0px;'
            },
            {
                text: 'Remove All',
                menuColumnHandler: function() {
                    me.store.removeAll();
                }
            }
        ];
    },
  
  getColumnConfig: function () {
      return [
        {
            xtype: 'gridcolumn',
            dataIndex: 'productName',
            text: 'Name',
            flex: 1,
            minWidth: 150
        },
        {
            xtype: 'gridcolumn',
            dataIndex: 'productCode',
            text: 'Code',
            hideable: true,
            flex: 1
        },
        {
            xtype: 'gridcolumn',
            dataIndex: 'price',
            text: 'Price',
            hideable: true,
            flex: 1
        },
        {
            xtype: 'gridcolumn',
            dataIndex: 'salePrice',
            text: 'Sale Price',
            hideable: true,
            flex: 1
        },
        {
            xtype: 'gridcolumn',
            sortable: false,
            dataIndex: 'lastModifiedDate',
            text: 'Last Modified',
            hideable: true,
            hidden: true,
            flex: 1,
            renderer: Ext.util.Format.dateRenderer('d M, Y, g:i a')
        },
        {
            xtype: 'gridcolumn',
            dataIndex: 'productType',
            text: 'Product Type',
            hideable: true,
            hidden: true,
            flex: 1
        },
        {
            xtype: 'gridcolumn',
            dataIndex: 'productUsage',
            text: 'Product Usage',
            hideable: true,
            hidden: true,
            flex: 1
        }
    ];
  },

    getValues: function () {
        return this.store.data.items;
    }
});