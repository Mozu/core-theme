/**
 * @class Taco.view.website.entityAdapters.BaseEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.BaseEntityAdapter', {
    extend: 'Ext.util.Observable',
    requires: [],

    allowedActions: {
        copy: false,
        preview: false,
        destroy: false,
        more: false
    },

    constructor: function(config) {
        this.callParent(arguments);
        this.load();
    },

    deleteRecord:function(){
        var me = this,
            model = this.get();

        if (me.fireEvent('destroy', model) != false) {
            if (model) {
                model.destroy({
                    callback:function(){
                        me.fireEvent('destroy', model);
                    }
                });
            }
        }
    },

    get:function () {
        return this.model;
    },
     
    getSaveTask: function () {
        var me = this,
            tasks = Ext.create('Taco.core.ux.form.Tasks'),
            zoneData = [],
            source,
            json;
        
        if ((me.pageContext.editMode || "").toLowerCase() == 'template') {
            source = me.pageContext.cmsContext.template;
        } else if ((me.pageContext.editMode || "").toLowerCase() == 'site') {
            source = me.pageContext.cmsContext.site;
        } else  {
            source = me.pageContext.cmsContext.page;
        }

        Ext.each(me.editor.persistanceData(), function (zone) {
            if (!Ext.isEmpty(zone.rows)) {
                //todo: check pc for edit type... page/vs template
                zone.source = source;
                zoneData.push(zone);
            }
        });
        

        tasks.add({
            key: 'widgets',
            fn: function (t) {

                Ext.Ajax.request({
                    url: '/admin/app/cmsdocument/widgetdata/update',
                    method: 'post',
                    jsonData: {
                        zones: zoneData,
                        source: source
                    },
                    success: function (response) {
                        t.callback();

                    }
                });


            }
        });

        this.addSaveTasks(tasks);

        return tasks;
    },

    isDirty: function () {
        return false;
    },

    isHidden: function () {
        return false;
    },

    load: function() {
        var me = this,
            key = this.getId(),
            modelFactory = Ext.ModelManager.getModel(this.modelName),
            store = this.getStore();
        
        me.model = store.getById(key);
        if (me.model === null) {
            me.isLoading = true;
            modelFactory.load(key, {
                success: function (record) {
                    me.set(record, true);
                }
            });
        } else {
            this.set(this.model);
        }
    },

    set:function(model, add) {
        this.isLoading= false;
        this.model = model;
        if (add) {
            this.getStore().add(this.model);
        }
        this.fireEvent('load', model);
    },

    addSaveTasks: Ext.emptyFn,
    getId: Ext.emptyFn,
    getStore: Ext.emptyFn,
    setHidden:Ext.emptyFn,
    unload: Ext.emptyFn
});
