/**
 * @class Taco.view.website.settings.Facets
 */
 Ext.define('Taco.view.website.settings.facets.Facets', {
     extend: 'Taco.core.ux.form.Form',
     requires: ['Taco.core.ux.form.field.MultiSelect', 'Taco.view.website.settings.facets.FacetRangeQueryForm'],

     title: "Facets",
     ui: "subform",
     layout: 'vbox',
     cls: Taco.baseCSSPrefix + 'sidebar-modal-facets',

     cancelChanges: function() {
         for (var f in this.rangeQueryForms) {
             f.reset();
         }
         this.reset();
         this.hide();
     },
     
     persistFormValues: function () {
         var me = this;
         Ext.iterate(me.rangeQueryForms, function (sourceId, form) {
             form.persistFormValues();
         });

         this.callParent(arguments);

     },
     


     createRangeQueryForm: function(record, isShowing) {
         var me = this,
             rId = record.get('sourceId'),
             rangeQueryForm = me.rangeQueryForms[rId];

         rangeQueryForm = me.rangeQueryForms[rId] = Ext.create('Taco.view.website.settings.facets.FacetRangeQueryForm', {
             record: record,
             renderTo: Ext.dom.Query.selectNode('[data-for-sourceid="' + rId + '"]'),
             hidden: !isShowing,
             listeners: {
                facetchange: {
                    scope: this,
                    fn: function () {
                        this.doComponentLayout();
                    }
                }
             }
         });
         me.updateLayout();
         return rangeQueryForm;
     },

     preserveRangeQueryForm: function(form) {
         var wasHidden = form.isHidden(),
             record = form.record;
         form.destroy();
         this.createRangeQueryForm(record, !wasHidden);
     },

     initComponent: function () {

         var me = this;

         window.facetConfig = this;
         function setUp() {
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
                             categoryId: thisCategoryId,
                             isvalid: true
                         }));
                         box.applyEmptyText();
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
                 remove: function (s, record) {
                     availableFacetsStore.add(record.raw);
                 }
             });

             var times = {};

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
                             // '<span class="x-boundlist-item-action x-boundlist-item-hide">Hide </span>',
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
                     '<div class="x-facet-ranges" data-for-sourceid="{sourceId}"></div>',
                     '<tpl if="!isvalid">',
                         '<p class="x-facet-validityreason">{validityCode}</p>',
                     '</tpl>'
                     ),
                     listeners: {
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
                                     // me.fireEvent('savablestatechange', me.form, me.facetSetStore.isDirty());
                                     me.updateLayout();
                                     break;
                                 case 'settings':
                                     rId = record.get('sourceId');
                                     var rangeQueryForm = me.rangeQueryForms[rId];
                                     if (!rangeQueryForm) rangeQueryForm = me.createRangeQueryForm(record);
                                     if (rangeQueryForm.isHidden()) {
                                         rangeQueryForm.show();
                                     } else {
                                         rangeQueryForm.hide();
                                     }
                                     me.updateLayout();
                                     break;
                             }
                         },
                         itemupdate: function (record) {
                             var rangeQueryForm = me.rangeQueryForms[record.get('sourceId')];
                             if (rangeQueryForm) {
                                 me.preserveRangeQueryForm(rangeQueryForm);
                             }
                         }
                     }
                 },
                 listeners: {
                     drop: function () {
                         for (var rId in me.rangeQueryForms) {
                             me.preserveRangeQueryForm(me.rangeQueryForms[rId]);
                         }
                         // me.fireEvent('savablestatechange', me, me.facetSetStore.isDirty());
                     }
                 }
             });
             me.configuredFacetsView.boundList.selectedItemCls = me.inheritedFacetsView.boundList.selectedItemCls = me.inheritedFacetsView.boundList.overItemCls = 'dummy';
             me.add([me.availableFacetsDropdown, me.inheritedFacetsView, me.configuredFacetsView]);
         }

         this.facetSetStore = this.record.getFacetSets();

         window.facets = this;

         this.rangeQueryForms = {};

         //this.form = {
         //    layout: 'vbox',
         //    autoScroll: true,
         //    beforeSave: function () {
         //        Ext.iterate(me.rangeQueryForms, function (sourceId, form) {
         //            form.updateForm();
         //        });
         //    }
         //};

         this.callParent(arguments);

         if (this.facetSetStore.isLoading()) {
             this.facetSetStore.on('load', setUp);
         } else {
             setUp();
         }

       //  this.form.on('heightchange', this.form.updateLayout, this.form);

     }
 });