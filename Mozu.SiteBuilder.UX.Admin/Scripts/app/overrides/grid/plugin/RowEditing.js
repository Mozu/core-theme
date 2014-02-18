/**
 *
 * @class Taco.overrides.grid.plugin.RowEditing
 * @author 
 * Over ride of the rowEditing plugin. Adds support for Control Enter Key
 */

Ext.define('Taco.overrides.grid.plugin.RowEditing', {
    override: 'Ext.grid.plugin.RowEditing',

    init: function () {
        this.callParent(arguments);
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
