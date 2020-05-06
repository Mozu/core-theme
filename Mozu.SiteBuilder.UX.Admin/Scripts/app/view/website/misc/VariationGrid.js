/**
 * @class Taco.view.order.Grid
 */
Ext.define("Taco.view.website.misc.VariationGrid", {
  extend: "Taco.core.ux.browser.SearchList",
  //cls: Taco.baseCSSPrefix + 'searchlist',

  requires: [
    "Taco.model.EntityVariation",
    "Taco.store.EntityVariations",
    "Ext.MessageBox"
  ],
  alias: "widget.variationList",
  mixins: {
    launcheditor: "Taco.core.ux.mixins.LaunchEditor",
    navHeader: "Taco.core.ux.mixins.NavHeader",
    pageable: "Taco.core.ux.mixins.Pageable",
    searchable: "Taco.core.ux.mixins.Searchable",
    rowEditable: "Taco.view.website.misc.VariationRowEditable",
    deleteFromGrid: "Taco.core.ux.mixins.DeleteFromGrid",
    gridcontextmenu: "Taco.core.ux.mixins.GridContextMenu"
  },

  launchEditorOnClick: false,

  // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
  modelName: "Taco.model.EntityVariation",

  enableNavHeader: false,
  addContentViewPadding: true,
  minHeight: 240,
  enableSearch: false,
  enablePaging: false,
  enableRowEditing: true,
  enableAutoSelect: false,
  createButtonEnabled: true,
  saveButtonEnabled: false,
  cancelButtonEnabled: false,
  enableBulkActions: false,
  createButtonText: "Create New Variation",

  showActionsColumn: true,

  hideSearchToolbar: false,
  autoScroll: true,

  itemId: "variations-grid",

  onCreate: Ext.emptyFn,

  stateful: false,
  stateId: "statefulVariationsGrid",
  store: Taco.core.data.StoreManager.getOrCreate("Taco.store.EntityVariations"),
  viewConfig: {
    plugins: {
      ptype: "gridviewdragdrop",
      dragText: "Drag and drop to reorganize"
    },
    listeners: {
      drop: function (node, data, dropRec, dropPosition) {
        this.refreshView();
      }
    }
  },
  componentCls: "variationGrid",

  initComponent: function () {
    var me = this;
    //We reset the store here because of the grid caching.
    me.store = Taco.core.data.StoreManager.getOrCreate("Taco.store.EntityVariations");
    var tbconfig = {
      style: "padding-left:0px",
      items: [
        {
          xtype: "button",
          text: "Create New Variation",
          ui: "action",
          componentCls: "taco-create-variation-btn",
          scale: "medium",
          style: {
            right: "0px",
            left: "auto"
          },
          handler: function () {
            me.rowEditor.cancelEdit();
            if (me.store.count() < 20) {
              var r = me.store.createNewVariation();
              r[0]._newVariation = true;
              r[0].phantom = true;

              //Hack for row Editor issues
              me.rowEditor.editor.setHeight(40);
              me.rowEditor.editor.form.reset();

              me.rowEditor.startEdit(r[0], 0);
              me.rowEditor.editor.focusContextCell();
            } else {
              Taco.app.fireEvent(
                "setmessage",
                "No more than 20 variations per page is allowed.",
                "error"
              );
            }
          }
        }
      ]
    };
    this.tbar = Ext.create("Ext.toolbar.Toolbar", tbconfig);

    // need to override the createButtonCfg;
    //me.createButtonCfg = me.getCreateButtonConfig();

    this.columns = this.getColumnConfig();

    // initialize the delete mixin
    this.mixins.deleteFromGrid.init.apply(this);

    //todo: need to work on disabling/enabling of actions -- talk with commerce peeps?

    me.callParent(arguments);
  },

  onMenuHide: function () {
    alert("ho");
  },

  //Override for Taco.core.ux.mixins.DeleteFromGrid
  onDeleteSuccess: function (record) {
    this.view.refreshView();
    if (record.get("active")) {
      if (this.store.count() > 0) {
        this.store.fireEvent("setNewVariation", this.store.getAt(0).get("id"));
        return;
      }
      this.store.fireEvent("setNewVariation", "base");
    }
  },

  onRowEditorCancel: function (editor, context, opts) {
    var record = context.record,
      isNewRecord = record._newVariation,
      isNewDuplicateRecord = record._isDuplicate;
    // clear unpersisted new records when the user its the cancel button;
    if (isNewRecord || isNewDuplicateRecord) {
      this.store.remove(record);
      if (this.store.getCount() && this.getSelectionModel()) {
        this.getSelectionModel().deselectAll();
      }
      this.view.refreshView();
      return false;
    }

    if (record.raw && record.raw.name) {
      record.set("name", record.raw.name);
    }
  },

  deleteFailure: function (m, response) {
    var me = this;

    me.deleteInProgress = false;
    me.onDeleteFailure(arguments);
    me.fireEvent("deletefailure", me, arguments);

    me.setLoading(false);
    var text = "Unknown error.";

    if (response.error.statusText) {
      text = response.error.statusText;
    }
    if (
      m.exceptions &&
      Taco.core.util.ExceptionWhiner.wasHandled(m.exceptions)
    ) {
      return;
    }
    if (m.exceptions) {
      text = Taco.core.util.ExceptionWhiner.createHtmlList(m.exceptions);
    }

    Taco.app.fireEvent("setmessage", text, "error");
  },

  //Override for Taco.core.ux.mixins.DeleteFromGrid
  doDelete: function (record, grid) {
    var me = this,
      removeRecord = function (rec) {
        me.deleteInProgress = true;
        var store = grid.getStore();
        grid.setLoading(true);
        store.remove(rec);
        rec.destroy({
          success: me.deleteSuccess,
          failure: me.deleteFailure,
          scope: me
        });
      };

    if (!me.confirmDelete) {
      removeRecord(record);
      return;
    }

    Ext.MessageBox.show({
      title: me.deletePromptTitle,
      // pushes the buttons to the right to be consistant with our dialog ux.
      rightJustifyButtons: true,
      // reverses the order of the buttons
      reverseOrder: true,
      msg: me.getDeletePromptMessage(record),
      closable: false,
      buttons: Ext.Msg.YESNO,
      fn: function (val) {
        if (val === "yes") {
          removeRecord(record);
        }
      }
    });
  },

  // override this method and adjust the columns if your need a grid with a subset of columns;
  getColumnConfig: function () {
    var me = this;
    var columns = [
      {
        stateId: "name",
        dataIndex: "name",
        text: "Variation Name",
        flex: 2,
        sortable: false,
        minWidth: 150,
        editor: {
          allowBlank: false
        }
      },
      {
        stateId: "rank",
        dataIndex: "rank",
        text: "Rank",
        flex: 1,
        sortable: false,
        renderer: function (value, metaData, record, recordIdx, idx, store) {
          if (metaData.rowIndex > -1) {
            return metaData.rowIndex + 1;
          }

          return "";
        }
      }
    ];


    // add the actions column if required
    if (me.showActionsColumn) {
      columns.push({
        xtype: "taco.menucolumn",
        onMenuShow: function (menu, eventData, trigger) {
          console.log('show Menu');
          me.rowEditor.cancelEdit();
          //this.showMenuBy(trigger, eventData);
        },
        menuItems: [
          {
            text: "Set",
            //requiredBehaviors: me.orderUpdateBehaviors,
            menuColumnHandler: function (item, eventData) {
              me.rowEditor.cancelEdit();
              var record = eventData.record;
              me.store.fireEvent("setNewVariation", record.get("id"));
            }
          },
          {
            text: "Rename",
            //requiredBehaviors: me.orderUpdateBehaviors,
            menuColumnHandler: function (item, eventData) {
              me.rowEditor.cancelEdit();
              me.rowEditor.startEdit(eventData.rowIndex, 0);
              me.rowEditor.editor.focusContextCell();
              me.view.refreshView();
            }
          },
          {
            text: "Delete",
            menuColumnHandler: function (item, eventData) {
              me.rowEditor.cancelEdit();
              var record = eventData.record;
              me.deleteMenuColumnHandler(item, eventData);
              me.view.refreshView();
              //me.store.fireEvent('setNewVariation');
            },
            scope: me
          },
          {
            text: "Duplicate",
            menuColumnHandler: function (item, eventData) {
              me.rowEditor.cancelEdit();
              var record = eventData.record;
              if (me.store.count() < 20) {
                var r = me.store.createNewVariation("", record.get("id"));
                r[0]._newVariation = false;
                r[0]._isDuplicate = true;

                //Hack for row Editor issues
                me.rowEditor.editor.setHeight(40);
                me.rowEditor.editor.form.reset();

                me.rowEditor.startEdit(r[0], 0);
                me.rowEditor.editor.focusContextCell();
                me.view.refreshView();
              } else {
                Taco.app.fireEvent(
                  "setmessage",
                  "No more than 20 variations per page is allowed.",
                  "error"
                );
              }
            }
          },
          {
            text: "View Staged",
            menuColumnHandler: function (item, eventData) {
              var record = eventData.record;
              var url = Ext.getCmp("websiteIndex").url;
              var variationQueryString = function () {
                var qs = "";
                if (record) {
                  qs = "&variationId=" + record.get("id");
                }
                return qs;
              };
              window.open(
                "/_gosite/" +
                Taco.app.context.getSiteId() +
                "?environment=preview&redir=" +
                encodeURIComponent(url) +
                variationQueryString()
              );
            }
          }
        ]
      });
    }

    return columns;
  }

  // if multi site, need to make the create button trigger a menu that lists out all of the possible sites;
});
