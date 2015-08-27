/**
 * @class Taco.shared.view.field.Discount
 */

/**
 * @class Taco.core.ux.form.field.Product
 */

Ext.define('Taco.shared.view.field.Discount', {
    extend: 'Ext.ux.form.field.BoxSelect',
    requires: [
        'Taco.store.Discounts'
    ],

    forceSelection: true,
    minChars: 3,
    triggerOnClick: false,
    typeAhead: true,

    displayField: 'name',
    fieldLabel: 'Select Discount',
    queryMode: 'remote',
    valueField: 'id',
    pageSize: 25,
    initComponent: function() {
        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.Discounts');
        this.callParent(arguments);
    },
    listConfig: {
        loadingText: 'Searching...',
        emptyText: 'No matching discounts found.',
        // Custom rendering template for each item
        // this is an override that hides the paging toolbar when the list only contains a single page of results;
        refresh: function() {
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
