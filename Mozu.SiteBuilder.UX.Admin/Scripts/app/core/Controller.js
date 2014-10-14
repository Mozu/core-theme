/**
 * @class
 * @author Jason Cochran
 * The controller base class
 */
Ext.define('Taco.core.Controller', {
    extend: 'Ext.app.Controller',
    editorView: null,
    listView: null,
    modelName: null,

    /**
     * @cfg contextPlaceHolders
     * @type {Object}
     */
    contextPlaceholders: {},

    ensureRequiredStores: function (options) {
        //var me = this,
        //    model = Taco.model[this.modelName],
        //    requiredStoresLoading = false;
        //options.loadingStores = options.loadingStores || [];


        //if (!Ext.isNumber(options.loadMaskTask)) {
        //    options.loadMaskTask = Ext.defer(
        //        function () {
        //            Taco.app.setLoading();
        //        }, this, 200);
        //}

        //if (model) {
        //    Ext.each(model.prototype.requiredStores, function (storeCfg) {

        //        var store = Taco.core.data.StoreManager.getOrCreate(storeCfg);
        //        if (store.storeManagerConfig && store.storeManagerConfig.createOnly && !store.proxy.isCacheProxy) {
        //            Ext.global.console.warn('cant use store ' + store.$className + ' ad requiredStore');

        //        } else if (!store.hasCompletedLoading()) {

        //            if (!store.isLoading()) {
        //                store.load();
        //            }
        //            if (!store.hasCompletedLoading()) {


        //                requiredStoresLoading = true;

        //                if (Ext.Array.indexOf(options.loadingStores, storeCfg) === -1) {

        //                    options.loadingStores.push(storeCfg);


        //                    store.on({
        //                        load: {
        //                            fn: function () {
        //                                me.ensureRequiredStores(options);
        //                            },
        //                            single: true
        //                        }
        //                    });

        //                }
        //            }
        //        }
        //    });

        //}


        //if (Ext.isNumber(options.loadMaskTask )) {
        //    window.clearTimeout(options.loadMaskTask);
        //    Taco.app.setLoading(false);
        //}


        if (Ext.isFunction(options)) {
            options.apply(this);
        } else {
            options.fn.apply(options.scope || this);
        }
    },


    /**
     * Autogenerate a view based on a naming convention `Taco.view.
     
     
     
     
     
     
     [controllername].Index` where controllername,
     * singularized with Ext.util.Inflector, is the name of this controller.
     * If there are any Context Placeholders based on the current Context Type, it will execute those views instead
     * of the default index view.
     * @return {undefined}
     */
    index: function (params, appState) {
        var me = this,
            record = appState ? appState.record : null,
            options = appState ? appState.options : null;


        me.confirmContext(this.getIndexView(), function () {
            me.ensureRequiredStores(function () {
                me.buildIndex(record, options);
            });
        });


    },

    getIndexView: function () {
        if (!this.indexView) {
            this.indexView = 'Taco.view.' + Ext.String.uncapitalize(Ext.util.Inflector.singularize(this.getControllerName())) + '.Index';
        }
        return this.indexView;
    },

    getEditorView: function () {
        if (!this.editorView) {
            this.editorView = 'Taco.view.' + Ext.String.uncapitalize(Ext.util.Inflector.singularize(this.getControllerName())) + '.Edit';
        }
        return this.editorView;
    },

    getControllerName: function () {
        return this.$className.substring(this.$className.lastIndexOf('.') + 1);
    },

    buildIndex: function (record, options) {
        this.createContentView(this.getIndexView(), {
            record: record,
            options: options
        });
    },

    duplicate: function (id, additionalParams, appState) {
        return this.doDuplicateModel(id, additionalParams, appState, this.getEditorView(), Taco.model[this.modelName]);
    },
    doDuplicateModel: function (id, additionalParams, appState, viewName) {
        this.confirmContext(viewName, this.doDuplicateModelInternal, this, arguments);
    },

    doDuplicateModelInternal: function (id, additionalParams, appState, viewName, model) {
        var record = appState ? appState.record : null,
            options = appState ? appState.options : null;
        if (appState && appState.container) {
            options = options || {};
            options.container = appState.container;
        }

        
        if (record) {
            Taco.app.setLoading();
            record.reload({
                success: function () {
                    Taco.app.setLoading(false);
                    
                    // do any class specific modifications to the source model that is being cloned
                    if (record.beforeDuplicate) {
                        record.beforeDuplicate();
                    }

                    record.phantom = true;
                    Ext.data.Model.id(record);                    
                    this.ensureRequiredStores(function () {
                        this.createContentView(viewName, {
                            isDuplicate:true,
                            record: record,
                            options: options
                        });
                    });
                },
                failure: function () {
                    Taco.app.setLoading(false);
                },
                scope: this
            });


        } else {
            Taco.app.setLoading();
            model.load(id, {
                success: function (record) {
                    Taco.app.setLoading(false);
                    // do any class specific modifications to the source model that is being cloned                    
                    if (record.beforeDuplicate) {
                        record.beforeDuplicate();
                    }

                    record.phantom = true;
                    Ext.data.Model.id(record);

                    this.ensureRequiredStores(function () {
                        this.createContentView(viewName, {
                            isDuplicate: true,
                            record: record,
                            options: options
                        });
                    });
                },
                failure: function () {
                    Taco.app.setLoading(false);
                },
                scope: this
            });
        }
    },

    edit: function (id, additionalParams, appState) {        
        return this.doEdit(id, additionalParams, appState, this.getEditorView(), Taco.model[this.modelName]);
    },
    doEdit: function (id, additionalParams, appState, viewName) {
        this.confirmContext(viewName, this.doEditInternal, this, arguments);
    },
    doEditInternal: function (id, additionalParams, appState, viewName, model) {
        var record = appState ? appState.record : null,
            options = appState ? appState.options : null;
        if (appState && appState.container) {
            options = options || {};
            options.container = appState.container;
        }


        if (record) {
            Taco.app.setLoading();
            record.reload({
                success: function () {
                    Taco.app.setLoading(false);

                    this.ensureRequiredStores(function () {
                        this.createContentView(viewName, {
                            record: record,
                            options: options
                        });
                    });
                },
                failure: function () {
                    Taco.app.setLoading(false);
                },
                scope: this
            });


        } else {
            Taco.app.setLoading();
            model.load(id, {
                success: function (record) {
                    Taco.app.setLoading(false);

                    this.ensureRequiredStores(function () {
                        this.createContentView(viewName, {
                            record: record,
                            options: options
                        });
                    });
                },
                failure: function () {
                    Taco.app.setLoading(false);
                },
                scope: this
            });
        }
    },

    create: function (id, additionalParams, appState) {        
        return this.doCreate(id, additionalParams, appState, this.getEditorView(), Taco.model[this.modelName]);
    },
    doCreate: function (id, additionalParams, appState, viewName) {        
        this.confirmContext(viewName, this.doCreateInternal, this, arguments);
    },
    doCreateInternal: function (id, additionalParams, appState, viewName, model) {
        var record = appState ? appState.record : Ext.create(model);

        this.ensureRequiredStores(function () {
            this.createContentView(viewName, Ext.apply({
                record: record
            }, additionalParams || {}));
        });
    },


    /**
     * Create a new **read-only** editor displaying an existing record of this Controller's associated Taco.core.data.Model.
     * @param  {Number/Taco.core.data.Model} id The ID of the model, or the model itself.
     * @return {undefined}
     */
    read: function (id) {
        this.getEditor({
            obj_id: id,
            editMode: false
        });
    },

    /**
     * @private
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    list: function () {
        // TODO
    },

    /**
     * Create a new ditor editing an existing record of this Controller's associated Taco.core.data.Model.
     * @param  {Number/Taco.core.data.Model} id The ID of the model, or the model itself.
     * @return {undefined}
     */
    update: function (id) {
        this.getEditor({
            obj_id: id,
            editMode: true
        });
    },


    /**
     * Create a contentView and replace all existing content views in Taco.app.contentView with this one.
     * @param  {Taco.core.ux.content.Container} view A Taco.core.ux.content.Container to display.
     * @param  {Object} cfg  Configuration for that container, so it can be created if necessary.
     * @return {Taco.core.ux.content.Container}      The view created or passed.
     */
    createContentView: function (view, cfg) {
        var me = this,
            cfg = cfg || {},
            container = cfg && cfg.options && cfg.options.container ? cfg.options.container : Taco.app.contentView,
            loadmaskTask = cfg.loadmaskTask,
            viewClass;

        if (!view.$className) {

            viewClass = Ext.ClassManager.get(view);
            if (viewClass.factory) {
                loadmaskTask = Ext.defer(
                    function () {
                        Taco.app.setLoading();
                    }, 200);

                viewClass.factory(cfg, function (view) {
                    cfg.loadmaskTask = loadmaskTask;
                    me.createContentView(view, cfg);
                });
                return;
            }
        }


        //removing initial view  to aviod events firing from the create of the view from messin with the 

        view = view.$className ? view : Ext.create(view, cfg);
        if (view.contextConfig && view.contextConfig.requiresContextOfType) {
            view.mon(Taco.app.context, "beforecontextchange", function (newContext) {
                var works = this.worksInContext(view, newContext);
                if (!works) {
                    Taco.app.context.setCurrentContext(Taco.app.context.getStore().findRecord('contextType', Ext.isArray(view.contextConfig.requiresContextOfType) ? view.contextConfig.requiresContextOfType[0] : view.contextConfig.requiresContextOfType).raw, undefined, true);
                }
                return works;
            }, this);
        }

        Ext.suspendLayouts();

        container.removeAll(true);
        container.add(view);

        //console.time('resumeLayouts');
        Ext.resumeLayouts(true);

        //console.timeEnd('resumeLayouts');

        if (Ext.isNumeric(loadmaskTask)) {
            window.clearTimeout(loadmaskTask);
            Taco.app.setLoading(false);
        }

    },

    worksInContext: function (view, ctx) {
        var ctype = ctx.contextType,
            reqctype = (view.contextConfig || {}).requiresContextOfType;
        return (!reqctype || reqctype === ctype || (Ext.isArray(reqctype) && Ext.Array.indexOf(reqctype, ctype) !== -1));
    },

    requiresSiteContext: function () {
        var context = Taco.app.context.getCurrentContext(),
            newContext = null;
        if (Taco.app.context.getCurrent().contextType !== 's') {

            if (context.contextType == 't') {
                newContext = context.masterCatalogs[0].sites[0];
            } else if (context.contextType == 'm' || context.contextType == 'c') {
                newContext = context.sites[0];
            }

            Taco.app.context.setCurrentContext(newContext, undefined, true);
            return true;
        }
        return false;
    },

    confirmContext: function (viewClass, callback, scope, args) {
        var context = Taco.app.context.getCurrentContext(),
            requiresContextOfType,
            newContext;
        args = args && !Ext.isArray(args) ? Array.prototype.slice.call(args, 0) : args;
        viewClass = Ext.isString(viewClass) ? Ext.ClassManager.get(viewClass) : viewClass;
        requiresContextOfType = (viewClass.prototype.contextConfig || {}).requiresContextOfType;

        // fix for ie8. apply doesn't like having undefined arguments;
        if (!args) {
            args = []
        }

        if (this.worksInContext(viewClass.prototype, context)) {
            return callback.apply(scope || this, args);

        }

        if (!Ext.isArray(requiresContextOfType)) {
            requiresContextOfType = [requiresContextOfType];
        }


        // at this point we know the current context is inappropriate:


        if (!newContext && Ext.Array.contains(requiresContextOfType, 'm')) {
            if (context.contextType == 't') {
                newContext = context.masterCatalogs[0];
            }
        }


        if (!newContext && Ext.Array.contains(requiresContextOfType, 'c')) {
            if (context.contextType == 't') {
                newContext = context.masterCatalogs[0].catalogs[0];
            } else if (context.contextType == 'm') {
                newContext = context.catalogs[0];
            }
        }
        if (!newContext && Ext.Array.contains(requiresContextOfType, 's')) {
            if (context.contextType == 't') {
                newContext = context.masterCatalogs[0].sites[0];
            } else if (context.contextType == 'm' || context.contextType == 'c') {
                newContext = context.sites[0];
            }
        }

        if (!newContext) {
            throw 'oops';
        }

        if (Taco.app.context.setCurrentContext(newContext, false, true) !== false) {
            return callback.apply(scope || this, args);
        }

    }
});