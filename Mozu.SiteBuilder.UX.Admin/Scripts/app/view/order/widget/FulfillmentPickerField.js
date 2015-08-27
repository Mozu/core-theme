/**
 * @class Taco.view.order.widget.FulfillmentPickerField
 * End point:  locationInventory/forproduct  
 */
Ext.define('Taco.view.order.widget.FulfillmentPickerField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.taco-fulfillmentpickerfield',
    requires: [
        'Taco.model.LocationPickup'
    ],
    
    config: {
        productConfig: null
    },
    
    itemsPerPage: 30,    
    displayField: 'fulfillmentLocationCode',
    valueField: "fulfillmentId",
    hideLabel: true,
    hideTrigger: false,
    emptyText: "Fulfillment Search",
    selectOnFocus: true,
    autoSelect:true,
    //height: 24,
    matchFieldWidth:false,
    listConfig: {
        width:300,
        loadingText: 'Searching...',
        cls: "fulfillment-picker-menu",
        deferEmptyText : false,
        emptyText: '<div style="padding:0px 10px 10px 10px;color:#999999"> No matching fulfillment locations found.</div>',
        // Custom rendering template for each item
        getInnerTpl: function () {
            return "<span class='fulfillment-method'>{fulfillmentMethod}</span> <span class='fulfillment-location-code'>  <tpl if='values.fulfillmentMethod == \"Digital\"'> (Download)<tpl else>({locationCode})</tpl> <span style='float:right;display:block' class='fulfillment-location-code'><tpl if='values.stockAvailable'>{stockAvailable} in stock</tpl></span>"
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

    // this field requires a product code to function; need to set extraParam for the productCode and clear out any old query data that was cashed;
    applyProductConfig  : function (config){        
        var me = this;
        

        var productCode = config.productCode;
        var variationProductCode = config.variationProductCode;
        


        if (!Ext.isString(productCode) || productCode.length === 0) {
            //alert('Error: productCode must be a valid non-empty string');
            return;
        } else {        
            me.getStore().getProxy().setExtraParam("productCode", productCode);
            me.getStore().getProxy().setExtraParam("variationProductCode", variationProductCode);
            // remove the last query so that we get a clean data set the next time the combo deploys
            delete me.lastQuery;
            return config;
        }        
    },
    
    // modify the format of the query data to fit the service filtering pattern. This only gets called when the user types something in the text box of the combo;
    formatQuery: function (queryEvent, e) {        
        var me = this;
        
        // need to manually set the product code on the proxy.extraParams. Not sure why but the the product code leaks form one field to the next;
        var productCode = me.getProductConfig();
        if (!productCode) {
            // need to have a product code to proceed;
            me.markInvalid("A product selection is required")
            return false;
        }

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
                model: 'Taco.model.LocationPickup',
                pageSize: me.pageSize,
                // note that clearSort is required to avoid having the sorters get cleared when the store is instantiated;
                clearSort: false,
                remoteSort: true,
                remoteFilter: true,
                // we need to define the proxy on the store so we can have a seperate proxy instance for each combo to avoid the leakage of the extraParams from one combo to the next;
                proxy: {
                    type: 'ajaxproxy',

                    api: {
                        read: '/admin/app/locationinventory/forproduct'            
                    },
                    reader: {
                        type: 'json',
                        root: 'items',
                        successProperty: 'success',
                        messageProperty: "message"
                    },
                    writer: {                        
                        type: 'json'
                    }
                },
                autoLoad: false
            });

        }

        me.mon(me.store, 'load', function () {
            me.doAutoSelect();
        },me)
        
        me.mon(me,'beforequery', this.formatQuery, this);
        me.callParent(arguments);
    },
    onDestroy: function () {
        this.callParent(arguments);
    }
});