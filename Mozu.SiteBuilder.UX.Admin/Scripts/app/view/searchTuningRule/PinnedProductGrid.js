/**
* @class Taco.view.searchTuningRule.PinnedProductGrid
*/

Ext.define('Taco.view.searchTuningRule.PinnedProductGrid', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.searchTuningRule-pinned-grid',
    requires: [],
    stateful: false,
    enableNavHeader: false,
    autoHeight: true,
    pageSize: 5,
    launchEditorOnClick: false,
    deferEmptyText: false,
    emptyText: 'None Available',

    autoScroll: false,

    config: {
        code: null
    },

    viewConfig: {
        listeners: {
            drop: function() {
                this.refresh();
            }
        },
        plugins: {
            ptype: 'gridviewdragdrop'
        }
    },

    deferEmtpyText: false,

    showActionsColumn : true,

    autoHidePagingToolbar:false,

    minHeight: 240,
    enableEditAction: false,
    enableDeleteAction: true,
    enableAutoSelect:false,
    enablePaging: false,
    filterProperty: 'productCode',

    initComponent: function() {
        var me = this;

        me.dockedItems = me.dockedItems || [];
        me.mixins = me.mixins || [];
            
        me.viewConfig = me.viewConfig || {};
        me.viewConfig.deferEmptyText = me.deferEmptyText;

        me.columns = me.getColumnConfig();

        if (me.showActionsColumn) {
            var actionColumn = me.getActionColumn();
            if (actionColumn) {
                me.columns.push(actionColumn);
            }
        }
            
        me.store = Ext.create('Ext.data.Store', {
          fields: ['code', 'price', 'salePrice'],
          data: []
        });

        me.callParent(arguments);

    },

    listeners: {
        afterrender: function() {
          var record = this.up('#taco-searchTuningRule-form').record;
          var products = record.data.boostedProducts;
          for (var i = 0; i < products.length; i++) {
            this.store.data.add(Ext.create('Taco.model.PinnedProduct', products[i]));
          }
        },
        recordadded: function(records) {

            var me = this,
                findFunc = function(rec) {
                    return me.store.find(me.filterProperty, rec.get(me.filterProperty)) === -1;
                },
                recordsToAdd =[],
                form = this.up('#taco-searchTuningRule-form').pinned,
                placement = form.placementSelect.getValue(),
                grid = form.pinnedGrid,
                selectionModel = grid.getSelectionModel(),
                selection = selectionModel.getSelection(),
                index;

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

            switch (placement) {
                case 'top':
                    index = 0;
                    break;
                case 'bottom': 
                    index = grid.store.getCount();
                    break;
                case 'above':
                    index = (selection[0]) ? grid.store.indexOf(selection[0]) : 0;
                    break;
                case 'below':
                    index = (selection[0]) ? grid.store.indexOf(selection[0]) + 1 : grid.store.getCount();
                    break;
            }

            me.store.insert(index, recordsToAdd);

            me.refresh();
        }
    },

    refresh: function() {
        this.getView().refresh();
    },

    removeProduct: function(record) {
        this.store.remove(record);
        this.refresh();
    },

    getActionColumn: function () {
        var me = this,
            actionColumn = null,
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
        var me = this,
            actions = [];
                   
        actions.push({
          text: 'Remove',
          menuColumnHandler: function(item, eventData) {
            var record = eventData.record;
            me.removeProduct(record);
          }
        });

        return actions;
    },

  getColumnConfig: function () {
    var me = this,
      columns = [
        {
          xtype: 'gridcolumn',
          sortable: false,
          dataIndex: 'position',
          text: 'Pos',
          hideable: false,
          width: 100,
          renderer: function(cmp, metaData, record, index) {
            return index + 1;
          }
        },
        {
          xtype: 'gridcolumn',
          sortable: false,
          dataIndex: 'productName',
          text: 'Name',
          hideable: false,
          flex: 1,
          minWidth: 150
        },
        {
          xtype: 'gridcolumn',
          sortable: false,
          dataIndex: 'productCode',
          text: 'Code',
          hideable: true,
          flex: 1
        },
        {
          xtype: 'gridcolumn',
          sortable: false,
          dataIndex: 'price',
          text: 'Price',
          hideable: true,
          flex: 1
        },
        {
          xtype: 'gridcolumn',
          sortable: false,
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
          sortable: false,
          dataIndex: 'productTypeName',
          text: 'Product Type',
          hideable: true,
          hidden: true,
          flex: 1
        },
        {
          xtype: 'gridcolumn',
          sortable: false,
          dataIndex: 'productUsage',
          text: 'Product Usage',
          hideable: true,
          hidden: true,
          flex: 1
        }
      ];

    return columns;
  },

  getValues: function () {
      return this.store.data.items;
  }

});