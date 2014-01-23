
/**
 * @class Taco.shared.view.field.Customer
 */

Ext.define('Taco.shared.view.field.Customer', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.taco-customerfield',

  //  displayField: 'primaryEmail',
    valueField: 'id',

    emptyText: 'Search',
    remoteFilter: true,
    queryMode: 'remote',
   
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<tpl if="lastName">',
                '<div class="x-boundlist-item">{lastName}, {firstName} - ({id}) - {emailAddress}</div>',
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
        emptyText: 'No mathching customers found.',
       
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
                },
            });
        } else {
            this.callParent(arguments);
        }
        
    },
    initComponent: function () {


        
        if (!this.store) {
            this.store = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Customers',
                pageSize: this.pageSize,
                autoLoad: true
            });
        }
        
        //this.store = Ext.create('Taco.store.Customers', {
        //    autoLoad: false
        //});


        this.callParent(arguments);

        this.on({
            beforequery: this.formatQuery,
            //afterrender:function () {
            //    this.store.load();
            //},
            scope: this
        });
        //this.store.load();
        //if (this.value && !this.stoer.getById(this.value)) {
           

        //}
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