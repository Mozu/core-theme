/**
 * @class Taco.core.ux.browser.BrowserPage
 * A classic index page for a collection of objects. Includes a sidebar where filters go.
 */
Ext.define('Taco.core.ux.browser.BrowserPage', {
    extend: 'Taco.core.ux.content.Container',
    alias: 'widget.browserpage',
    requires: ['Taco.core.ux.grid.Panel', 'Taco.core.ux.TilePanel', 'Taco.core.ux.grid.Pager', 'Ext.util.Inflector', 'Ext.form.Panel', 'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter', 'Taco.core.ux.FilterableDataView', 'Taco.core.ux.modal.Confirmation', 'Taco.core.ux.browser.ItemBrowser', 'Ext.selection.CheckboxModel', 'Taco.core.ux.browser.FilterList', 'Taco.core.ux.browser.Modal'],

    cls: undefined,

    mixins: {
        browsable: 'Taco.core.ux.browser.Browsable'
    },

    constructor: function (conf) {
        //this.mixins.browsable.constructor(conf);
        //this.initBrowsable();
        this.callParent(arguments);
        
    },
    
    initComponent: function () {
        this.initBrowserConfig();

        this.callParent(arguments);

        this.initBrowserListeners();
    },

    launchBulkEditor: function () {
        Ext.create('Taco.core.ux.browser.Modal', {
            store: this.store,
            columns: this.bulkEditorColumns || this.gridPanelConf.columns
        });
    },

    launchEditor: function (record, options) {
        var me = this,
            modelClass = Ext.ClassManager.get(me.modelName);
        if ( Ext.isString(record)) {
            modelClass.load(record, {
                success: function (model) {
                    me.launchLoadedEditor(model, options);
                }
            });
            return;
        }
        me.launchLoadedEditor(record, options);
    },

    launchLoadedEditor: function(record, options) {
        Ext.defer(function() {
            Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/edit/' + record.getId(), { complexMetaData: { record: record, options: options } });
        }, 1, this);
    }
});