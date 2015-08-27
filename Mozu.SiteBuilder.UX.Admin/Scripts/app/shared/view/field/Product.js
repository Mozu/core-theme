/**
 * @class Taco.core.ux.form.field.Product
 */

Ext.define('Taco.shared.view.field.Product', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: ['widget.taco.field.product', 'widget.taco-productfield'],
    requires: [
        'Taco.store.ProductComboBox'
    ],

    forceSelection: true,
    minChars: 3,
    triggerOnClick: false,
    typeAhead: true,

    displayField: 'productName',
    fieldLabel: 'Select Products',
    queryMode: 'remote',
    valueField: 'productCode',
    pageSize: 25,
    initComponent: function() {
        var storeCfg = {
            type: 'Taco.store.ProductComboBox',
            extraParams: {
                responseGroups: "Min,Price"
            }
        };
        if (this.showVariations) {
            storeCfg.extraParams.responseGroups = "Min,Price,VariationOptions";
            storeCfg.extraParams.showVariations = true;
        }
        if (this.showProductUsages) storeCfg.extraParams.showProductUsages = this.showProductUsages;
        this.store = Taco.core.data.StoreManager.getOrCreate(storeCfg);

        //for good measure if the storemanagerconfig changes, we'll do the same thing after store creation
        Ext.apply(this.store.getProxy().extraParams, storeCfg.extraParams);

        this.callParent(arguments);
    },
    listConfig: {
        loadingText: 'Searching...',
        cls: "product-picker-menu",
        emptyText: 'No matching products found.',
        // Custom rendering template for each item
        getInnerTpl: function () {
            return "<span class='product-name'>{productName}</span> <span class='product-code'>{productCode}</span>"
        },

        // this is an override that hides the paging toolbar when the list only contains a single page of results;
        refresh: function () {
            var me = this,
                toolbar = me.pagingToolbar;

            Ext.view.View.prototype.refresh.call(me);

            if (me.rendered && toolbar && toolbar.rendered && !me.preserveScrollOnRefresh) {
                me.el.appendChild(toolbar.el);
                var store = me.getStore();
                if (store.getTotalCount() <= store.pageSize) {
                    me.el.last().hide();
                }
                else {
                    me.el.last().show();
                }
            }
        }
    }
});
