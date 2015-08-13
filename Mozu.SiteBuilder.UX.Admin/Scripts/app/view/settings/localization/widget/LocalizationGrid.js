/**
 * @class Taco.view.settings.localization.widget.LocalizationGrid
*/
Ext.define('Taco.view.settings.localization.widget.LocalizationGrid', {
    extend: 'Taco.core.ux.browser.SearchList',

    requires: [
        'Ext.Date',
        'Ext.form.Panel', 'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView', 'Taco.core.ux.grid.MenuColumn'
    ],
    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },

    launchEditorOnClick: false, 

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    //modelName: 'Taco.model.TargetRule',

    enableNavHeader: true,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: true,

    createButtonEnabled: false,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    showActionsColumn: false,
    enableColumnHide: true,

    hideSearchToolbar: false,
    selType: 'cellmodel',

    autoScroll: true,

    enableQuickFilters: true,

    //required to be set
    advancedSearchConfig: null,
    //columnConfig: null,
    //storeConfig: null,

    stateful: false,
    width: "100%",
    scroll: 'vertical',

    //stateId: 'statefulOrderGrid',

    initComponent: function () {
        var me = this,
            mc = Taco.app.context.getMasterCatalog(),
            excludeDefaultLocale = true,
            supportedLocales = (!mc) ? [] : mc.getSupportedLocales(excludeDefaultLocale),
            supportedCurrencies = (!mc) ? [] : mc.getSupportedCurrencies(excludeDefaultLocale);

        Ext.apply(me, {
            viewConfig: {
                deferEmptyText: false,
                emptyText: "No items",
                plugins: [
                    {
                        ptype: 'gridviewdragdrop'
                    }
                ]
            },
            listeners: {
                'edit': {
                    fn: function (editor, column) {
                        if (!column.record.dirty) {
                            return;
                        }
                        column.record.set('supportedLocales', supportedLocales);
                        column.record.set('supportedCurrencies', supportedCurrencies);
                        column.record.commit();
                        column.record.save();
                    }
                }
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
            columns: this.getColumnConfig()
            //columns: me.columnConfig
        });

        //this.advancedSearchConfig = me.advancedSearchConfig;
        if (me.getAdvancedSearchConfig) {
            me.advancedSearchConfig = this.getAdvancedSearchConfig();
        }

        //this.store = me.storeConfig;
        me.store = this.getStore();

        me.callParent(arguments);

        me.mon(this.view, 'drop', function(node, data) {
            // need top set a model member to dirty the record so that the store will persist the change; the value you set isn't persisted;
            data.records[0].set('index', 1);
        }, this);
    },
    

    onRowEditorUpdate: function () {
        this.callParent(arguments);
    }

});


