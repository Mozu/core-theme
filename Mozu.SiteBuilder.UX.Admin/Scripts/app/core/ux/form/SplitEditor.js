/**
 * @class Taco.core.ux.form.SplitEditor
 * @author Jimmy Sanford
 *
 * The base class for a split content container with a left-side grid panel and right-side form panel.
 * Contributions of the Split Editor:
 * Includes the NavHeader mixin which encapsolates the navigation header (title, save, cancel, create, next, previous)
 * Manages communications between the grid in the west position and the editor (typically a form) in the east position.
 * 
 * This class extends the base class for split containers, {@link Taco.core.ux.content.SplitContainer}.
 * 
 * TODO: Fully exercise the adding removing, hiding, and showing of navHeader buttons based on the state of the mode;
 */

Ext.define('Taco.core.ux.form.SplitEditor', {
    extend: 'Taco.core.ux.content.SplitContainer',
    alias: 'widget.spliteditor',
    mixins: {
        // this provides the top navigation bar. It includes the title, cancel, save, and create new button. 
        navHeader: 'Taco.core.ux.mixins.NavHeader'
    },

    /**
     * @cfg {String} originalTitle
     * The title to use when the split editor is in `view` mode. Defaults to the header's initialConfig
     * title, or `View Records` if there is no configured title.
     */

    /**
     * @cfg {String} recordNameField
     * The field that contains the record's name, for use in the header title.
     */
    recordNameField: 'name',

    /**
     * @cfg {String} recordType
     * A short string denoting the type of record being edited. This will be used as a fallback if more
     * specific titles are not configured.
     */
    recordType: 'Record',

    config: {
        /**
         * @cfg {String} mode
         * The current mode of the split editor. Acceptable configuration values for this property are:
         *
         *  - **view** - the form is inactive
         *  - **edit** - the form is active and is currently bound to a record
         *  - **create** - the form is active but is **not** currently bound to a record
         *
         * Defaults to `'view'`
         */
        mode: 'view',

        useSplit: false
    },

    title: "Split Editor Title",

    initComponent: function () {
        var cfg;

        this.mixins.navHeader.init.apply(this, arguments);

        this.callParent(arguments);

        this.updateSplitTitle();

        //cfg = this.header.initialConfig;       

        //if (!this.originalTitle) {
        //    this.originalTitle = (cfg && cfg.title ? cfg.title : 'View ' + Ext.util.Inflector.pluralize(this.recordType));
        //}
    },

    /**
     * Auto-generated method called before setting the `mode` config.
     *
     * @private
     * @param  {String} nextMode The value to be set, before modifications.
     * @return {String} The value to be set, after modifications.
     */
    applyMode: function (nextMode) {
        var prevMode = this.getMode() || this.config.mode
        
        if (prevMode !== nextMode) {
            this.fireEvent('modechange', this, nextMode, prevMode);
            this.onModeChange(nextMode, prevMode);
        }

        return nextMode;
    },

    /**
     * Change the record that is bound to the form.
     * 
     * @param  {Ext.data.Model} record The new record to be bound to the form.
     */
    changeRecord: function (nextRecord) {
        var recordType = this.recordType;
        var nextTitle = 'Create ' + recordType;

        if (nextRecord) {
            this.setMode('edit');
            this.fireEvent('recordchange', this, nextRecord);
            this.onRecordChange(nextRecord);

            nextTitle = 'Edit ' + (nextRecord.get(this.recordNameField) || recordType);
            //Jimmy, we should consider simplifying this and delegating to the views to define their titles. 
            // Since the views will need be able to stand alone and display an appropriate title outside of the splitEditor.
            
            
            

        } else {
            this.setMode('create');
            this.resetForm();
        }
        
        // we should consolidate all title setting logic and delegate it to the view that's controlling the title;
        //this.setTitle(nextTitle);
        this.updateSplitTitle();

        this.setCollapsedState({
            west: !this.getUseSplit(),
            east: false
        });
    },

    

    /**
     * Perform a cancel action.
     *
     * By default, this function resets the form and updates the collapsed state.
     */
    doCancel: function (e, t) {

        var grid = this.getWest().down('grid');
        if (grid) {
            grid.getSelectionModel().deselectAll(true);
        }
        
        this.resetForm();

        this.setCollapsedState({
            west: false,
            east: !this.getUseSplit()
        });
    },

    /**
     * A template method for performing a create action.
     *
     * By default, this function deselects all records in the grid.
     */
    doCreate: function () {
        var grid = this.getWest().down('grid');
        if (grid) {
            grid.getSelectionModel().deselectAll(true);
        }
        this.changeRecord(null);
    },


    /**
     * A template method for performing a save action.
     *
     * By default, this function does nothing.
     */
    doSave: Ext.emptyFn,

    /**
     * An event handler triggered by a selectionchange on the grid.
     *
     * By default, this function binds the selected record to the form.
     *
     * @private
     * @param {Ext.selection.Model} selModel The grid's selection model.
     * @param {Ext.data.Model[]} selected The array of selected records.
     */
    handleSelectionChange: function (selModel, selected) {
        this.changeRecord(Ext.isArray(selected) ? selected[0] : selected);
    },

    /**
     * Include CSS classes.
     */
    onBoxReady: function () {
        this.callParent(arguments);

        this.addCls('taco-spliteditor');
    },

    /**
     * Updates the split editor's `mode` following a `collapsedState` change.
     * 
     * @param {Object} nextState The next collapsed state.
     * @param {Object} prevState The previous collapsed state.
     */
    onCollapsedStateChange: function (nextState, prevState) {

        var form = this.getEast().down('form');
        var record = form ? form.getForm().getRecord() : null;

        // determine whether to continue using the split
        if (!nextState.east && !prevState.east) {
            this.setUseSplit(!nextState.west);
        } else if (!nextState.west && !prevState.west) {
            this.setUseSplit(!nextState.east);
        }

        if (nextState.east === true) {
            this.setMode('view');
        } else if (form) {
            this.setMode(record ? 'edit' : 'create');
        }
        
        this.updateSplitTitle();

    },

    /**
     * A template method for responding to a `mode` change.
     *
     * By default, this function updates the header title.
     * 
     * @param {String} nextMode The next mode.
     * @param {String} prevMode The previous mode.
     */
    onModeChange: function (nextMode, prevMode) {
        var isView = (nextMode === 'view');
        var recordType = this.recordType;
        var form = this.getEast().down('form');
        var record = form ? form.getForm().getRecord() : null;
        var nextTitle = (isView ? this.originalTitle : 'Create ' + recordType);

        if (nextMode === 'edit') {
            nextTitle = 'Edit ' + (record ? record.get(this.recordNameField) || recordType : recordType);
        }
        // we should consolidate all title setting logic and delegate it to the view that's controlling the title;
        //this.setTitle(nextTitle);        
        this.updateSplitTitle()
    },

    /**
     * A template method for responding to a record change.
     *
     * By default, this function loads the new record into the form.
     * 
     * @param {Ext.data.Model} The next record.
     */
    onRecordChange: function (nextRecord) {
        var form = this.getEast().down('form');

        if (form) {
            form.loadRecord(nextRecord);
        }
    },

    /**
     * A helper function for resetting the form and unbinding its record.
     * 
     * @param {Boolean} resetRecord False to not unbind the record from the form.
     */
    resetForm: function (resetRecord) {
        var form = this.getEast().down('form');

        if (form) {
            form.getForm().reset(!(resetRecord === false));
        }
    },

    // override this if you want to let your west sub panel to give you the title;
    getWestTitle: function () {
        return this.getTitle();
    },

    // override this if you want to let your west sub panel to give you the title;
    getEastTitle: function () {
        return this.getTitle();
    },

    updateSplitTitle: function () {
        var westTitle = this.getWestTitle(),
            eastTitle = this.getEastTitle(),
            activeTitle = (this.getMode() == "view") ? westTitle : eastTitle;

        this.setTitle(activeTitle);
    }
});
