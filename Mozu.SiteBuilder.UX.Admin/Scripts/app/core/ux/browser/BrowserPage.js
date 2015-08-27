/**
 * @class Taco.core.ux.browser.BrowserPage
 * A classic index page for a collection of objects. Includes a sidebar where filters go.
 */
Ext.define('Taco.core.ux.browser.BrowserPage', {
    extend: 'Taco.core.ux.content.Container',
    alias: 'widget.browserpage',
    requires: [
        'Taco.core.ux.grid.Panel',
        'Taco.core.ux.TilePanel',
   
        'Ext.util.Inflector',
        'Ext.form.Panel',
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView',        
        'Taco.core.ux.browser.ItemBrowser',
        'Ext.selection.CheckboxModel',
        'Taco.core.ux.browser.FilterList'
    ],

    cls: undefined,
    reFetchRecordOnEdit:false,
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

    destroy: function () {
        if (this.rowEditor) {
            this.rowEditor.destroy();
            this.rowEditor = null;
        }

        this.callParent(arguments);
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

    launchLoadedEditor: function (record, options) {
        var complexMetaData = { record: record, options: options };
        if (this.reFetchRecordOnEdit) {
            delete complexMetaData.record;
        }
        
        Ext.defer(function() {
            Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/edit/' + record.getId(), complexMetaData );
        }, 1, this);
    }
});