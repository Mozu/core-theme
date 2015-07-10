/**
 * @class Taco.core.ux.mixins.SplitEditor
 * @author Travis Johnson
 * 
 * Designed to be used with Taco.core.ux.form.SplitContainer and Taco.core.ux.form.TripleSplitContainer
 */

Ext.define('Taco.core.ux.mixins.SplitEditor', {

    config: {
        record: null
    },

    mixins: {
        // this provides the top navigation bar. It includes the title, cancel, save, and create new button. 
        navHeader: 'Taco.core.ux.mixins.NavHeader'
    },

    init: function () {
        this.mixins.navHeader.init.apply(this, arguments);

        this.updateSplitTitle();
    },

    /**
     * @private
     * The function to execute when the default cancel button is pressed     
     */
    cancel: function () {
        var me = this;

        if (me.fireEvent('beforecancel', me) !== false) {
            me.onCancel();
            me.fireEvent('cancel', me);
            me.doCancel();
        }
    },

    /**
     * @private
     * The function to execute when the default create button is pressed     
     */
    create: function () {
        var me = this;

        if (me.fireEvent('beforecreate', me) !== false) {
            me.onCreate();
            me.fireEvent('create', me);
            me.doCreate();
        }
    },

    /**
     * Perform a cancel action.
     *
     * By default, this function resets the form and updates the collapsed state.
     */
    doCancel: function () {
        // this.getWest().down('grid').getSelectionModel().deselectAll(true);

        this.setRecord(null);
    },

    /**
     * A template method for performing a create action.
     *
     * By default, this function deselects all records in the grid.
     */
    doCreate: function () {
        // this.getWest().down('grid').getSelectionModel().deselectAll(true);

        this.setRecord(null);
    },

    /**
     * A template method for performing a save action.
     */
    doSave: Ext.emptyFn,

    /**
     * A template method for getting the east panel's title. This method is not auto-generated.
     *
     * By default, this function simply returns the split editor's title.
     * @return {String} The east title.
     */
    getEastTitle: function () {
        return this.getTitle();
    },

    /**
     * A template method for getting the west panel's title. This method is not auto-generated.
     *
     * By default, this function simply returns the split editor's title.
     * @return {String} The west title.
     */
    getWestTitle: function () {
        return this.getTitle();
    },

    /**
     * Include CSS classes.
     */
    onBoxReady: function () {
        this.callParent(arguments);

        this.addCls('taco-spliteditor');
    },

    /**
     * A template method called just before the cancel event is fired.
     */
    onCancel: Ext.emptyFn,

    /**
     * A template method called just before the create event is fired.
     */
    onCreate : Ext.emptyFn,

    /**
     * A template method for responding to a record change.
     *
     * By default, this function expands or collapses the west and east panels.
     * 
     * @param  {Ext.data.Model} nextRecord The next record.
     */
    onRecordChange: function (nextRecord) {
        if (this.getSplit() === false) {
            this.getEast()[nextRecord ? 'expand' : 'collapse']();
            this.getWest()[nextRecord ? 'collapse' : 'expand']();
        }

        // this.updateSplitTitle();
    },

    /**
     * A template method called just before the save event is fired.
     */
    onSave: Ext.emptyFn,

    /**
     * @private
     * The function to execute when the default save button is pressed
     * This is the beginning of the save process not the end. 
     * Listen to the "savesuccess" event to get the final data after the save process completes
     * Subclasses should NOT override this method with their own behavior. They should override the doSave()
     */
    save: function () {
        var me = this;

        if (me.fireEvent('beforesave', me) !== false) {
            me.onSave();
            me.fireEvent('save', me);
            me.doSave();
        }
    },

    /**
     * Auto-generated method called after setting the `record` config.
     *
     * @private
     * @param  {Ext.data.Model} nextRecord The record.
     */
    updateRecord: function (nextRecord) {
        this.fireEvent('recordchange', this, nextRecord);
        this.onRecordChange(nextRecord);
    },

    /**
     * Update the split editor's title by getting either the west or east panel's title.
     * This method is not auto-generated.
     *
     * @private
     */
    updateSplitTitle: function () {
        var activeTitle = (this.getRecord() ? this.getEastTitle() : this.getWestTitle()) || 'Records';

        Ext.suspendLayouts();
        this.setTitle(activeTitle);
        Ext.resumeLayouts();
    }
});
