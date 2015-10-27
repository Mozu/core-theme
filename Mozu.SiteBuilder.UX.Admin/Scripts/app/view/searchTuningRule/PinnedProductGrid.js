/**
* @class Taco.view.searchTuningRule.PinnedProductGrid
*/

Ext.define('Taco.view.searchTuningRule.PinnedProductGrid', {
  extend: 'Taco.core.ux.browser.SearchList',
  alias: 'widget.searchTuningRule-pinned-grid',
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

      for (var i = products.length - 1; i >= 0; i--) {
        this.store.data.add(Ext.create('Taco.model.PinnedProduct', products[i]));
      };
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
          flex: 1
        },
        {
          xtype: 'gridcolumn',
          dataIndex: 'name',
          stateId: 'name',
          text: 'Name',
          hideable: false,
          flex: 1,
          minWidth: 150
        },
        {
          xtype: 'gridcolumn',
          dataIndex: 'code',
          stateId: 'code',
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