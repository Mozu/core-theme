/**
 * @class Taco.shared.view.field.LocationPickerField
 */
Ext.define('Taco.shared.view.field.LocationPickerField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.taco-locationpickerfield',
    requires: [
        
    ],
    
    config: {
    
    },
    
    autoSelectFirstRecord: true,
    
    //itemsPerPage: 30,
    displayField: 'name',
    hideLabel: true,
    hideTrigger: false,
    emptyText: "Search",
    selectOnFocus: true,
    flex: 1,
    listConfig: {
        loadingText: 'Searching...',
        //cls : "location-picker-menu",
        emptyText: 'No matching locations found.',
        // Custom rendering template for each item
        getInnerTpl: function () {
            return "<span class='name'>{name}</span> <span class='code'>{code}</span>"
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
    queryParam: "query",

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
                createOnly: true,
                type: 'Taco.store.Locations',
                pageSize: me.pageSize,
                // note that clearSort is required to avoid having the sorters get cleared when the store is instantiated;
                clearSort: false,
                remoteSort: true,
                remoteFilter: true,
                sorters: [{
                    property: 'name',
                    direction: 'ASC'
                }],
                filters: [{
                    property: 'supportsInventory',
                    value: true
                }],
                autoLoad: true
            });
        }

        me.store.on('load', function() {
            me.selectFirstRecord();
        }, me, {
            single:true
        });

        if (me.autoSelectFirstRecord) {
            me.on('beforequery', this.formatQuery, this);
        }
        
        me.callParent(arguments);
    },

    selectFirstRecord: function () {
        var me = this;
        var recordSelected = me.getStore().getAt(0);
        if (recordSelected) {
            me.select(recordSelected);
            // need to manually fire the select event; manually calling select method on combo doesn't fire the event;
            this.fireEvent('select', me, [recordSelected]);
        }
    }
});
