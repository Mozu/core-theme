/**
 * @class Taco.view.site.page.settings.Facets
 */
Ext.define('Taco.view.site.page.settings.Facets', {
    extend: 'Taco.view.site.page.PageSettingsPanel',
    requires: ['Taco.core.ux.form.field.MultiSelect'],
    title: "Facets",
    initComponent: function () {
        var me = this;
        var attributesStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.Attributes');
        this.mon(attributesStore, 'load', function () {
            attributesStore.filter("valueType", "Predefined");
            attributesStore.insert(0, Ext.create('Taco.model.Attribute', {
                id: 'price',
                name: 'Price',
                valueType: 'Predefined'
            }));
        });
        attributesStore.load();
        var facetsStore = this.record.getFacets();
        this.selectedFacetsView = Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'facets',
            width: 250,
            store: facetsStore,
            listConfig: {
                itemTpl: new Ext.XTemplate(
                '<span class="x-boundlist-item-drag">Drag </span>',
                '<span class="x-boundlist-item-content">{name}</span>',
                '<tpl if="facetType == \'RangeQuery\'">',
                '<span class="x-boundlist-item-settings">Settings </span>',
                '</tpl>',
                '<tpl if="!validity">',
                '<span class="x-boundlist-item-problem">Problem </span>',
                '</tpl>',
                '<tpl if="this.isThisCategory(categoryId)">',
                '<span class="x-boundlist-item-hide">Hide </span>',
                '<tpl else>',
                '<span class="x-boundlist-item-close">Close </span>',
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
        this.selectedFacetsView.boundList.selectedItemCls = 'dummy';
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
                    store: attributesStore,
                    typeAhead: true,
                    displayField: "name",
                    valueField: "id",
                    listeners: {
                        select: function (me, selectedRecords) {
                            var theRecord = selectedRecords && selectedRecords[0];
                            facetsStore.add(theRecord);
                            me.reset();
                        }
                    }
                },
                this.selectedFacetsView
            ]
        };
        this.callParent(arguments);
    }
});