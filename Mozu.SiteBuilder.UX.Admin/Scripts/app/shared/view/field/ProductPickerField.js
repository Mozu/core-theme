/**
 * @class Taco.shared.view.field.ProductPickerField
 */
Ext.define('Taco.shared.view.field.ProductPickerField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.taco-productpickerfield',
    requires: [
        
    ],
    
    config: {
    
    },
    
    productsPerPage: 30,
    
    displayField: 'name',
    hideLabel: true,
    hideTrigger: false,
    emptyText: "Search",
    selectOnFocus: true,
    flex: 1,
    //height: 24,
    listConfig: {
        loadingText: 'Searching...',
        cls : "product-picker-menu",
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
                if (me.getStore().getTotalCount() <= me.pageSize) me.el.last().hide();
                else me.el.last().show();
            }
        }
    },
    pageSize: 30,

    // querystring parameter name that contains the search filter data;
    queryParam: "filter",

    // default filter parameter used to get the full list
    allQuery: "",
    
    // modify the format of the query data to fit the service filtering pattern.
    formatQuery: function (queryEvent, e) {
        // need to format the search text from the combobox into a filter structure the service wants;
        // always force the query to match what's in the field.
        // after a selection the queryEvent.query is initially set to "" which is incorrect in this situation;
        var queryText = queryEvent.combo.getValue() || "";
        if (queryText == "") {
            // need to force the load of the full list. just returning a value of "" causes the control to reload the last query;
            queryEvent.forceAll = true;
        } else {
            queryEvent.forceAll = false;
            queryEvent.query = '[{ "property": "all", "value": "' + queryText + '" }]'
        }

        return true;
    },
    
    initComponent: function(eOpts) {
        var me = this;

        if (!me.store) {
            me.store = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Products',
                pageSize: me.productsPerPage,
                // note that clearSort is required to avoid having the sorters get cleared when the store is instantiated;
                clearSort: false,
                remoteSort: true,
                sorters: [{
                    property: 'productName',
                    direction: 'ASC'
                }],
                autoLoad: true
            });
        }
        

        me.on('beforequery', this.formatQuery, this);
        me.callParent(arguments);
    }
});