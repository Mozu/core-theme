/**
 *
 * @class Taco.overrides.grid.plugin.RowEditing
 * @author 
 * Over ride of the rowEditing plugin. Adds support for Control Enter Key
 */

Ext.define('Taco.overrides.grid.plugin.RowEditing', {
    override: 'Ext.grid.plugin.RowEditing',

    /**
     * @cfg {Boolean} autoSave
     * `true` to automatically save any pending changes when the row editor begins editing a new row.
     * `false` will then check the autoCancel member which forces the user to explicitly cancel the pending changes or will auto cancel.
     */
    autoSave: true,

    autoCancel: false,

    /**
     * override of extjs class method. adding support for autoSave.
     */
    initEditorConfig: function () {
        var me = this;        
        var cfg = me.callParent(arguments);
        cfg.autoSave = me.autoSave;
        return cfg;
    },

    init: function () {
        this.callParent(arguments);
    },


    // this is a fix for 4.2.2  remove this method after 4.3
    onEnterKey: function () {        
        // need skip over the superclass of this override as its method is overriding the base class;
        this.superclass.onEnterKey.apply(this, arguments)
        // commented out from original extjs method  
        /*
        if (this.getEditor().getForm().isValid()) {
            this.completeEdit();
        }*/
    },


    completeEdit: function () {
        var me = this,
            createNew = false,
            evt;
        
        // because this method gets called with different arguments depending on the trigger; keyboard vs. save button; We need to extact the evt 
        for (var i = 0; i < arguments.length; i++) {

            if (arguments[i].browserEvent) {
                evt = arguments[i];
                // mouse clicked on save button
                if (evt.type == "click") {
                    createNew = evt.shiftKey;
                } else if (evt.type=="keydown"){
                    createNew = evt.ctrlKey;
                }
            }
        }

        this.callParent(arguments)
        
        if (!this.editing && createNew) {
            // create new after save
            this.onCtrlEnterKey()
        }
    },
    // method that gets called when user hits contrl enter key; intended to be over written by instantiating class;
    onCtrlEnterKey: Ext.emptyFn
});
