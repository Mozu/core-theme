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
    plugins: {
      ptype: 'gridviewdragdrop'
    }
  },

  deferEmtpyText: false,

  showActionsColumn : true,

  autoHidePagingToolbar:false,

  minHeight: 240,
  enableEditAction: false,
  enableDuplicateAction: false,
  enableDeleteAction: false,
  enableAutoSelect:false,

  initComponent: function() {
    var me = this;

    me.dockedItems = me.dockedItems || [];
    me.mixins = me.mixins || [];
        
    me.viewConfig = me.viewConfig || {};
    me.viewConfig.deferEmptyText = me.deferEmptyText;

    me.columns = me.getColumnConfig()
        
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

        this.store.add(recordsToAdd);
    }
  },

  getActionItems: function() {
    var me = this,
        actions = [],
        originalActions;
        
    originalActions = me.callParent(arguments);
        
    actions.push({
      text: 'Remove',
      menuColumnHandler: function(item, eventData) {
        var record = eventData.record;
        me.removeDiscount(record);
      }
    });

    actions = Ext.Array.merge(actions, originalActions);

    return actions;
  },

  getColumnConfig: function () {
    var me = this,
      columns = [
        {
          xtype: 'gridcolumn',
          dataIndex: 'position',
          stateId: 'position',
          text: 'Pos',
          hideable: false,
          width: 100
        },
        {
          xtype: 'gridcolumn',
          dataIndex: 'productName',
          stateId: 'productName',
          text: 'Name',
          hideable: false,
          flex: 1,
          minWidth: 150
        },
        {
          xtype: 'gridcolumn',
          dataIndex: 'productCode',
          stateId: 'productCode',
          text: 'Code',
          hideable: true,
          flex: 1
        },
        {
          xtype: 'gridcolumn',
          dataIndex: 'price',
          stateId: 'price',
          text: 'Price',
          hideable: true,
          flex: 1
        },
        {
          xtype: 'gridcolumn',
          dataIndex: 'salePrice',
          stateId: 'salePrice',
          text: 'Sale Price',
          hideable: true,
          flex: 1
        },
        {
          xtype: 'gridcolumn',
          dataIndex: 'lastModified',
          stateId: 'lastModified',
          text: 'Last Modified',
          hideable: true,
          hidden: true,
          flex: 1
        },
        {
          xtype: 'gridcolumn',
          dataIndex: 'productType',
          stateId: 'productType',
          text: 'Product Type',
          hideable: true,
          hidden: true,
          flex: 1
        },
        {
          xtype: 'gridcolumn',
          dataIndex: 'productUsage',
          stateId: 'productUsage',
          text: 'Product Usage',
          hideable: true,
          hidden: true,
          flex: 1
        }
      ];

    return columns;
  }
});