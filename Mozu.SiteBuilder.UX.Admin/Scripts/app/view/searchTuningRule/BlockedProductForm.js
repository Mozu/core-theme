/**
 * @class  Taco.view.searchTuningRule.BlockedProductForm
 * @description Search Tuning Rule Blocked Product Form
 */
Ext.define('Taco.view.searchTuningRule.BlockedProductForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-searchTuningRule-blocked',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.view.discount.widget.CouponSetSelector',
        'Taco.shared.view.field.CouponSetPickerField'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Blocked Products',
    config: {
        isCreateMode: false
    },

    initComponent: function() {
        //var me = this;

        Ext.tip.QuickTipManager.init();

        //this.productPickerStore = Taco.core.data.StoreManager.getOrCreate(
        //    {
        //        type: 'Taco.store.ProductPicker',
        //        createOnly: true,
        //        liveMode:false,
        //        id: "prod-1",
        //        autoLoad: true,
        //        clearFilters: false,
        //        remoteFilter: false
        //        //filters: function (record) {
        //        //    return Ext.Array.indexOf((me.get('products') || []), record.getId()) > -1;
        //        //}
        //    });
        //this.productStore.clearFilter(true);
        //this.productStore.load();

        //this.productStore.on({
        //    load: function () {
        //        this.productList.resetOriginalValue();
        //    },
        //    single: true,
        //    scope: this
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
        //        data: [],
        //        proxy: {
        //            type: 'memory',
        //            reader: {
        //                type: 'json',
        //                root: 'items'
        //            }
        //        }
        //    });

        //var fieldRecord = Ext.create('Taco.model.FilterField', {
        //    id: "productcode",
        //    field: "ProductCode",
        //    text: "Product code",
        //    defaultValue: "",
        //    dataType: "string",
        //    supportedOperators: ["eq", "ne", "in"],
        //    editorCfg: {
        //        xtype: "taco-productpickerfield",
        //        liveMode: false,
        //        width:300,
        //        flex: 1,
        //        //tells the valueField that we need a multiSelectorGrid to display the selected value since the id we save isn't particularly useful information to users
        //        isPickerField: true
        //    },
        //
        //    allowBlank: true
        //});
        //
        //this.prodSelector = Ext.create('Taco.view.searchTuningRule.widget.ProductSelector', {
        //    store:this.productPickerStore,
        //    stateful: false,
        //    stateId: 'statefulProductSelector',
        //    fieldRecord: fieldRecord,
        //    //hidden: !this.couponSetStore.count(),
        //    listeners: {
        //        change: function () {
        //            me.parentForm.getForm().checkValidity();
        //        },
        //        scope:me
        //    }
        //});

        this.items = [
            {
                xtype: 'fieldcontainer',
                layout: 'vbox',
                width: '100%',
                items: [
                    {
                        xtype: 'label',
                        text: 'Placeholder'
                    }
                    //this.prodSelector
                ]
            }
        ];

        this.callParent(arguments);
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});