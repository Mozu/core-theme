/**
* @class Taco.view.attribute.AttributeValueGrid
*/

Ext.define('Taco.view.attribute.AttributeValueGrid', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.attribute-value-grid',
    requires: [
        'Ext.MessageBox',
        'Taco.core.ux.mixins.GridContextMenu',
        'Taco.core.ux.DragHandleColumn',
        'Taco.model.AttributeValue'
    ],
    itemId: 'taco-grid-attribute-value-grid',
    stateful: false,
    enableNavHeader: false,
    autoHeight: true,
    pageSize: 5,
    launchEditorOnClick: false,
    deferEmptyText: false,
    emptyText: 'None Available',

    autoScroll: false,
    enableSearch: false,
    hideSearchToolbar: true,
    config: {
        code: null
    },
    viewConfig: {
        stripeRows: false,
        plugins: {
            ptype: 'gridviewdragdrop',
            ddGroup: 'dd',
            dragGroup: 'dd',
            dropGroup: 'dd'
        }
    },
    plugins: [
        {
            ptype: 'cellediting',
            clicksToEdit: 1
        }, {
            ptype: 'classhandleddragdrop'
        }
    ],

    mixins: {
      gridcontextmenu: 'Taco.core.ux.mixins.GridContextMenu'
    },

    deferEmtpyText: false,

    showActionsColumn : true,

    autoHidePagingToolbar:false,

    minHeight: 240,
    enableEditAction: false,
    enableDeleteAction: true,
    enableAutoSelect:false,
    enablePaging: false,
    enableRowReorder: true,
    filterProperty: 'productCode',
    record: null,

    initComponent: function() {
        var me = this;

        me.dockedItems = me.dockedItems || [];
        me.mixins = me.mixins || [];
            
        me.viewConfig = me.viewConfig || {};
        me.viewConfig.deferEmptyText = me.deferEmptyText;

        if (me.showActionsColumn) {
            var actionColumn = me.getActionColumn();
            if (actionColumn) {
                me.columns.push(actionColumn);
            }
        }

        me.callParent(arguments);

        me.mon(Taco.app, 'added-attribute-value', function(val) {
            var model = Ext.create('Taco.model.AttributeValue', val),
                index = this.getPlacementIndex(val.position);
            this.addRow(model, index);
        }, me);

        me.mon(this.view, 'drop', function() {
            this.refresh();
            this.updateParentValues();
        }, me);
    },

    updateParentValues: function () {
        var rawValues = Ext.Array.map(this.getValues(), function(val) {
            return val.getData();
        });
        this.record.set('values', rawValues);
    },

    getPlacementIndex: function (placement) {
        var selectionModel = this.getSelectionModel(),
            selection = selectionModel.getSelection(),
            index;
        switch (placement) {
            case 'top':
                index = 0;
                break;
            case 'bottom':
                index = this.store.getCount();
                break;
            case 'above':
                index = (selection[0]) ? this.store.indexOf(selection[0]) : 0;
                break;
            case 'below':
                index = (selection[0]) ? this.store.indexOf(selection[0]) + 1 : this.store.getCount();
                break;
        }
        return index;
    },
    
    refresh: function() {
        this.getView().refresh();
    },

    addRow: function(rec, index) {

        var existing = this.store.findRecord('id', rec.getId(), 0, false, false, true);
        if (existing) {
            Taco.app.fireEvent('setmessage', ('Record ' + existing.getId() + ' already exists'), 'error');
            return;
        }
        this.store.insert(index, rec);
        this.refresh();
        this.updateParentValues();
    },

    removeRow: function(rec) {
        this.store.remove(rec);
        this.refresh();
        this.updateParentValues();
    },

    moveRow: function(rec, index) {
        this.removeRow(rec);
        this.addRow(rec, index);
    },

    getActionColumn: function () {
        var actionColumn = null,
            actions = this.getActionItems();

        // as long as we have actions;
        if (actions.length) {
            actionColumn = {
                xtype: 'taco.menucolumn',
                menuItems: actions
            }
        }

        return actionColumn;
    },

    getActionItems: function() {
        var me = this;
        return [
          {
            text: 'Move to Top',
            menuColumnHandler: function(item, eventData) {
              var record = eventData.record;
              me.moveRow(record, 0);
            }
          },
          {
            text: 'Move to Position',
            menuColumnHandler: function(item, eventData) {
                var record = eventData.record;
              
                Ext.MessageBox.prompt('Move to Position', 'Enter a value from 1 to ' + me.store.getCount(), function (val, index) {
                    index = parseInt(index, 10) - 1; // parse the string, and fix for zero-index
                    me.moveRow(record, index);
                }, me);

            }
          },
          {
            text: 'Move to Bottom',
            menuColumnHandler: function(item, eventData) {
              var record = eventData.record;
              me.moveRow(record, me.store.getCount()-1);
            }
          },
          {
            text: 'Remove',
            menuColumnHandler: function(item, eventData) {
              var record = eventData.record;
              me.removeRow(record);
            }
          },
          {
              xtype: 'menuseparator',
              style: 'border:0px;height:1px;background-color:#ccc;margin:6px 0px;'
          },
          {
            text: 'Remove All',
            menuColumnHandler: function() {
                Ext.MessageBox.show({
                    title: 'Confirm',
                    // pushes the buttons to the right to be consistant with our dialog ux.
                    rightJustifyButtons: true,
                    // reverses the order of the buttons
                    reverseOrder: true,
                    msg: 'Are you sure you want to remove all records?',
                    closable: false,
                    buttons: Ext.Msg.YESNO,
                    fn: function (val) {
                        if (val === 'yes') {
                            me.store.removeAll();
                        }
                    }
                });
            }
          }
        ];
    },

  getValues: function () {
      return this.store.data.items;
  }

});