/**
 * @class Taco.view.order.widget.DiscountPickerField
 */
Ext.define('Taco.view.order.widget.DiscountPickerField', {
    extend: 'Ext.form.field.ComboBox',
    requires: [
        
    ],
    
    config: {
    
    },
    
    displayField: 'name',
    hideLabel: true,
    hideTrigger: false,
    emptyText: "Search",
    selectOnFocus: true,
    flex: 1,
    //height: 24,
    listConfig: {
        loadingText: 'Searching...',
        cls: "discount-picker-menu",
        emptyText: 'No matching discounts found.',
        // Custom rendering template for each item
        getInnerTpl: function () {
            return "<span class='name'>{name},</span><span class='codelabel'>Coupon:</span><span class='code'>\"{couponCode}\"</span>"
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
            queryEvent.query = '[{ "property": "validOnDate", "value": "' +  Ext.Date.format(queryEvent.combo.validOnDate, 'c') + '" },{ "property": "requireCoupon", "value": "true" }]';
        } else {
            queryEvent.forceAll = false;
            queryEvent.query = '[{ "property": "all", "value": ' + Ext.JSON.encodeValue(queryText) + ' },{ "property": "validOnDate", "value": "' + Ext.Date.format(queryEvent.combo.validOnDate, 'c') + '" },{ "property": "requireCoupon", "value": "true" }]';
        }
        

//        queryEvent.combo.getStore().load();

        return true;
    },
    
    initComponent: function(eOpts) {
        var me = this;
        me.on('beforequery', this.formatQuery, this);
        me.callParent(arguments);
    }
});