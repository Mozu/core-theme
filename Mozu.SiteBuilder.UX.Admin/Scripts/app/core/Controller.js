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
        var contextType = Taco.app.context.getCurrent().contextType,
            placeholder;

        Ext.iterate(this.contextPlaceholders, function (key, fn) {
            if (key.indexOf(contextType) > -1 && typeof fn === 'function') {
                placeholder = fn.apply(this);
            }
        }, this);

        if (placeholder) {
            this.createContentView(placeholder);
            return;
        }

        this.buildIndex();        
    },

    getIndexView: function () {
        if (!this.indexView) {
            console.log(this.id);
            this.indexView = 'Taco.view.' + Ext.String.uncapitalize(Ext.util.Inflector.singularize(this.id)) + '.Index';
        }
        return this.indexView;
    },
    
    getEditorView: function () {
        if (!this.editorView) {
            console.log(this.id);
            this.editorView = 'Taco.view.' + Ext.String.uncapitalize(Ext.util.Inflector.singularize(this.id)) + '.Edit';
        }
        return this.editorView;
    },

    buildIndex: function (record) {
        this.createContentView(this.getIndexView(), {
            record: record
        });
    },

    edit: function (id) {
        Taco.model[this.modelName].load(id, {
            success: function(record) {

                this.createContentView(this.getEditorView(), {
                    record: record
                });
            },
            scope: this
        });
    },

    create: function () {
        var record = Ext.create('Taco.model.' + this.modelName);
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
        view = view.$className ? view : Ext.create(view, cfg);
        Taco.app.contentView.removeAll(true);
        Taco.app.contentView.add(view);
        return view;
    }
    
});