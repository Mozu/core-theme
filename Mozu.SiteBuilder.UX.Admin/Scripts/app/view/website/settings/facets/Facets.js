/**
 * @class Taco.view.website.settings.Facets
 */
 Ext.define('Taco.view.website.settings.facets.Facets', {
     extend: 'Taco.core.ux.form.Form',
     requires: ['Taco.core.ux.form.field.MultiSelect', 'Taco.view.website.settings.facets.FacetEditForm'],

     title: "Facets",
     ui: "subform",
     layout: 'vbox',
     cls: Taco.baseCSSPrefix + 'sidebar-modal-facets',

     cancelChanges: function() {
         for (var f in this.rangeEditForms) {
             f.reset();
         }
         this.reset();
         this.hide();
     },
     
     persistFormValues: function () {
         var me = this;
         Ext.iterate(me.rangeEditForms, function (sourceId, form) {
             form.persistFormValues();
         });

         this.callParent(arguments);

     },
     


     createRangeEditForm: function(record, isShowing) {
         var me = this,
             rId = record.get('sourceId'),
             rangeEditForm = me.rangeEditForms[rId];

         rangeEditForm = me.rangeEditForms[rId] = Ext.create('Taco.view.website.settings.facets.FacetEditForm', {
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
         return rangeEditForm;
     },

     preserveRangeEditForm: function(form) {
         var wasHidden = form.isHidden(),
             record = form.record;
         form.destroy();
         this.createRangeEditForm(record, !wasHidden);
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

             configuredFacetsStore.on({
                 remove: function (s, record) {
                     availableFacetsStore.add(record.raw);
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
                         '<tpl if="this.isRegularFacet(categoryId, isOverridden)">',
                            '<span class="x-boundlist-item-drag">Drag </span>',
                         '</tpl>',
                         '<span class="x-boundlist-item-content">',
                         '<tpl if="this.isRegularFacet(categoryId, isOverridden)">',
                             '<span class="x-boundlist-item-type">{sourceName}</span>',
                             '<span class="x-boundlist-item-name">{sourceType}</span>',
                         '<tpl elseif="isOverridden">',
                             '<span class="x-boundlist-item-type">{sourceName}</span>',
                             '<span class="x-boundlist-item-name-overridden">Overridden {sourceType}</span>',
                         '<tpl else>',
                             '<span class="x-boundlist-item-type">{sourceName}</span>',
                             '<span class="x-boundlist-item-name-inherited">Inherited {sourceType}</span>',
                         '</tpl>',
                         '<span class="x-boundlist-item-action x-boundlist-item-settings">Settings </span>',
                         '<tpl if="!isvalid">',
                             '<span class="x-boundlist-item-action x-boundlist-item-problem">Problem </span>',
                         '</tpl>',
                         '<tpl if="this.isRegularFacet(categoryId, isOverridden)">',
                            '<span class="x-boundlist-item-action x-boundlist-item-close">Close </span>',
                        '</tpl>',
                     '<div class="x-facet-ranges" data-for-sourceid="{sourceId}"></div>',
                     '<tpl if="!isvalid">',
                         '<p class="x-facet-validityreason">{validityCode}</p>',
                     '</tpl>',
                         {
                             isInheritedFacet: function (catId) {
                                 return catId !== thisCategoryId;
                             },
                             isRegularFacet: function (catId, isOverridden) {
                                 return (!this.isInheritedFacet(catId) && !isOverridden);
                             }
                         }
                     ),
                     listeners: {
                         itemclick: function (list, record, item, index, e) {
                             var rId;
                             switch (e.target.className.split('-').pop()) {
                                 case 'close':
                                     rId = record.get('sourceId');
                                     if (me.rangeEditForms[rId]) {
                                         me.rangeEditForms[rId].destroy();
                                         delete me.rangeEditForms[rId];
                                     }
                                     configuredFacetsStore.remove(record);
                                     // me.fireEvent('savablestatechange', me.form, me.facetSetStore.isDirty());
                                     me.updateLayout();
                                     break;
                                 case 'settings':
                                     rId = record.get('sourceId');
                                     var rangeEditForm = me.rangeEditForms[rId];
                                     if (!rangeEditForm) rangeEditForm = me.createRangeEditForm(record);
                                     if (rangeEditForm.isHidden()) {
                                         rangeEditForm.show();
                                     } else {
                                         rangeEditForm.hide();
                                     }
                                     me.updateLayout();
                                     break;
                             }
                         },
                         itemupdate: function (record) {
                             var rangeEditForm = me.rangeEditForms[record.get('sourceId')];
                             if (rangeEditForm) {
                                 me.preserveRangeEditForm(rangeEditForm);
                             }
                         }
                     }
                 },
                 listeners: {
                     drop: function () {
                         for (var rId in me.rangeEditForms) {
                             me.preserveRangeEditForm(me.rangeEditForms[rId]);
                         }
                         // me.fireEvent('savablestatechange', me, me.facetSetStore.isDirty());
                     }
                 }
             });
             me.configuredFacetsView.boundList.selectedItemCls = 'dummy';
             me.add([me.availableFacetsDropdown, me.configuredFacetsView]);
         }

         this.facetSetStore = this.record.getFacetSets();

         window.facets = this;

         this.rangeEditForms = {};

         //this.form = {
         //    layout: 'vbox',
         //    autoScroll: true,
         //    beforeSave: function () {
         //        Ext.iterate(me.rangeEditForms, function (sourceId, form) {
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