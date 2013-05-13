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


    /**
     * Autogenerate a view based on a naming convention `Taco.view.[controllername].Index` where controllername,
     * singularized with Ext.util.Inflector, is the name of this controller.
     * If there are any Context Placeholders based on the current Context Type, it will execute those views instead
     * of the default index view.
     * @return {undefined}
     */
    index: function () {
        // Placeholders disabled for demo; instead, contentviews will cause context to switch to the first available context that they can use.
        //var contextType = Taco.app.context.getCurrent().contextType,
        //    placeholder;

        //Ext.iterate(this.contextPlaceholders, function (key, fn) {
        //    if (key.indexOf(contextType) > -1 && typeof fn === 'function') {
        //        placeholder = fn.apply(this);
        //    }
        //}, this);

        //if (placeholder) {
        //    this.createContentView(placeholder);
        //    return;
        //}

        this.buildIndex();        
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

    buildIndex: function (record) {
        this.createContentView(this.getIndexView(), {
            record: record
        });
    },

    edit: function (id, additionalParams, appState) {
        var record = appState ? appState.record : null, 
            options= appState ? appState.options : null;
        if (record) {
            this.createContentView(this.getEditorView(), {
                record: record,
                options:options
            });
        }else{
            Taco.model[this.modelName].load(id, {
                    success: function(record) {

                        this.createContentView(this.getEditorView(), {
                            record: record,
                            options:options
                        });
                    },
                    scope: this
                });
        }
    },

    create: function (id, additionalParams, appState) {
        var record = appState ? appState.record : Ext.create('Taco.model.' + this.modelName);;
      
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
            if (view.requiresContextOfType) {
                view.mon(Taco.app.context, "beforecontextchange", function (newContext) {
                    var works = this.worksInContext(view, newContext);
                    if (!works) Taco.app.context.setCurrentContext(Taco.app.context.getStore().findRecord('contextType', Ext.isArray(view.requiresContextOfType) ? view.requiresContextOfType[0] : view.requiresContextOfType).raw);
                    return works;
                }, this);
            }
            
            Taco.app.contentView.add(view);
            return view;
        }
    },

    worksInContext: function (view, ctx) {
        var ctype = ctx.contextType,
            reqctype = view.requiresContextOfType;
        return (!reqctype || reqctype === ctype || (Ext.isArray(reqctype) && Ext.Array.indexOf(reqctype, ctype) !== -1));
    },
            

    confirmContext: function(viewClass) {
        var context = Taco.app.context.getCurrentContext(),
            requiredContextType = viewClass.prototype.requiresContextOfType;


        if (this.worksInContext(viewClass.prototype, context)) return true;

        if (Ext.isArray(requiredContextType)) requiredContextType = requiredContextType[0];

        if (!requiredContextType) return true; // should never happen at this point

        // at this point we know the current context is inappropriate:
        Taco.app.context.setCurrentContext(Taco.app.context.getStore().findRecord('contextType', requiredContextType).raw);
        return false;
    },
    
});