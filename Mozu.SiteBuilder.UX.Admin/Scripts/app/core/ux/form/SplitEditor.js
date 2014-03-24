/**
 * @class Taco.core.ux.form.SplitEditor
 * @author Jimmy Sanford
 *
 * The base class for a split content container with a left-side grid panel and right-side form panel.
 *
 * This class extends the base class for split containers, {@link Taco.core.ux.content.SplitContainer}.
 */

Ext.define('Taco.core.ux.form.SplitEditor', {
    extend: 'Taco.core.ux.content.SplitContainer',
    alias: 'widget.spliteditor',

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
        mode: 'view'
    },

    initComponent: function () {
        var cfg = this.header.initialConfig;

        if (!this.originalTitle) {
            this.originalTitle = (cfg && cfg.title ? cfg.title : 'View ' + Ext.util.Inflector.pluralize(this.recordType));
        }

        this.callParent(arguments);
    },

    /**
     * Auto-generated method called before setting the `mode` config.
     *
     * @private
     * @param  {String} nextMode The value to be set, before modifications.
     * @return {String} The value to be set, after modifications.
     */
    applyMode: function (nextMode) {
        var prevMode = this.getMode() || this.config.mode;

        if (prevMode !== nextMode) {
            this.fireEvent('modechange', nextMode, prevMode);
            this.onModeChange(nextMode, prevMode);
        }

        return nextMode;
    },

    /**
     * Bind any header actions configured with `formBind: true`. Bound items will be automatically
     * enabled or disabled according to the valid state of the form.
     *
     * @private
     */
    bindActionsToForm: function () {
        var actions = this.header.actionsContainer;
        var boundItems = this.getEast().down('form').getForm().getBoundItems();

        actions.items.each(function (item) {
            if (item.formBind) {
                boundItems.add(item);
            }
        });
    },

    /**
     * Change the record that is bound to the form.
     * 
     * @param  {Ext.data.Model} record The new record to be bound to the form.
     */
    changeRecord: function (record) {
        var nextTitle = 'Create Product';

        if (record) {
            this.setMode('edit');
            this.getEast().down('form').loadRecord(record);
            nextTitle = 'Edit ' + (record.get('productName') || 'Product');
        } else {
            this.resetForm();
        }

        this.setTitle(nextTitle);

        this.setCollapsedState({
            west: false,
            east: false
        });
    },

    /**
     * Perform a cancel action.
     *
     * By default, this function resets the form and updates the collapsed state.
     */
    doCancel: function (e, t) {
        this.resetForm();

        this.setCollapsedState({
            west: false,
            east: true
        });
    },

    /**
     * Perform a create action.
     *
     * By default, this function resets the grid selection and binds a null record to the form.
     */
    doCreate: function () {
        this.getWest().down('grid').getSelectionModel().deselectAll();

        this.resetForm();
        this.changeRecord(null);
    },

    /**
     * Perform a save action.
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
        this.changeRecord(selected[0]);
    },

    /**
     * Updates the split editor's `mode` following a `collapsedState` change.
     * @param {Object} nextState The next collapsed state.
     * @param {Object} prevState The previous collapsed state.
     */
    onCollapsedStateChange: function (nextState, prevState) {
        var record = this.getEast().down('form').getForm().getRecord();

        if (nextState.east === true) {
            this.setMode('view');
        } else {
            this.setMode(record ? 'edit' : 'create');
        }
    },

    /**
     * A template method for responding to a `mode` change.
     *
     * By default, this function updates the header title.
     * 
     * @param  {String} nextMode The next mode.
     * @param  {String} prevMode The previous mode.
     */
    onModeChange: function (nextMode, prevMode) {
        var isView = (nextMode === 'view');
        var recordType = this.recordType;
        var record = this.getEast().down('form').getForm().getRecord();
        var nextTitle = (isView ? 'Component Testing' : 'Create ' + recordType);

        if (nextMode === 'edit') {
            nextTitle = 'Edit ' + (record ? record.get(this.recordNameField) || recordType : recordType);
        }

        this.setTitle(nextTitle);
    },

    /**
     * A helper function for resetting the form and unbinding its record.
     * @param {Boolean} resetRecord False to not unbind the record from the form.
     */
    resetForm: function (resetRecord) {
        this.getEast().down('form').getForm().reset(!(resetRecord === false));
    }
});
