/**
 * @class Taco.view.priceList.Grid
*/
Ext.define('Taco.view.priceList.widget.EntriesGrid', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.taco-priceList-entries-grid',
    requires: [
        'Taco.model.PriceListEntry',
        'Taco.store.PriceListEntries',
        'Ext.Date',
        'Ext.form.Panel',
        'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.grid.MenuColumn',
        'Taco.view.priceList.entry.AdvancedEntrySearch',
        'Taco.view.priceList.modal.PriceEntryEditor'
    ],

    mixins: {

    },

    launchEditorOnClick: true,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.PriceListEntry',

    controllerName: 'PriceListEntries',
    priceListCode: null,
    priceListRecord: null,

    enableNavHeader: true,
    hideNavMenu: true,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: false,

    enableSearch: false,
    enablePaging: true,
    enableRowEditing: false,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: 'Add Price Entry',

    showActionsColumn: true,

    enableEditAction: true,
    //enableDisableAction: true,
    enableDeleteAction: true,

    hideSearchToolbar: false,

    title: 'Price Entries',

    store: null,

    autoScroll: true,

    enableQuickFilters: false,

    hideSubnavLinks: true,

    minHeight: 350,

    enableBulkActions: false,

    pageSize: 25,

    advancedSearchConfig : {
        form: null
    },

    onCreate: Ext.emptyFn,
    isDisabled: false,

    stateful: true,
    stateId: 'statefulPriceListEntryGrid',

    listeners: {
        afterrender: function() {
            var me = this;

            if (me.isDisabled && me.createButton) {
                me.createButton.disable();
            }
        }
    },

    statics: {

    },

    initComponent: function () {
        var me = this,
            model;

        me.isDisabled = (!this.priceListCode);

        this.columns = this.getColumnConfig();

        me.mon(me, 'priceList-duplicateEntry', me.doDuplicate);

        if (this.showActionsColumn) {
            var actionColumn = this.getActionColumn();
            if (actionColumn) {
                this.columns.push(actionColumn);
            }
        }

        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);

        me.store = Ext.create('Taco.store.PriceListEntries', {priceListCode: this.priceListCode});

        if (this.priceListCode) {
            me.store.load({
                params: {
                    priceListCode: this.priceListCode
                },
                failure: function () {
                    Taco.app.fireEvent('setmessage', "Error loading Price List Entries", 'error');
                    this.setLoading(false, this.body);
                },
                scope: this
            });
        }

        me.advancedSearchConfig.form = Ext.create('Taco.view.priceList.entry.AdvancedEntrySearch', {});

        model = Ext.ModelManager.getModel(me.modelName);
        me.createButtonEnabled = model.allowCreate();
        me.allowUpdate = model.allowUpdate();

        me.callParent(arguments);

    },

    reloadGrid: function() {
        console.log('reloaded grid');

        this.store.reload();
    },

    getColumnConfig: function () {
        return [
            {
                xtype: 'gridcolumn',
                dataIndex: 'productCode',
                stateId: 'productCode',
                text: 'Product Code',
                hideable: true,
                flex: 1,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'productName',
                stateId: 'productName',
                text: 'Product Name',
                hideable: true,
                flex: 2,                
                sortable: false
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'optionSummary',
                stateId: 'optionSummary',
                text: 'Option Summary',
                hideable: true,
                flex: 2,
                sortable: false
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'currencyCode',
                stateId: 'currencyCode',
                text: 'Currency',
                flex: 1,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'priceEntries',
                stateId: 'listPrice',
                text: 'Price',
                flex: 1,
                sortable: false,
                renderer: function(entries) {
                    if (Ext.isArray(entries)) {
                        if (entries[0].listPriceMode === 'UseCatalog') {
                            return "Default";
                        }
                        return (entries[0].listPrice || entries[0].listPrice === 0) ? Taco.app.context.getCurrent().formatCurrency(entries[0].listPrice) : '';
                    }
                    return 'Default';
                }
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'priceEntries',
                stateId: 'salePrice',
                text: 'Sale Price',
                flex: 1,
                sortable: false,
                renderer: function(entries) {
                    if (Ext.isArray(entries)) {
                        if (entries[0].salePriceMode === 'UseCatalog') {
                            return "Default";
                        }
                        return (entries[0].salePrice || entries[0].salePrice === 0) ? Taco.app.context.getCurrent().formatCurrency(entries[0].salePrice) : '';
                    }
                    return 'Default';
                }
            }, {
                xtype: 'datecolumn',
                dataIndex: 'startDate',
                stateId: 'startDate',
                format: 'n/j/Y g:i a',
                flex:2,
                text: 'Start Date',
                hidden: false,
                sortable: true
            }, {
                xtype: 'datecolumn',
                dataIndex: 'endDate',
                stateId: 'endDate',
                format: 'n/j/Y g:i a',
                flex:2,
                text: 'End Date',
                hidden: false,
                sortable: true
            }, {
                xtype: 'datecolumn',
                dataIndex: 'createDate',
                stateId: 'createDate',
                format: 'n/j/Y g:i a',
                flex:2,
                text: 'Created Date',
                hidden: true,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'createByUser',
                stateId: 'createByUser',
                text: 'Created By',
                flex:1,
                hidden: true,
                sortable: false
            }, {
                xtype: 'datecolumn',
                dataIndex: 'lastModifiedDate',
                stateId: 'lastModifiedDate',
                format: 'n/j/Y g:i a',
                flex:2,
                text: 'Last Modified Date',
                hidden: true,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'lastModifiedByUser',
                stateId: 'lastModifiedByUser',
                text: 'Last Modified By',
                flex:1,
                hidden: true,
                sortable: false
            }
        ];
    },

    // list of actions to put in action column and context menu;
    getActionItems: function () {
        var me = this,
            result = [];
        result.push(
            {
                itemId: 'live',
                text: 'View Live',
                hideOnClick: false,
                menu: {
                    plain: true,
                    shadow: false,
                    cls: Taco.baseCSSPrefix + 'grid-row-menu',
                    items: []
                }
            }
        );

        if (Taco.app.context.getMasterCatalog().productPublishingMode === 'Pending'){
            result.push(
                {
                    itemId: 'preview',
                    text: 'View Staged',
                    hideOnClick: false,
                    menu: {
                        plain: true,
                        shadow: false,
                        cls: Taco.baseCSSPrefix + 'grid-row-menu',
                        items: []
                    }
                }
            );
        }

        result.push(
            {
                text: 'Edit',
                requiredBehaviors: {
                    model: 'Taco.model.PriceListEntry',
                    behavior: 'read'
                },
                menuColumnHandler: me.doEdit,
                scope:me
            }
        );
        result.push(
            {
                text: 'Delete',
                itemId: "deleteMenuItem",
                // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                menuColumnHandler: "deleteMenuColumnHandler",
                requiredBehaviors: {
                    model: 'Taco.model.PriceListEntry',
                    behavior: 'destroy'
                },
                scope: me
            }
        );
        result.push(
            {
                text: 'Duplicate',
                itemId: 'duplicateMenuItem',
                menuColumnHandler: function(item, eventData) {
                    me.fireEvent('priceList-duplicateEntry', eventData.record);
                },
                scope: me
            }
        )
        return result;
    },

    onActionMenuShow: function (menu, eventData) {
        var previewAction = menu.items.get('preview'),
            liveAction = menu.items.get('live'),
            productCode = eventData.record.get('productCode'),
            priceListCode = eventData.record.get('priceListCode'),
            currencyCode = eventData.record.get('currencyCode'),
            startDate = eventData.record.get('startDate'),
            endDate = eventData.record.get('endDate');

        if (previewAction) {
            previewAction.menu.removeAll();
        }
        liveAction.menu.removeAll();

        eventData.grid.getProductDetail(priceListCode, productCode, currencyCode, startDate, endDate, menu, eventData.header.menuItemDefaults);
    },

    getProductDetail: function (priceListCode, productCode, currencyCode, startDate, endDate, menu, menuDefaults) {
        var me = this,
            priceListModel = Ext.ModelManager.getModel('Taco.model.PriceListEntry');

        me.setLoading({
            msg: "Loading"
        }, me.body);

        priceListModel.load('single', {
            params: {
                priceListCode: priceListCode,
                productCode: productCode,
                currencyCode: currencyCode,
                startDate: Ext.Date.format(startDate, 'c')
            },
            failure: function () {
                Taco.app.fireEvent('setmessage', "Error loading Price List Entry", 'error');
                this.setLoading(false, this.body);
            },
            success: function (record) {
                var productCode;
                this.setLoading(false, this.body);
                productCode = !record.get('isVariation') ? record.get('productCode') : record.get('baseProductCode');
                this.addValidSites(productCode, startDate, endDate, menu, menuDefaults, record.get('productInCatalogInfo'));
            },
            scope: this
        });
    },

    addValidSites: function (productCode, startDate, endDate, menu, menuItemDefaults, productInCatalogInfo) {
        var me = this,
            previewAction = menu.items.get('preview'),
            liveAction = menu.items.get('live'),
            mc = Taco.app.context.getMasterCatalog(),
            entryStartDt = (startDate) ? new Date(startDate) : null,
            entryEndDt = (endDate) ? new Date(endDate) : null,
            hasExpired = (entryEndDt && entryEndDt < new Date()),
            setMenuVisibility = function () {
                if (previewAction && previewAction.menu.items.items.length === 0) {
                    previewAction.setVisible(false);
                }
                if (liveAction && liveAction.menu.items.items.length === 0) {
                    liveAction.setVisible(false);
                }
            },
            showPending = function (masterCat, site, priceListRec, hasExpired) {
                if (hasExpired || masterCat.productPublishingMode !== 'Pending' || !priceListRec.get('resolvable')) {
                    return false;
                }
                return (priceListRec.get('validForAllSites')
                        || Ext.Array.indexOf(priceListRec.get('validSites'), site.id) !== -1);
            },
            findProductInCatalogBySite = function(site, productInCatalogs) {
                var productInCat = Ext.Array.findBy(productInCatalogs, function(cat) {
                    return cat.catalogId === site.catalogId;
                });
                return productInCat;
            },
            getCatalogScheduledDate = function (productInCatalog, fldName) {
                return (productInCatalog[fldName]) ? new Date(productInCatalog[fldName]) : null;
            },
            isCatalogCurrentlyActive = function (catStartDt, catEndDt) {
                return ( (!catStartDt || catStartDt < new Date())
                    && (!catEndDt || catEndDt > new Date()) );
            },
            isOutsideRange = function(startDt, endDt, catStartDt, catEndDt) {
                if ((startDt && catEndDt) && (startDt > catEndDt)) {
                    return true;
                }
                return ((endDt && catStartDt) && (endDt < catStartDt));
            },
            calculatePreviewDate = function(startDt, catStartDt) {
                if (isCatalogCurrentlyActive(catStartDt)) {
                    return startDt;
                }
                if (!startDt && catStartDt) {
                    return catStartDt;
                }
                if (startDt && catStartDt && startDt < catStartDt) {
                    return catStartDt;
                }
                return startDt;
            };

        if (!productInCatalogInfo || productInCatalogInfo.length === 0) {
            setMenuVisibility();
            return;
        }
        Ext.Array.each(mc.sites, function (site) {
            var prodInCat,
                catalogStartDt,
                catalogEndDt,
                previewDt;
            if (!site.isMozuRendered) {
                return false;
            }
            prodInCat = findProductInCatalogBySite(site, productInCatalogInfo);
            if (!prodInCat || !prodInCat.isActive) {
                return false;
            }
            catalogStartDt = getCatalogScheduledDate(prodInCat, 'activeStartDate');
            catalogEndDt = getCatalogScheduledDate(prodInCat, 'activeEndDate');
            if (isCatalogCurrentlyActive(catalogStartDt, catalogEndDt)) {
                liveAction.menu.add(Ext.applyIf({
                    text: site.name,
                    handler: function () {
                        window.open('/_gosite/' + site.id + '?environment=live&redir=' + encodeURIComponent('/p/' + productCode));
                    }
                }, menuItemDefaults));
            }

            if (previewAction && showPending(mc, site, me.priceListRecord, hasExpired)
                && !isOutsideRange(entryStartDt,entryEndDt,catalogStartDt,catalogEndDt)) {

                previewDt = calculatePreviewDate(entryStartDt, catalogStartDt);
                previewAction.menu.add(Ext.applyIf({
                    text: site.name,
                    handler: function () {
                        var mzNow = '&mz_now=';
                        if (previewDt && previewDt > new Date()) {
                            previewDt.setMinutes(previewDt.getMinutes() + 1);
                            mzNow += previewDt.toISOString();
                        }

                        window.open('/_gosite/' + site.id
                            + '?environment=preview&redir='
                            + encodeURIComponent('/p/'
                                + productCode
                                + '?mz_pricelist='
                                + me.priceListCode
                                + mzNow)
                        );
                    }
                }, menuItemDefaults));
            }
        });

        setMenuVisibility();
    },
    
    onAfterRecordUpdate: function(recordStore, response) {

        if (response && response.hasException) {
            this.showMessage(Ext.JSON.decode(response.exceptions[0].error.responseText).message, 'error');
        } else {
            if (recordStore) {
                recordStore.reload();
            }
        }
    },
    
    getActionColumn: function () {
        var me = this,
            actionColumn = null,
            actions = this.getActionItems();

        // as long as we have actions;
        if (actions.length) {
            actionColumn = {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                onMenuShow: me.onActionMenuShow,
                menuItems: actions
            };
        }

        return actionColumn;
    },

    launchEditor: function (record) {
        Ext.defer(function () {
            this.createPopup(record, false);
        }, 1, this);
    },

    onItemClick: function (view, record, elm, index, e) {
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.createPopup(record, false);
        }
    },

    doEdit : function (item, eventData) {
        var rec = eventData.record;
        item.scope.createPopup(rec, false);
    },

    doDuplicate: function(record) {
        var me = this;
        me.createPopup(me.doDuplicateInternal(record), true);
    },

    doDuplicateInternal: function(record) {
        record = record.copy();
        record.phantom = true;
        return record;
    },

    createPopup: function (record, isNew) {
        var me = this;
        me.editor = Ext.create('Taco.view.priceList.modal.PriceEntryEditor', {
            record: record,
            store: me.store,
            itemId: 'PriceEntryEditor',
            parentForm: this,
            isCreateMode: isNew,
            priceListCode: this.priceListCode,
            actions: (!me.allowUpdate)
                ? [{ xtype: 'button', itemId: 'secondaryAction'}]
                : [
                    {
                        xtype: 'taco.prevnext',
                        canNavigateToNext: true,
                        canNavigateToPrevious: true,
                        itemId: 'prevnextorder',
                        listeners: {
                            navigateToNext: me.navigateToNext,
                            navigateToPrevious: me.navigateToPrevious,
                            scope: me
                        },
                        record: record,
                        store: me.store
                    },
                    { xtype: 'button', itemId: 'secondaryAction'},
                    {
                        xtype: 'splitbutton',
                        itemId: 'primaryAction',
                        formBind: true,
                        menu: Ext.create('Ext.menu.Menu', {
                            items: [{
                                text: 'Save and Duplicate',
                                handler: function() {
                                    var editor = this.up('#PriceEntryEditor');
                                    editor.onSaveSuccess = function(updatedRecord) {
                                        me.fireEvent('priceList-duplicateEntry', updatedRecord);
                                        editor.onSaveSuccess = Ext.emptyFn;
                                    }
                                    editor.save();
                                }
                            }]
                        }),
                        handler: function(btn, e) {
                            this.save();
                        }
                    }
                  ],
            listeners: {
                savesuccess: function () {
                    me.store.reload();
                }
            }
        });
    },

    doCreate: function () {
        this.createPopup(null, true);
    },

    getDeletePromptMessage: function (record) {
        return record.getDeletePromptMessage();
    },
    
    //move to base class?
    getConfirmationModal: function(config) {
        Ext.create('Taco.core.ux.window.Modal', {
            scale: 'small',
            title: config.header,
            modal: true,
            closeAction: 'destroy',
            height: 200,
            primaryText: config.primaryText ? config.primaryText : 'Confirm',
            secondaryText: 'Cancel',
            primaryHandler: function() {
                config.callback();
                this.save();
            },
            items: [{
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                items: [
                    Ext.create('Ext.panel.Panel', {
                        width: '100%',
                        html: config.message
                    })
                ]
            }]
        }).show();
    },

    showMessage: function(msg, type) {
        Taco.app.fireEvent('setmessage', msg, type || 'success');
    },

    navigateTo:function (forward) {
        var index = this.getIndexOfPriceListEntry(this.editor.record.getId()),
            navToIndex = forward ? index + 1 : index - 1,
            outOfIndexMeth = forward ? 'nextPage' : 'previousPage',
            validCheck = forward ? 'canNavigateToNext' : 'canNavigateToPrevious',
            rec;

        if (!this[validCheck]())
            return;

        if (index != -1) {
            this.setLoading();
            rec = this.store.data.getAt(navToIndex);
            if (rec) {
                this.editor.record = rec;
                this.editor.loadRecord();
                this.setLoading(false);
                //Taco.core.StateManager.attemptNavigate('/priceLists/edit/' + rec.getId());
            } else {
                this.store[outOfIndexMeth]({
                    scope: this,
                    callback: function () {
                        this.setLoading(false);
                        navToIndex = forward ? 0: this.store.count() - 1;
                        rec = this.store.data.getAt(navToIndex);
                        if (rec) {
                            Taco.core.StateManager.attemptNavigate('/priceLists/edit/' + rec.getId());
                        }
                    }
                });
            }

        }
    },
    canNavigateToNext:function() {
        var index = this.getIndexOfPriceListEntry(this.editor.record.getId());
        return this.store.getTotalCount() > 1 && index < this.store.getTotalCount() ;
    },
    canNavigateToPrevious: function () {
        var index = this.getIndexOfPriceListEntry(this.editor.record.getId());
        return index != 0;
    },
    navigateToPrevious: function () {
        this.navigateTo(false);
    },
    navigateToNext: function () {
        this.navigateTo(true);
    },
    getIndexOfPriceListEntry: function(compositeKey, store) {
        store = store || this.store;
        var index = store.findBy(function(record) {
            var key = record.get('compositeKey');
            return key.currencyCode === compositeKey.currencyCode && key.priceListCode === compositeKey.priceListCode && key.productCode === compositeKey.productCode && key.startDate.toString() == compositeKey.startDate.toString();
        });
        return index;
    }

});