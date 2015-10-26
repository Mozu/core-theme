/**
 * @class  Taco.view.searchTuningRule.ContextForm
 * @author Travis Johnson
 * @description SearchTuningRule Context Form
 */
Ext.define('Taco.view.searchTuningRule.ContextForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-searchTuningRule-context',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.view.searchTuningRule.grid.CategoryGrid'
        //'Taco.shared.view.field.PickerField' //,
        //'Taco.shared.view.field.CategoryPickerField',
        //'Taco.view.searchTuningRule.widget.CategorySelectorGrid'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Context',
    config: {
        isCreateMode: false
    },

    initComponent: function() {
        var me = this;
        Ext.tip.QuickTipManager.init();

        console.log(this);

        this.keywordGrid = Ext.create('Taco.view.searchTuningRule.KeywordGrid', {
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

                store.filterBy(function (record) {
                    var isRealTime = record.get('categoryType') === 'DynamicRealTime';
                    return !isRealTime;
                });

            },
            single: true,
            scope: this
        });

        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        this.categoryList = Ext.widget({
            xtype: 'combobox',
            name: 'categoryFilters',//'categories',
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
                beforeselect: function (cmp, record) {
                    console.log(record)
                    me.categoryGrid.store.add(record);
                    cmp.setValue(null);
                },
                scope: this
            }
        });

        this.categoryGrid = Ext.create('Taco.view.searchTuningRule.grid.CategoryGrid', {
            name: 'keywords',
            record: this.record,
            width: '100%'
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

    getValues: function() {
        var keywordData = this.keywordGrid.getValues(),
            catData = this.getCategoryValues();
        return Ext.Object.merge(keywordData, catData);
    },

    getCategoryValues: function() {
        var result = Ext.Array.map(this.categoryList.getValueRecords(), function(cat){
            return {key:'categoryCode',value:cat.get('categoryCode')};
        });
        return {filters: result};
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
                me.categoryGrid.store.add(records[0]);
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