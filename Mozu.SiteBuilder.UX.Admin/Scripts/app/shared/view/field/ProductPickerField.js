/**
 * @class Taco.shared.view.field.ProductPickerField
 */
Ext.define('Taco.shared.view.field.ProductPickerField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.taco-productpickerfield',
    requires: [
        'Taco.store.ProductPicker'
    ],

    config: {

    },

    // this adds support to combos that have paged stores to use the pageup and pagedown keys to change the page in the store;
    enableKeyboardPaging: true,

    // hide the paging toolbar when there is less than a single page of results;
    autoHidePagingToolbar: true,

    // this property controls the type of products to return; "parent" returns the parent product. "inventory" returns the all variants for the parent product;    
    productType: 'parent',
    productsPerPage: 10,
    checkChangeBuffer: 5000,
    minChars: 4,
    displayField: 'name',
    hideLabel: true,
    hideTrigger: false,
    emptyText: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.product_search_char_minimum,
    selectOnFocus: true,
    flex: 1,
    value: "",

    listConfig: {
        loadingText: Localizer.langResources.SHARED.searching_text,
        cls: "product-picker-menu",
        emptyText: '<div style="padding:20px; 10px; ">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.no_matching_product+'</div>',
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
    },
    pageSize: 10,

    // querystring parameter name that contains the search filter data;
    queryParam: "filter",

    // default filter parameter used to get the full list
    allQuery: "",

    // specifies whether to only show the "live" version of items, i.e. the published version as opposed to new/draft.
    liveMode: false,

    // filters to include with every query
    defaultFilters: [],

    // modify the format of the query data to fit the service filtering pattern.
    formatQuery: function (queryEvent, e) {


        // need to format the search text from the combobox into a filter structure the service wants;
        // always force the query to match what's in the field.
        // after a selection the queryEvent.query is initially set to "" which is incorrect in this situation;

        // delete the last query to force a new request; 
        delete this.lastQuery;

        var queryText = queryEvent.combo.getValue() || "";

        // the formated query f's the min char check.... 
        if (queryText !== "" && queryText.length < this.minChars) {
            return false;
        }

        var filters = this.defaultFilters || [];
        if (queryText !== "") {
            filters = filters.concat([{ property: 'all', value: queryText }]);
        }
        if (filters.length) {
            queryEvent.forceAll = false;
            queryEvent.query = Ext.encode(filters);
        } else {
            // need to force the load of the full list. just returning a value of "" causes the control to reload the last query;
            queryEvent.forceAll = true;
        }

        return true;
    },

    initComponent: function (eOpts) {
        var me = this;
        if (!me.store) {

            if (me.productType == 'parent') {
                me.store = Taco.core.data.StoreManager.getOrCreate({
                    pageSize: me.productsPerPage,
                    type: 'Taco.store.ProductPicker',
                    liveMode: me.liveMode
            });
            }
            if (me.productType == 'inventory') {
                me.store = Taco.core.data.StoreManager.getOrCreate({
                    type: 'Taco.store.InventoriedProducts',
                    pageSize: me.productsPerPage,
                    // note that clearSort is required to avoid having the sorters get cleared when the store is instantiated;
                    clearSort: false,
                    remoteSort: true,

                    autoLoad: true
                });
            }
        }

        me.mon(me, 'beforequery', this.formatQuery, this);
        me.callParent(arguments);
    }
});
