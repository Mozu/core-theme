/**
 * @class Taco.view.settings.localization.widget.LocalizationGrid
*/
Ext.define('Taco.view.settings.localization.widget.LocalizationGrid', {
    extend: 'Taco.core.ux.browser.SearchList',
  
    requires: [
         'Ext.Date',
        'Ext.form.Panel', 'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter',
        'Taco.core.ux.action.SecondaryButton',
        'Taco.core.ux.FilterableDataView', 'Taco.core.ux.grid.MenuColumn',
        'Taco.store.ShippingZones',
        'Taco.model.TargetRule'
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
    enableRowEditing: true,
    enableAutoSelect: true,

    createButtonEnabled: false,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    showActionsColumn: false,

    hideSearchToolbar: false,
    selType: 'cellmodel',

    autoScroll: true,

    enableQuickFilters: true,

    advancedSearchConfig: null,

    stateful: false,

    //stateId: 'statefulOrderGrid',

    initComponent: function () {
        var me = this;

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
                    fn: function (editor, column, e) {
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
        });

        this.advancedSearchConfig = this.getAdvancedSearchConfig();

        this.store = this.getStore();

        me.callParent(arguments);

        this.mon(this.view, 'drop', function(node, data, overModel, dropPosition, eOpts) {
            // need top set a model member to dirty the record so that the store will persist the change; the value you set isn't persisted;
            data.records[0].set('index', 1);
        }, this);
    },

    getAdvancedSearchConfig: function() {
        var mc = Taco.app.context.getMasterCatalog(),
            excludeDefaultLocale = true,
            supportedLocales = (!mc) ? [] : mc.getSupportedLocales(excludeDefaultLocale),
            quickFilters = [
                            [{ hasRecord: false }, 'Missing Translation'],
                            [{ hasRecord: true}, 'Has Translation'],
                            [{}, 'All Records']
                        ];

            Ext.Array.each(supportedLocales, function(loc) {
                quickFilters.push([{ localeNotExists: loc }, 'Missing ' + loc]);
                quickFilters.push([{ localeExists: loc }, 'Has ' + loc]);
            });

        return {
            advancedFormCls: 'Taco.core.ux.form.Form',

            quickFilterData: quickFilters
        };
    }

});


