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
        
    me.store = Taco.core.data.StoreManager.getOrCreate({
      type: 'Taco.store.PinnedProducts',
      createOnly: true,
      pageSize: me.pageSize,
      autoLoad: false
    });
    
    me.callParent(arguments);
  },

  listeners: {
    afterrender: function() {
      var record = this.up('#taco-searchTuningRule-form').record;
      this.store = Ext.create('Ext.data.Store', {
        fields: ['code', 'price', 'salePrice'],
        data: record.data.boostedProducts
      });
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
  }

  //,
  //getColumnConfig: function () {
  //    var me = this,
  //        columns = [
  //            {
  //                //xtype: 'gridcolumn',
  //                dataIndex: 'name',
  //                stateId: 'name',
  //                text: 'Name',
  //                hideable: false,
  //                flex: 1,
  //                minWidth: 150
  //                //renderer: function (value, metaData, record, rowIndex, colIndex, store) {
  //                //    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
  //                //}
  //            }
  //        ];

  //    return columns;
  //}
});