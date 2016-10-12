/**
 * @class Taco.shared.view.field.CategoryPickerField
 */
Ext.define('Taco.shared.view.field.CategoryPickerField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.taco-categorypickerfield',
    requires: [
        'Taco.store.CategoryPicker'
    ],

    config: {

    },

    // this adds support to combos that have paged stores to use the pageup and pagedown keys to change the page in the store;
    enableKeyboardPaging: true,

    // hide the paging toolbar when there is less than a single page of results;
    autoHidePagingToolbar: true,

    recordsPerPage: 10,
    checkChangeBuffer: 5000,
    minChars: 4,
    displayField: 'name',
    hideLabel: true,
    hideTrigger: false,
    emptyText: "Category Search (4 characters minimum)",
    selectOnFocus: true,
    flex: 1,
    value: "",

    listConfig: {
        loadingText: 'Searching...',
        cls: "product-picker-menu",
        emptyText: '<div style="padding:20px; 10px; ">No matching categories found.</div>',
        // Custom rendering template for each item
        getInnerTpl: function () {
            return "<span class='product-name'>{name}</span> <span class='product-code'>{categoryCode}</span>"
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
    formatQuery: function (queryEvent) {


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
            me.store = Taco.core.data.StoreManager.getOrCreate({
                pageSize: me.recordsPerPage,
                type: 'Taco.store.CategoryPicker'
            });
        }

        me.mon(me, 'beforequery', this.formatQuery, this);
        me.callParent(arguments);
    }
});
