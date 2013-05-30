/**
 * @class Taco.view.site.page.settings.Facets
 */
Ext.define('Taco.view.site.page.settings.Facets', {
    extend: 'Taco.view.site.page.PageSettingsPanel',
    requires: ['Taco.core.ux.form.field.MultiSelect'],
    title: "Facets",
    initComponent: function () {
        var me = this,
            configuredFacetsStore = this.record.getConfiguredFacets(),
            availableFacetsStore = this.record.getAvailableFacets();

        configuredFacetsStore.load();
        availableFacetsStore.load();

        this.configuredFacetsView = window.cfv = Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'facets',
            width: 250,
            store: configuredFacetsStore,
            maxSelections: 1,
            ignoreSelectChange: true,
            listConfig: {
                selModel: { mode: 'SINGLE' },
                itemTpl: new Ext.XTemplate(
                '<span class="x-boundlist-item-drag">Drag </span>',
                '<span class="x-boundlist-item-content">{source.name}</span>',
                '<tpl if="source.isRangeQueryable">',
                '<span class="x-boundlist-item-settings">Settings </span>',
                '</tpl>',
                '<tpl if="!validity.isValid">',
                '<span class="x-boundlist-item-problem">Problem </span>',
                '</tpl>',
                '<tpl if="this.isThisCategory(categoryId)">',
                '<span class="x-boundlist-item-close">Close </span>',
                '<tpl else>',
                '<span class="x-boundlist-item-hide">Hide </span>',
                '</tpl>',
                {
                    isThisCategory: function (categoryId) {
                        return categoryId == me.record.get('id');
                    }
                }
            )
            },
            ddReorder: true
        });
        this.configuredFacetsView.boundList.selectedItemCls = 'dummy';
        this.form = {
            layout: 'vbox',
            items: [
                {
                    xtype: 'combobox',
                    queryMode: 'local',
                    forceSelection: true,
                    hideLabel: true,
                    emptyText: 'Add Facet',
                    enableKeyEvents: true,
                    name: 'attributeId',
                    width: 250,
                    store: availableFacetsStore,
                    typeAhead: true,
                    displayField: "name",
                    valueField: "id",
                    listeners: {
                        select: function (me, selectedRecords) {
                            var theRecord = selectedRecords && selectedRecords[0];
                            availableFacetsStore.remove(theRecord);
                            var newFacet = Ext.create('Taco.model.Facet', {
                                source: theRecord.raw,
                                facetType: theRecord.raw.facetType,
                                order: configuredFacetsStore.count()
                            });
                            configuredFacetsStore.add(newFacet);
                            me.reset();
                        }
                    }
                },
                this.configuredFacetsView
            ]
        };
        this.callParent(arguments);
    }
});