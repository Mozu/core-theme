/**
 * @class Taco.view.website.entityAdapters.BaseEntityAdapter
 */
Ext.define("Taco.view.website.entityAdapters.BaseEntityAdapter", {
  extend: "Ext.util.Observable",
  requires: ["Taco.store.EntityVariations"],
  showNameEditor: true,
  allowedActions: {
    copy: false,
    preview: false,
    destroy: false,
    more: false
  },
  supportsPageVariations: false,
  constructor: function () {
    this.callParent(arguments);
    this.manager.entitypeTypeHandler = this;
    this.variationStore = Taco.core.data.StoreManager.getOrCreate(
      "Taco.store.EntityVariations"
    );
    this.load();
    this.mon(
      this.manager,
      "activecardchanged",
      this.onManagerActiveItemChange,
      this
    );
    this.mon(
      this.variationStore,
      "setNewVariation",
      this.loadPageVariation,
      this
    );
  },
  onManagerActiveItemChange: function (manager, activeItem) {
    if (activeItem.itemId === "pageEditor" && this.webPageNeedsRefresh) {
      this.webPageNeedsRefresh = false;
      this.manager.reloadPage();
    }
  },
  getDocument: function () {
    return this.get();
  },
  /**
   * Gets the Current Doc or Original Doc from our variation Store
   *    - If the entity is a variation we get the Original Doc from our variation Store
   */
  getParentDocument: function () {
    var record = this.getDocument();

    if (this.isVariation) {
      if (this.variationStore.originalDocument) {
        record = this.variationStore.originalDocument;
      }
    }
    return record;
  },
  /**
   * Used to Get Variation Title if entity is a variation
   */
  getVariationTitle: function () {
    if (this.isVariation) {
      if (this.record) return this.record.get("name");
    }
    return false;
  },
  /**
   * Used to Get Page Title
   *    - If the entity is a variation we get the Original Doc from our variation Store
   */
  getTitle: function () {
    if (this.isVariation) {
      return this.variationStore.originalDocument.get("name");
    }
    if (this.record) return this.record.get("name");
  },

  getPageSettings: function () {
    var me = this,
      doc = this.getDocument(),
      customerEditor,
      ret = [];

    this.manager.pageSettings.removeAll();

    if (!customerEditor) {
      //temp for entiyType not saving
      doc.set("entityType", "cms");
      customerEditor = me.manager.entityEditors.findEditor(doc);
    }
    if (customerEditor) {
      me.dynamicFormContainer = Ext.create(
        "Taco.view.customSchema.DynamicFormContainer",
        {
          editor: customerEditor,
          record: doc,
          showNameEditor: me.showNameEditor
        }
      );
      ret.push(me.dynamicFormContainer);
    } else {
      var form = Ext.create("Taco.core.ux.form.Form", {
        record: doc
      });
      ret.push(form);
    }

    //this.manager.pageSettings.add
    return ret;
  },
  getPageRules: function () {
    var me = this,
      doc = this.getDocument(),
      ret = {
        text: "Some Test Rule 1",
        tree: {
          operator: "and",
          expressions: [],
          type: "container"
        }
      };

    //this.manager.pageRules.removeAll();
    var variationRule = doc.get("properties").variation_rule;
    if (variationRule) {
      return {
        text: "Some Test Rule 2",
        tree: variationRule
      };
    }

    return ret;
  },
  getPageVariations: function () {
    var me = this,
      doc = this.variationStore.originalDocument || this.getDocument();

    if (doc.get("properties").variations) {
      Ext.Array.forEach(doc.get("properties").variations, function (variation) {
        variation.parentId = doc.get("id");
      });
    }

    return doc.get("properties").variations || [];
  },
  /**
   * Formats the URL to be used from the Editor Iframe
   *    '/variation/{id}' path is used for CMS Pages
   *    This path will load the appropriate page data based on the page type, name, and variation ID
   */
  navigateToPageVariation: function (record) {
    var url = "",
      documentListName = record.get("listFQN"),
      name = record.get("name");

    if (documentListName && name) {
      url = "/cms/" + documentListName + "/" + name;
    }
    var currentVariation = this.variationStore.getActiveVariation();
    if (currentVariation) {
      url += "/variation/" + currentVariation.get("id");
    } else {
      url += "/variation/base";
    }
    this.fireEvent("navigateFrame", url, record);
  },
  /**
   * Loads a page variation
   *    - Tags the appropriate variation and calls navigateToPageVariation to reload the Editor Iframe
   */
  loadPageVariation: function (id) {

    var me = this,
      doc = me.variationStore.originalDocument || this.getDocument();

    me.isLoading = true;

    if (me.variationStore.count()) {
      var variationRecord = me.variationStore.findRecord("id", id);

      if (variationRecord) {
        me.variationStore.tagActiveVariation(variationRecord);
        me.navigateToPageVariation(doc);
      } else {
        me.variationStore.untagActivetVariation();
        me.navigateToPageVariation(doc);
      }
    } else {
      me.variationStore.untagActivetVariation();
      me.navigateToPageVariation(doc);
    }
  },
  deleteRecord: function () {
    var me = this,
      record = this.get();
    if (me.fireEvent("destroy", record) !== false) {
      if (record) {
        record.destroy({
          callback: function () {
            me.fireEvent("destroy", record);
          }
        });
      }
    }
  },
  getId: function () {
    if (this.record) {
      return this.record.getLoadParams();
    }
    if (
      !this.pageContext.cmsContext.page.listFQN ||
      !this.pageContext.cmsContext.page.id
    ) {
      return undefined;
    }
    return {
      listFQN: this.pageContext.cmsContext.page.listFQN,
      id: this.pageContext.cmsContext.page.id
    };
  },
  get: function () {
    return this.record;
  },
  getSaveTask: function () {
    var me = this,
      tasks = Ext.create("Taco.core.ux.form.Tasks"),
      properties = [],
      document = me.getDocument(),
      source;
    if (me.editor) {
      me.editor.dirtyStateCheck();
      if (me.editor.isDirty()) {
        if (me.getDocument()) {
          me.getDocument().setDirty();
        }
        if ((me.pageContext.editMode || "").toLowerCase() === "template") {
          source = me.pageContext.cmsContext.template;
        } else if ((me.pageContext.editMode || "").toLowerCase() === "site") {
          source = me.pageContext.cmsContext.site;
        } else {
          source = me.pageContext.cmsContext.page;
        }
        document = me.getDocument();
        if (document) {
          properties = Ext.clone(document.get("properties"));
          properties.dropzones = properties.dropzones || [];
        }
        Ext.each(me.editor.persistanceData(), function (zone) {
          var existing = Ext.Array.findBy(properties.dropzones, function (x) {
            //adding tollerance for older docs that had the wrong case on the id addtribute.

            return (
              (x.id || x.Id || "").toLowerCase() ===
              (zone.id || zone.Id || "").toLowerCase()
            );
          });
          if (existing) {
            Ext.Array.remove(properties.dropzones, existing);
          }
          zone.source = source;
          properties.dropzones.push(zone);
        });
        if (document) {
          document.set("properties", Ext.clone(properties));
        } else {
          tasks.add({
            fn: function (t) {
              Ext.Ajax.request({
                url: "/admin/app/cmsdocument/widgetdata/update",
                method: "post",
                jsonData: {
                  zones: properties.dropzones,
                  source: source
                },
                success: function () {
                  t.callback();
                }
              });
            }
          });
        }
        tasks.on(
          "complete",
          function (endTasks) {
            if (Ext.isEmpty(endTasks.errors)) {
              this.editor.resetDirtyState();
            }
          },
          this
        );
      }
    }

    //Updates our Parent Document variations if needed and sets the publishState of the Original Document 
    tasks.on("complete", function (scope) {
      if (me.variationStore.originalDocument) {
        me.variationStore.originalDocument.set("publishState", "draft");
      }

      if (!me.isVariation) {
        me.load();
      } else {
        me.variationStore.updateOriginalDocumentVariation(me.getDocument().getData2(me.getDocument()));
        me.setPubState();
      }



      me.fireEvent("savesuccess", me);
    });
    this.addSaveTasks(tasks);
    return tasks;
  },
  publish: function () {
    if (!this.pageContext || !this.pageContext.cmsContext) {
      return;
    }
    var store = Ext.create("Taco.store.CmsDocumentDrafts");
    Ext.Object.each(
      this.pageContext.cmsContext,
      function (key, value) {
        if (value.id) {
          var doc = store.add({
            id: value.id
          })[0];
          doc.set("isPublished", true);
        }
      },
      this
    );
    store.sync({
      success: function () {
        var me = this;
        if (me.getParentDocument()) {
          me.getParentDocument().set('publishState', "Active");
        }

        me.manager.publishButton.setLoading(
          false,
          me.manager.setPublishable.bind(me.manager, false)
        );
      },
      scope: this
    });
  },
  isDirty: function () {
    return false;
  },
  isHidden: function () {
    return false;
  },
  /**
   * Loads the Entity Data via the Entity Id
   *    - If The Page has variations we load on variation Store and tag the active variation if needed.
   *    - 
   */
  load: function () {
    var me = this;
    if (me.variationStore.originalDocument) {

      var entityI = this.getId() || {};
      if (me.variationStore.originalDocument.get("id") === entityI.id) {
        var doc = me.variationStore.originalDocument;

        var activeVariations = window.sessionStorage.getItem('activeVariations');
        activeVariations = JSON.parse(activeVariations) || {};
        var activeVariationId = activeVariations[entityI.id];

        if (!me.pageContext.isBasePage && activeVariationId) {
          var variationRecord = me.variationStore.findRecord("id", activeVariationId);

          if (variationRecord) {
            me.isVariation = true;
            me.variationStore.tagActiveVariation(variationRecord);
            me.set(variationRecord);
            return;
          }
        }

        me.set(doc);
        return;
      }
    }
    if (!this.getId()) {
      return;
    }
    Taco.model.Entity.load(this.getId(), {
      scope: this,
      success: function (doc) {
        function variationId() {
          var id = doc.get("properties").variationId;
          if (id) {
            return id;
          }
          return null;
        }

        if (this.supportsPageVariations) {
          me.variationStore.originalDocument = doc;
          me.variationStore.removeAll();

          me.variationStore.loadData(me.getPageVariations());

          var activeVariations = window.sessionStorage.getItem('activeVariations');
          activeVariations = JSON.parse(activeVariations) || {};
          var activeVariationId = activeVariations[me.variationStore.originalDocument.get('id')];

          if (activeVariationId) {
            var variationRecord = me.variationStore.findRecord(
              "id",
              activeVariationId
            );

            if (variationRecord) {
              me.isVariation = true;
              me.variationStore.tagActiveVariation(variationRecord);
              me.set(variationRecord);

              return;
            }
          }
        }
        me.set(doc);
      }
    });
  },
  set: function (record, add) {
    this.isLoading = false;
    this.record = record;
    if (add) {
      this.getStore().add(this.record);
    }
    this.setPubState();
    if (this.record) {
      this.mon(this.record, "aftercommit", this.setPubState, this);
    }
    this.fireEvent("load", record);
  },
  setPubState: function () {
    if (
      this.getParentDocument() &&
      this.getParentDocument().get("publishState") === "draft"
    ) {
      this.manager.showHideButtons(["isPublishable"], true);
      this.manager.setPublishable(true);
      this.manager.updateDraftIcon(this.getParentDocument());
      return;
    }
    this.manager.updateDraftIcon(this.getParentDocument());
  },
  addSaveTasks: function (tasks) {
    var me = this,
      document = this.getDocument();

    // Here we copy the current Page rules to our record.
    if (this.supportsPageVariations) {
      var propValues = {
        variation_rule: me.manager.pageRules.getValues()
      };

      this.record.set(
        "properties",
        Object.assign(this.record.get("properties"), propValues)
      );

      // If the record is a parent Page we copy the variations in our store to the record.
      if (
        this.record.get("id") === me.variationStore.originalDocument.get("id")
      ) {
        var rawVariations = [];
        me.variationStore.each(function (variation) {
          rawVariations.push(variation.data);
        });
        this.record.get("properties").variations = rawVariations;
      }

      this.record.setDirty(true);
      this.record.phantom = false;
      this.record.set("parentId", me.variationStore.originalDocument.get("id"));
    }

    this.manager.pageSettings.addSaveTasks(tasks);

    if (this.dynamicFormContainer) {
      tasks.add([
        {
          updateRecord: this.get(),
          updateForm: this.dynamicFormContainer
        },
        {
          saveRecord: this.get()
        }
      ]);
    }
  },
  getStore: Ext.emptyFn,
  setHidden: Ext.emptyFn,
  unload: Ext.emptyFn
});
