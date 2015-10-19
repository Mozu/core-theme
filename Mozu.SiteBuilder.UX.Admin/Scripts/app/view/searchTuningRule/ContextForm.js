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
        'Taco.core.util.Validation'//,
        //'Taco.shared.view.field.PickerField' //,
        //'Taco.shared.view.field.CategoryPickerField',
        //'Taco.view.searchTuningRule.widget.CategorySelectorGrid'
    ],
    ui: 'subform',
    cls: 'taco-subform-noborder taco-subform-nopadding taco-subform-nohr',
    margin: '0 0 39 0',

    title: 'Contexts',
    config: {
        isCreateMode: false
    },

    initComponent: function() {
        var me = this;
        Ext.tip.QuickTipManager.init();

        this.keywordGrid = Ext.create('Taco.view.searchTuningRule.KeywordGrid', {
            name: 'keywords',
            record: this.record,
            width: '50%',
            margin: {
                right: 20
            }
        });

        var catStore = Taco.core.data.StoreManager.getOrCreate(
            {
                type: 'Taco.store.Categories',
                createOnly: true,
                id: "cat-" + this.id,
                autoLoad: true,
                clearFilters: false,
                remoteFilter: false,
                filters: function (record) {
                    //return Ext.Array.indexOf((me.get('categories') || []), record.getId()) > -1;
                }
            });
        catStore.clearFilter(true);
        //catStore.load();

        catStore.on({
            load: function (store) {

                store.filterBy(function (record) {
                    var isRealTime = record.get("categoryType") === "DynamicRealTime";
                    return !isRealTime;
                });

                //this.categoryList.resetOriginalValue();
            },
            single: true,
            scope: this
        });


        //var categoryStore = Taco.core.data.StoreManager.getOrCreate({
        //    type: 'Taco.store.Categories',
        //    clearFilters: true,
        //    clearSort: true,
        //    autoLoad: true
        //});
        //categoryStore.load();

        //var categoryStore = Taco.core.data.StoreManager.getOrCreate(
        //    {
        //        type: 'Taco.store.Categories',
        //        createOnly: true,
        //        id: "catStore",
        //        autoLoad: true,
        //        clearFilters: false,
        //        remoteFilter: false //,
        //        //filters: function (record) {
        //        //    return Ext.Array.indexOf((record.get('categories') || []), record.getId()) > -1;
        //        //}
        //    });

        //var fieldRecord = Ext.create('Taco.model.FilterField', {
        //    id: "categoryCode",
        //    field: "categoryCode",
        //    text: "Category Code",
        //    defaultValue: "",
        //    dataType: "string",
        //    supportedOperators: ["eq", "ne", "in"],
        //    editorCfg: {
        //        xtype: "taco-pickerfield",
        //        storeType: 'Taco.store.Categories',
        //        store: catStore,
        //        //tells the valueField that we need a multiSelectorGrid to display the selected value since the id we save isn't particularly useful information to users
        //        isPickerField: true
        //    },
        //
        //    allowBlank: true
        //});
        //
        //this.categorySelectorGrid = Ext.create('Taco.view.searchTuningRule.widget.CategorySelectorGrid', {
        //    store: catStore,
        //    stateful: false,
        //    //stateId: 'statefulCouponSetSelector',
        //    fieldRecord: fieldRecord,
        //    listeners: {
        //        change: function () {
        //            me.parentForm.getForm().checkValidity();
        //        },
        //        scope:me
        //    }
        //});

        //this.couponSetStore = Taco.core.data.StoreManager.getOrCreate(
        //    {
        //        type: 'Taco.store.CouponSets',
        //        createOnly: true,
        //        id: "couponSet-1",
        //        autoLoad: true,
        //        clearFilters: false,
        //        remoteFilter: false,
        //        remoteSort:false,
        //        data: [], //this.get("couponSets"),
        //        proxy: {
        //            type: 'memory',
        //            reader: {
        //                type: 'json',
        //                root: 'items'
        //            }
        //        }
        //    });
        //
        //var fieldRecord = Ext.create('Taco.model.FilterField', {
        //    id: "productcode",
        //    field: "ProductCode",
        //    text: "Product code",
        //    defaultValue: "",
        //    dataType: "string",
        //    supportedOperators: ["eq", "ne", "in"],
        //    editorCfg: {
        //        xtype: "taco-couponsetpickerfield",
        //
        //        //tells the valueField that we need a multiSelectorGrid to display the selected value since the id we save isn't particularly useful information to users
        //        isPickerField: true
        //    },
        //
        //    allowBlank: true
        //});
        //
        //this.couponSetBox = Ext.create('Taco.view.discount.widget.CouponSetSelector', {
        //    store:this.couponSetStore,
        //    stateful: true,
        //    stateId: 'statefulCouponSetSelector',
        //    fieldRecord: fieldRecord,
        //    hidden: !this.couponSetStore.count(),
        //    listeners: {
        //        change: function () {
        //            me.parentForm.getForm().checkValidity();
        //        },
        //        scope:me
        //    }
        //});

        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        this.categoryList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'categoryFilters',//'categories',
            width: 520,
            margin: 0,
            allowBlank:true,
            store: catStore,
            getStore: function () {
                return catStore;
            },
            queryMode: 'local',
            lastQuery: "",
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
                change: function (field, newValue, prevValue) {
                    var prevCount = (Array.isArray(prevValue)) ? prevValue.length : prevValue.split(',').length;

                    if (newValue.split(',').length >= 2 && prevCount < 2) {
                        console.log('split');

                        //this.includedCategoriesOperatorCheckbox.show();
                    } else if (prevCount >= 2 && newValue.split(',').length < 2) {
                        console.log('prvCount');

                        //this.hideAndResetField(this.includedCategoriesOperatorCheckbox);
                    }
                },
                scope: this
            }
        });

        this.categoriesBox = Ext.create('Ext.form.FieldContainer', {
            layout: 'hbox',
            width: '50%',
            style: {
                verticalAlign: 'top'
            },
            fieldLabel: "Categories",
            allowBlank: true,
            items: [
                this.categoryList,
                {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Add',
                    margin: '0 0 0 10',
                    width: 70,
                    style: {
                        verticalAlign: 'bottom'
                    },
                    handler: function () {
                        me.launchCategoryModal(me.categoryList);
                    },
                    scope: this
                }
            ]
        });

        this.items = [
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
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
      console.log('getValues context');
        //this.categoryList.getValues()??
        var keywordData = this.keywordGrid.getValues(),
            catData = this.getCategoryValues();
            //data = this.getForm().getValues();
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
                        var isRealTime = record.get("categoryType") === "DynamicRealTime";
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
            savesuccess: function (modal, values) {
                list.addValue(values);
                me.reloadStore(list);
                me.parentForm.getForm().checkValidity();
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