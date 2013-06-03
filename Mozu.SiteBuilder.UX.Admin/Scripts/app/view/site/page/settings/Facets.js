/**
 * @class Taco.view.site.page.settings.Facets
 */
Ext.define('Taco.view.site.page.settings.Facets', {
    extend: 'Taco.view.site.page.PageSettingsPanel',
    requires: ['Taco.core.ux.form.field.MultiSelect', 'Taco.view.site.page.FacetRangeQueryForm'],
    title: "Facets",
    layout: 'fit',

    applyChanges: function () {
        this.setIndices();
        this.callParent(arguments);
        this.record.updateFacets();
    },
    
    setIndices: function() {
        this.configuredFacetsStore.each(function (facet, index) {
            facet.set('order', index);
        });
    },

    initComponent: function () {
        var me = this;

        window.facets = me;

        me.rangeQueryForms = {};

        this.record.loadFacets({
            callback: function (facetSet) {
                var configuredFacetsStore = me.configuredFacetsStore = facetSet.getConfigured(),
                    availableFacetsStore = facetSet.getAvailable(),
                    thisCategoryId = me.record.get('id');

                availableFacetsStore.sort('sourceName', 'ASC');

                me.availableFacetsDropdown = Ext.widget('combobox', {
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
                    displayField: "sourceName",
                    valueField: "sourceId",
                    listeners: {
                        select: function (box, selectedRecords) {
                            var theRecord = selectedRecords && selectedRecords[0];
                            availableFacetsStore.remove(theRecord);
                            var newFacet = Ext.create('Taco.model.Facet', Ext.apply(theRecord.raw, {
                                isvalid: true
                            }));
                            box.reset();
                            configuredFacetsStore.add(newFacet);
                        }
                    }
                });

                var inheritedFacetsStore = Ext.create('Ext.data.Store', {
                    model: 'Taco.model.Facet'
                });
                inheritedFacetsStore.add(configuredFacetsStore.queryBy(function(record, id) {
                    return thisCategoryId !== record.get('id');
                }).getRange());
                
                configuredFacetsStore.filter("categoryId",thisCategoryId);

                configuredFacetsStore.on({
                    datachanged: function () {
                    // doesn't fire by itself
                    me.form.fireEvent('savablestatechange', me.form, true);
                    },
                    remove: function (s, record) {
                        availableFacetsStore.add(record.raw);
                    }
                });

                me.inheritedFacetsView = Ext.create('Taco.core.ux.form.field.MultiSelect', {
                    name: 'inheritedFacets',
                    width: 250,
                    store: inheritedFacetsStore,
                    ignoreSelectChange: true,
                    listConfig: {
                        disableSelection: true,
                        cls: 'x-boundlist-undraggable',
                        itemTpl: new Ext.XTemplate(
                            '<span class="x-boundlist-item-contents">',
                                '<span class="x-boundlist-item-content">',
                                    '<span class="x-boundlist-item-name">{sourceName}</span>',
                                    '<span class="x-boundlist-item-type">{sourceType}</span>',
                                '</span>',
                            '</span>',
                            '<span class="x-boundlist-item-action x-boundlist-item-hide">Hide </span>'
                        )
                    }
                });

                me.configuredFacetsView = Ext.create('Taco.core.ux.form.field.MultiSelect', {
                    name: 'facets',
                    width: 250,
                    store: configuredFacetsStore,
                    maxSelections: 1,
                    ignoreSelectChange: true,
                    ddReorder: true,
                    listConfig: {
                        selModel: { mode: 'SINGLE' },
                        cls: 'x-boundlist-draggable',
                        itemTpl: new Ext.XTemplate(
                        '<span class="x-boundlist-item-contents">',
                            '<span class="x-boundlist-item-drag">Drag </span>',
                            '<span class="x-boundlist-item-content">',
                                '<span class="x-boundlist-item-name">{sourceName}</span>',
                                '<span class="x-boundlist-item-type">{sourceType}</span>',
                            '</span>',
                            '<tpl if="allowsRangeQuery">',
                                '<span class="x-boundlist-item-action x-boundlist-item-settings">Settings </span>',
                            '</tpl>',
                            '<tpl if="!isvalid">',
                                '<span class="x-boundlist-item-action x-boundlist-item-problem">Problem </span>',
                            '</tpl>',
                            '<span class="x-boundlist-item-action x-boundlist-item-close">Close </span>',
                        '</span>',
                        '<div class="x-facet-ranges"></div>',
                        '<tpl if="!isvalid">',
                            '<p class="x-facet-validityreason">{validityCode}</p>',
                        '</tpl>'
                        ),                         listeners: {
                             itemclick: function (list, record, item, index, e) {
                                switch (e.target.className.split('-').pop()) {
                                    case 'close':
                                        configuredFacetsStore.remove(record);
                                        break;
                                    case 'settings':
                                        var eItem = Ext.get(item),
                                            rId = record.get('id'),
                                            rangeQueryForm = me.rangeQueryForms[rId];
                                        if (!rangeQueryForm) rangeQueryForm = me.rangeQueryForms[rId] = Ext.widget('taco.rangequeryform', {
                                            record: record,
                                            renderTo: eItem.down('.x-facet-ranges')
                                        });
                                        if (rangeQueryForm.isHidden()) { rangeQueryForm.show() } else { rangeQueryForm.hide(); }
                                        break;
                                }
                            }
                        }
                    }
                });
                me.configuredFacetsView.boundList.selectedItemCls = 'dummy';
                me.form.add([me.availableFacetsDropdown, me.inheritedFacetsView, me.configuredFacetsView]);
            }
        });
            
        this.form = {
            layout: 'vbox',
        };

        this.callParent(arguments);
    }
});