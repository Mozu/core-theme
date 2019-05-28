/**
 * @class Taco.shared.view.field.CouponSetPickerField
 */
Ext.define('Taco.shared.view.field.CustomerSegmentPickerField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.taco-customersegmentpickerfield',
    requires: [
        'Taco.store.CustomerSegments'
    ],

    config: {

    },
    // clear out the search text when user clicks the trigger;
    clearOnTriggerClick: true,

    // this adds support to combos that have paged stores to use the pageup and pagedown keys to change the page in the store;
    enableKeyboardPaging: true,

    // hide the paging toolbar when there is less than a single page of results;
    autoHidePagingToolbar: true,

    pageSize: 20,

    autoLoad: false,

    checkChangeBuffer: 5000,
    minChars: 1,
    displayField: 'name',
    valueField: 'code',
    hideLabel: false,
    hideTrigger: false,
    selectOnFocus: true,
    //flex: 1,
    value: "",
    listConfig: {
        loadingText: 'Searching...',
        //cls : "product-type-picker-menu",
        emptyText: '<div style="padding:20px; 10px; ">No matching customer segments found.</div>',
        getInnerTpl: function () {
            return "<span class='segment-name'>{name}</span> <span class='segment-code'>({code})</span>"
        },
    },

    // querystring parameter name that contains the search filter data;
    queryParam: "filter",

    // default filter parameter used to get the full list
    allQuery: "",

    onTriggerClick: function () {
        var me = this;
        // if there is text in the field and user clicks the trigger clear out the text so that we get a full search result
        if (!me.isExpanded && me.clearOnTriggerClick) {
            this.setRawValue("");
        }
        this.callParent(arguments);
    },

    // modify the format of the query data to fit the service filtering pattern.
    formatQuery: function (queryEvent, e) {

        // need to format the search text from the combobox into a filter structure the service wants;
        // always force the query to match what's in the field.
        // after a selection the queryEvent.query is initially set to "" which is incorrect in this situation;

        // delete the last query to force a new request; 
        delete this.lastQuery;

        var queryText = queryEvent.combo.getValue() || "";
        if (queryText == "") {
            // need to force the load of the full list. just returning a value of "" causes the control to reload the last query;
            queryEvent.forceAll = true;
        } else {
            //the formated query f's the min char check.... 
            if (queryText.length < this.minChars) {
                return false;
            }

            queryEvent.forceAll = false;
            queryEvent.query = Ext.encode([{ property: 'nameorcode', comparison: 'sw', value: queryText }]);
        }

        return true;
    },

    initComponent: function (eOpts) {
        var me = this;

        if (!me.store) {

            me.store = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.CustomerSegments',
                pageSize: me.pageSize,
                autoLoad: me.autoLoad,
                listeners: {
                    beforeload: function (store, operation) {
                        var proxy = store.getProxy();
                        if (!proxy.extraParams) {
                            proxy.extraParams = {};
                        }
                    },
                    scope: this
                }
            });
        }

        me.mon(me, 'beforequery', this.formatQuery, this);

        me.callParent(arguments);
    }
});
