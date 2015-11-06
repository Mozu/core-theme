/**
 * @class  Taco.view.productRanking.Context
 * @author gm, bc
 * @description ProductRanking Context Form
 */
Ext.define('Taco.view.productRanking.form.Context', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-productRanking-context',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.view.productRanking.grid.Category',
        'Taco.view.productRanking.grid.Keyword'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    config: {
        isCreateMode: false
    },
    categoryCode: null,
    isCreate: false,

    initComponent: function() {
        var me = this;
        Ext.tip.QuickTipManager.init();

        me.header =
            Taco.core.ux.TooltipLabel.wrapConfig('productRanking.form.context.header', me, {
                fieldLabel: "Context",
                labelCls: 'x-header-text x-panel-header-text x-panel-header-text-subform',
                margin: '20 0 35 0'
            });
        me.header.xtype = 'fieldcontainer';

        var catStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Categories',
            createOnly: true,
            id: 'cat-' + this.id,
            autoLoad: true,
            clearFilters: false,
            remoteFilter: false,
            pageSize: 5,
            filters: function (record) {
                //return Ext.Array.indexOf((me.get('categories') || []), record.getId()) > -1;
            }
        });

        catStore.clearFilter(true);

        catStore.on({
            load: function (store) {
                var catRecordToAddWhenNew;

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
            emptyText: 'Search for Categories or click Add Button',
            margin: '0 10 0 0',
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

        this.categoryGrid = Ext.create('Taco.view.productRanking.grid.Category', {
            name: 'categoryFilters',
            record: this.record,
            width: '100%',
            catStore: catStore,
            filterProperty: 'categoryCode'
        });

        this.categoriesBox = Ext.create('Ext.form.FieldContainer', {
            layout: 'vbox',
            width: '50%',
            style: {
                verticalAlign: 'top'
            },
            margin: {
                left: 10
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
                            margin: '0 1 0 0',
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

        this.keywordGrid = Ext.create('Taco.view.productRanking.grid.Keyword', {
            name: 'keywords',
            record: this.record,
            width: '100%',
            useWhiteContainer:true,
            margin: {
                right: 10
            }

        });

        this.keywordBox = Ext.create('Ext.form.FieldContainer', {
            layout: 'vbox',
            width: '50%',
            style: {
                verticalAlign: 'top'
            },
            fieldLabel: 'Search Keywords',
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
                        this.keywordGrid
                    ]
                }
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
                    this.keywordBox,
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