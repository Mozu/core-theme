/**
 * @class Taco.core.Controller
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
        var me = this,
            model = Taco.model[this.modelName],
            requiredStoresLoading = false;
        options.loadingStores = options.loadingStores || [];

        if (model) {
            Ext.each(model.prototype.requiredStores, function (storeCfg) {

                var store = Taco.core.data.StoreManager.getOrCreate(storeCfg);
                if (store.storeManagerConfig && store.storeManagerConfig.createOnly) {
                    Ext.global.console.warn('cant use store ' + store.$className + ' ad requiredStore');

                } else if (!store.hasCompletedLoading()) {

                    requiredStoresLoading = true;

                    if (Ext.Array.indexOf(options.loadingStores, storeCfg) === -1) {

                        options.loadingStores.push(storeCfg);

                        if (!store.isLoading()) {
                            store.load({
                                callback: function () {
                                    me.ensureRequiredStores(options);
                                }
                            });
                        } else {
                            store.on({
                                load: {
                                    fn: function () {
                                        me.ensureRequiredStores(options);
                                    },
                                    single: true
                                }
                            });
                        }
                    }
                }
            });

        }

        if (requiredStoresLoading) {
            Taco.app.setLoading();
            return;
        }
        Taco.app.setLoading(false);
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

        this.ensureRequiredStores(function () {
            this.buildIndex(record, options);
        });


    },

    getIndexView: function () {
        if (!this.indexView) {
            //console.log(this.id);
            this.indexView = 'Taco.view.' + Ext.String.uncapitalize(Ext.util.Inflector.singularize(this.id)) + '.Index';
        }
        return this.indexView;
    },

    getEditorView: function () {
        if (!this.editorView) {
            //console.log(this.id);
            this.editorView = 'Taco.view.' + Ext.String.uncapitalize(Ext.util.Inflector.singularize(this.id)) + '.Edit';
        }
        return this.editorView;
    },

    buildIndex: function (record, options) {
        this.createContentView(this.getIndexView(), {
            record: record,
            options: options
        });
    },

    edit: function (id, additionalParams, appState) {
        var record = appState ? appState.record : null,
            options = appState ? appState.options : null;
        if (record) {
            this.ensureRequiredStores(function () {
                this.createContentView(this.getEditorView(), {
                    record: record,
                    options: options
                });
            });
        } else {
            Taco.app.setLoading();
            Taco.model[this.modelName].load(id, {
                success: function (record) {
                    Taco.app.setLoading(false);

                    this.ensureRequiredStores(function () {
                        this.createContentView(this.getEditorView(), {
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
        var record = appState ? appState.record : Ext.create('Taco.model.' + this.modelName);

        this.createContentView(this.getEditorView(), {
            record: record
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
    list: function (params) {
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
        var viewClass = Ext.ClassManager.get(view);
        if (this.confirmContext(viewClass)) {
            //removing initial view  to aviod events firing from the create of the view from messin with the 
            Taco.app.contentView.removeAll(true);
            view = view.$className ? view : Ext.create(view, cfg);
            if (view.contextConfig && view.contextConfig.requiresContextOfType) {
                view.mon(Taco.app.context, "beforecontextchange", function (newContext) {
                    var works = this.worksInContext(view, newContext);
                    if (!works) Taco.app.context.setCurrentContext(Taco.app.context.getStore().findRecord('contextType', Ext.isArray(view.contextConfig.requiresContextOfType) ? view.contextConfig.requiresContextOfType[0] : view.contextConfig.requiresContextOfType).raw);
                    return works;
                }, this);
            }

            Taco.app.contentView.add(view);
            return view;
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
            
            Taco.app.context.setCurrentContext(newContext);
            return true;
        }
        return false;
    },

    confirmContext: function (viewClass) {
        var context = Taco.app.context.getCurrentContext(),
            requiresContextOfType = (viewClass.prototype.contextConfig || {}).requiresContextOfType,
            newContext = null;
        if (this.worksInContext(viewClass.prototype, context)) return true;

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

        Taco.app.context.setCurrentContext(newContext);
        return false;
    }
});