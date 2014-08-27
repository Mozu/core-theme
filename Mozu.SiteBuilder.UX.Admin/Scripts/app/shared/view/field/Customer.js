
/**
 * @class Taco.shared.view.field.Customer
 */

Ext.define('Taco.shared.view.field.Customer', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.taco-customerfield',
    requires: ['Taco.model.CustomerAccount', 'Taco.store.Customers'],

  //  displayField: 'primaryEmail',
    valueField: 'id',

    emptyText: 'Search',
    remoteFilter: true,
    queryMode: 'remote',

    // adds extraParam to the proxy to show anonymous customers as well;
    showAnonymousCustomers: false,

    enableKeyboardPaging: true,
   
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<tpl if="lastName">',
                '<div class="x-boundlist-item">{lastNameSafe}, {firstNameSafe} - ({id}) - {emailAddressSafe}</div>',
            '<tpl else>',
                '<div class="x-boundlist-item">Customer {id}</div>',
            '</tpl>',
        '</tpl>'
    ),
    
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<tpl if="lastName">',
                '{lastName}, {firstName} - ({id}) - {emailAddress}',
            '<tpl else>',
                'Customer {id}',
            '</tpl>',
        '</tpl>'
    ),
    listConfig: {
        loadingText: 'Searching...',
        emptyText: '<div style="padding:20px; 10px; ">No matching customers found.</div>'
       
    },
    pageSize: 30,

    queryParam: 'filter',

    allQuery: '',
    setValue: function (value, doSelect) {
        var copyArgs = arguments;
        if (!!parseInt(value, 10) && !this.store.getById(parseInt(value, 10))) {
            Taco.model.CustomerAccount.load(parseInt(value, 10), {                
                scope: this,
                success: function (record, operation) {
                    this.store.add(record);
                    this.setValue.apply(this, arguments);
                }
            });
        } else {
            this.callParent(arguments);
        }
        
    },
    initComponent: function () {
        var me = this;

        if (!me.store) {
           
            me.store = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Customers',
                pageSize: me.pageSize,
                autoLoad: false
            });

            var proxy = me.getStore().getProxy();
            if (me.showAnonymousCustomers) {                
                proxy.setExtraParam("showAnonymous", 'true');
            } else {
                if (proxy.extraParams["showAnonymous"]) {
                    delete proxy.extraParams["showAnonymous"]
                }

            }
            this.store.load();

        }

        this.callParent(arguments);

        this.on({
            beforequery: this.formatQuery,
            scope: this
        });
    },

    formatQuery: function (queryEvent, e) {
        var queryText = queryEvent.combo.getValue() || '';

        queryEvent.forceAll = queryText === '';

        if (!queryEvent.forceAll) {
            queryEvent.query = '[{ "property": "all", "value": "' + queryText + '" }]';
        }

        return true;

    }
})