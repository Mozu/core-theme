/**
 * @class  Taco.view.searchTuningRule.Context
 * @author Travis Johnson
 * @description SearchTuningRule Context Form
 */
Ext.define('Taco.view.searchTuningRule.form.Context', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-searchTuningRule-context',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.view.searchTuningRule.grid.Category',
        'Taco.view.searchTuningRule.grid.Keyword'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Context',
    config: {
        isCreateMode: false
    },
    categoryCode: null,
    isCreate: false,

    initComponent: function() {
        var me = this;
        Ext.tip.QuickTipManager.init();

        this.keywordGrid = Ext.create('Taco.view.searchTuningRule.grid.Keyword', {
            name: 'keywords',
            record: this.record,
            width: '50%',
            margin: {
                right: 20
            }
        });

        var catStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Categories',
            createOnly: true,
            id: 'cat-' + this.id,
            autoLoad: true,
            clearFilters: false,
            remoteFilter: false,
            filters: function (record) {
                //return Ext.Array.indexOf((me.get('categories') || []), record.getId()) > -1;
            }
        });

        catStore.clearFilter(true);

        catStore.on({
            load: function (store) {
                var catRecordToAddWhenNew;

                store.filterBy(function (record) {
                    var isRealTime = record.get('categoryType') === 'DynamicRealTime';
                    return !isRealTime;
                });

                if (me.isCreate && me.categoryCode) {
                    catRecordToAddWhenNew = catStore.findRecord('categoryCode', me.categoryCode);
                    if (catRecordToAddWhenNew) {
                        me.categoryGrid.fireEvent('recordadded', catRecordToAddWhenNew);
                    }
                }
            },
            single: true,
            scope: this
        });

        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        this.categoryList = Ext.widget({
            xtype: 'combobox',
            name: 'categoryFilters',
            flex: 1,
            emptyText: 'Insert Category Names or Select Using the Add Button',
            margin: 0,
            store: catStore,
            getStore: function () {
                return catStore;
            },
            queryMode: 'local',
            lastQuery: '',
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            displayField: 'nameAndCode',
            valueField: 'categoryCode',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            },
            listeners: {
                select: function (cmp, record) {
                    me.categoryGrid.fireEvent('recordadded', record);
                    cmp.setValue('');
                },
                scope: this
            }
        });

        this.categoryGrid = Ext.create('Taco.view.searchTuningRule.grid.Category', {
            name: 'categoryFilters',
            record: this.record,
            width: '100%',
            catStore: catStore
        });

        this.categoriesBox = Ext.create('Ext.form.FieldContainer', {
            layout: 'vbox',
            width: '50%',
            style: {
                verticalAlign: 'top'
            },
            fieldLabel: 'Categories',
            allowBlank: true,
            items: [
                {
                    xtype: 'fieldcontainer',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    width: '100%',
                    items: [
                        this.categoryList,
                        {
                            xtype: 'button',
                            scale: 'medium',
                            ui: 'action',
                            text: 'Add',
                            margin: '0 0 0 10',
                            style: {
                                verticalAlign: 'bottom'
                            },
                            handler: function () {
                                me.launchCategoryModal(me.categoryList);
                            },
                            scope: this
                        }
                    ]
                },
                this.categoryGrid
            ]
        });

        this.items = [
            {
                xtype: 'fieldcontainer',
                layout: {
                    align: 'stretch',
                    type: 'hbox'
                },
                items: [
                    this.keywordGrid,
                    this.categoriesBox
                ]
            }
        ];

        me.mon(me, 'beforesave', me.beforeSave);

        this.callParent(arguments);
    },


    beforeSave: function() {
        var keywordValues = this.keywordGrid.getValues(),
            catValues = this.getCategoryValues();
        if (keywordValues.length === 0 && catValues.length === 0) {
            Taco.app.fireEvent('setmessage', 'At least one keyword or one category is required.', 'error');
            return false;
        }
        this.record.set('keywords', keywordValues);
        this.record.set('filters', catValues);
        return true;
    },

    getCategoryValues: function() {
        return Ext.Array.map(this.categoryGrid.getValues(), function(cat){
            return {key:'categoryCode',value: cat.get('categoryCode')};
        });
    },
    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchCategoryModal: function (list) {
        var me = this,
            treeStore = Taco.core.data.StoreManager.getCategoryTreeByCatalog();


        treeStore.on({
            load: function () {
                if (!me.showDynamicRealTimeCategories) {
                    treeStore.filterBy(function (record) {
                        var isRealTime = record.get('categoryType') === 'DynamicRealTime';
                        return (!isRealTime);
                    });
                }
            },
            scope: this
        });


        this.modal = Ext.create('Taco.view.category.Modal', {
            store: treeStore
        });

        this.modal.on({
            savesuccess: function (modal, records) {
                me.categoryGrid.fireEvent('recordadded', records);
            },
            aftercancelclose: function () {
                me.reloadStore(list);
            },
            scope: this
        });
    },

    reloadStore: function (list) {
        var store = list.getStore(),
            proxy = store.getProxy();
        if (proxy.extraParams) {
            proxy.extraParams = {};
        }
        store.load();
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});