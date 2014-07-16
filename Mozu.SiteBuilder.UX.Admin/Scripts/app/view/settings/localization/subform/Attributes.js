/**
 * @class Taco.view.settings.localization.subform.Attribute 
 *
 */

Ext.define('Taco.view.settings.localization.subform.Attributes', {
    extend: 'Taco.view.settings.localization.subform.Subform',
    requires: [
        'Taco.view.settings.localization.widget.LocalizationGrid',
        'Taco.view.settings.localization.AdvancedSearchForm'
    ],
    itemId: 'localizedAttrSubForm',
    title: 'Attributes',
    margin: '20 0',
    initComponent: function () {
        var me = this;

        this.localizedAttributeGrid = Ext.create('Taco.view.settings.localization.widget.LocalizationGrid', {
            advancedSearchConfig: me.getAdvancedSearchConfig(),
            storeConfig: { type: 'Taco.store.LocalizedAttributes' },
            columnConfig: me.getColumnConfig()
        });

        this.items = [
            this.localizedAttributeGrid
        ];

        this.callParent(arguments);

        //me.mon(me.localizedAttributeGrid.store, 'datachanged', me.onStoreDataChanged, me);

    },

    getColumnConfig: function() {
        var me = this,
            mc = Taco.app.context.getMasterCatalog(),
            excludeDefaultLocale = true,
            supportedLocales = (!mc) ? [] : mc.getSupportedLocales(excludeDefaultLocale),
            columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'attributeFQN',
                text: 'MC Attribute Id',
                hideable: false,
                minWidth: 300
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'adminName',
                text: 'MC Attribute Admin Name',
                flex: 1,
                width: 150
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                text: 'Attribute Name (English)',
                flex: 1,
                width: 150
            }
            ];

        // todo: take into account search filter to only show language? - Greg Murray on 2014-07-14 


        // todo: move to superclass, getLocaleColumns, exclude primary? - Greg Murray on 2014-07-10 

        Ext.Array.each(supportedLocales, function (locale) {
            var col = {
                xtype: 'gridcolumn',
                dataIndex: locale + '_name',
                text: locale,
                flex: 1,
                width: 150,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                editor: {
                    xtype: "textfield",
                    showBorder: true,
                    hideTrigger: true,
                    emptyText: "missing",
                    msgTarget: "qtip",
                    selectOnFocus: true,
                    allowBlank: true
                }
            };
            columns.push(col);
        });
        return columns;
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
            advancedFormCls: 'Taco.view.settings.localization.AdvancedSearchForm',

            quickFilterData: quickFilters
        };
    },

    //onStoreDataChanged: function (bundleStore) {
    //    var me = this,
    //        productForm = me.up("productform");

    //    // when the contents of the bundle store chanes, we need to notifiy the other subForms of the changes so that they can react. Specifically, the shipping and price area will update;
    //    //todo change this to fire on the record instead of the productForm
    //    if (productForm) {
    //        productForm.fireEvent('bundleItemChange');
    //    }
    //},

    // Called before the updateTask of Taco.core.ux.form.Form is executed; Return false to cancel the save; Can be used to manipulate the record data prior to saving;
    //beforeSave: function () {
    //    /*
    //    var me = this;
    //    // need to serialize the store into jsons for persistance
    //    var store = this.productBundleGrid.store;
    //    var data = [];
    //    store.each(function(record) {
    //        data.push(Ext.clone(record.data));
    //    });
        
    //    this.product.set('bundledProducts', data);
    //    */
    //    return true;
    //}
});