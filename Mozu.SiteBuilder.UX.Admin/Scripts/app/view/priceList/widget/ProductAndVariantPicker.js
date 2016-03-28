/**
 * @class Taco.view.priceList.widget.ProductAndVariantPicker
 */
Ext.define('Taco.view.priceList.widget.ProductAndVariantPicker', {
    extend: 'Taco.shared.view.field.ProductPickerField',
    alias: 'widget.taco-product-and-variant-picker',
    requires: [
        'Taco.store.ProductPicker'
    ],

    listConfig: {
        loadingText: 'Searching...',
        cls: "product-picker-menu",
        maxHeight: '500',
        emptyText: '<div style="padding:20px; 10px; ">No matching products found.</div>',
        // Custom rendering template for each item
        getInnerTpl: function () {
            return "<span class='product-name'>{productName}</span> "
                + "<span class='product-code'>{productCode}</span> "
                + '<tpl if="values.hasConfigurableOptions && values.variationOptions.length" >'
                +   "<span class='product-code'>({[Ext.Array.map(values.variationOptions, function(opt) { return opt.attributeFQN.split('~')[1] + ': ' + opt.value;}).join(', ')]})</span>"
                + "</tpl>";
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
