/**
 * @class Taco.view.site.page.settings.Facets
 */
Ext.define('Taco.view.site.page.settings.Facets', {
    extend: 'Taco.view.site.page.PageSettingsPanel',
    requires: ['Taco.core.ux.form.field.MultiSelect', 'Taco.view.site.page.FacetRangeQueryForm'],
    title: "Facets",
    layout: 'fit',
    cls: Taco.baseCSSPrefix + 'sidebar-modal-facets',
    applyChanges: function () {
        //this.setIndices();
        this.callParent(arguments);
    },


    initComponent: function () {
        var me = this;

        this.facetSetStore = this.record.getFacetSets();

        this.rangeQueryForms = {};

        this.facetSetStore.on('load', function () {
            var facetSet = me.facetSetStore.getAt(0);
            if (!facetSet) {
                Taco.app.fireEvent('setmessage', 'No facet set found!', 'error')
                return;
            }
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
            inheritedFacetsStore.add(configuredFacetsStore.queryBy(function (record, id) {
                return thisCategoryId !== record.get('categoryId');
            }).getRange());

            configuredFacetsStore.filter("categoryId", thisCategoryId);

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
                            '<span class="x-boundlist-item-drag">Drag </span>',
                            '<span class="x-boundlist-item-content">',
                                '<span class="x-boundlist-item-name">{sourceName}</span>',
                                '<span class="x-boundlist-item-type">{sourceType}</span>',
                            '</span>',
                            '<span class="x-boundlist-item-action x-boundlist-item-hide">Hide </span>',
                        '</span>'
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
                    '<div class="x-facet-ranges" data-for-sourceid="{sourceId}" ></div>',
                    '<tpl if="!isvalid">',
                        '<p class="x-facet-validityreason">{validityCode}</p>',
                    '</tpl>'
                    ),                    listeners: {
                        itemclick: function (list, record, item, index, e) {
                            var rId;
                            switch (e.target.className.split('-').pop()) {
                                case 'close':
                                    rId = record.get('sourceId');
                                    if (me.rangeQueryForms[rId]) {
                                        me.rangeQueryForms[rId].destroy();
                                        delete me.rangeQueryForms[rId];
                                    }
                                    configuredFacetsStore.remove(record);
                                    break;
                                case 'settings':
                                    rId = record.get('sourceId');
                                    var rangeQueryForm = me.rangeQueryForms[rId];
                                    if (!rangeQueryForm) {
                                        rangeQueryForm = me.rangeQueryForms[rId] = Ext.widget('taco.rangequeryform', {
                                            record: record,
                                            renderTo: Ext.dom.Query.selectNode('[data-for-sourceid="' + rId + '"]')
                                        });
                                        //me.form.forms.push(rangeQueryForm);
                                    }
                                    if (rangeQueryForm.isHidden()) { rangeQueryForm.show() } else { rangeQueryForm.hide(); }
                                    break;
                            }
                        }
                    }
                },
                listeners: {
                    afterrender: function () {
                        for (var rId in me.rangeQueryForms) {
                            var wasHidden = me.rangeQueryForms[rId].isHidden();
                            me.rangeQueryForms[rId].destroy();
                            me.rangeQueryForms[rId] = Ext.widget('taco.rangequeryform', {
                                hidden: wasHidden,
                                record: configuredFacetsStore.find('sourceId',rId),
                                renderTo: Ext.dom.Query.selectNode('[data-for-sourceid="' + rId + '"]')
                            });
                        }
                    }
                }
                
            });
            me.configuredFacetsView.boundList.selectedItemCls = me.inheritedFacetsView.boundList.selectedItemCls = me.inheritedFacetsView.boundList.overItemCls = 'dummy';
            me.form.add([me.availableFacetsDropdown, me.inheritedFacetsView, me.configuredFacetsView]);
        });
            
        this.form = {
            layout: 'vbox',            beforeSave: function () {
                Ext.iterate(me.rangeQueryForms, function (sourceId, form) {
                    form.updateForm();
                });
            }
        };

        this.callParent(arguments);
    }
});