/**
 * @class Taco.shared.view.field.Customer
 */

Ext.define('Taco.shared.view.field.Customer', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.taco-customerfield',
    requires: ['Taco.model.CustomerAccount', 'Taco.store.Customers'],

  //  displayField: 'primaryEmail',
    valueField: 'accountAndUserId',

    emptyText: 'Search',
    remoteFilter: true,
    queryMode: 'remote',

    // adds extraParam to the proxy to show anonymous customers as well;
    showAnonymousCustomers: false,
    filterByCustomerSet:false,
    enableKeyboardPaging: true,

    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<div class="x-boundlist-item taco-boundlist-item-customer">',
            '<tpl if="lastName">',
                '<div class="name">{lastNameSafe}, {firstNameSafe}</div>{[this.getAccountPill(values)]}',
                '<div class="email">{emailAddressSafe}</div>',
            '<tpl elseif="contacts.length">',
                '<div class="name">{[this.getNames(values.contacts)]}</div>{[this.getAccountPill(values)]}',
                '<div class="email">{[values.emailAddressSafe || "(no email address)"]}</div>',
            '<tpl else>',
                '<div class="name">Customer</div>{[this.getAccountPill(values)]}',
                '<div class="email"></div>',
            '</tpl>',
            '</div>',
        '</tpl>',
        {
            getNames: function(contacts) {
                var lastName = Ext.util.Format.htmlEncode(contacts[0].lastName);
                var firstName = Ext.util.Format.htmlEncode(contacts[0].firstName);

                return Ext.String.format('{0}, {1}', lastName, firstName);
            },
            getRegistrationStatus: function(customer) {
                return (customer.isAnonymous) ? 'Shopper' : 'Guest';
            },
            getAccountPill: function(customer) {
                return (customer.isAnonymous)
                    ? '<div class="account x-column-content-pill x-column-content-pill-false taco-combo-pill">Guest ' + customer.id + '</div>'
                    : '<div class="account x-column-content-pill x-column-content-pill-true taco-combo-pill">Shopper ' + customer.id + '</div>';
            }
        }
    ),

    // Looks like the text here is already htmlEncoded, don't need to do it again.
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<tpl if="lastName">',
                '{lastName}, {firstName} ({id}) - {emailAddress}',
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
            if (me.filterByCustomerSet) {
              proxy.setExtraParam("filterByCustomerSet", 'true');
            } else {
                delete proxy.extraParams["filterByCustomerSet"];
            }
            if (me.showAnonymousCustomers) {
                proxy.setExtraParam("showAnonymous", 'true');
            } else {
                if (proxy.extraParams["showAnonymous"]) {
                    delete proxy.extraParams["showAnonymous"];
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
            queryEvent.query = '[{ "property": "all", "value": "' +
                queryText +
                '" }, { "property": "isactive", "value": "true" }]';
        }

        return true;
    }
})