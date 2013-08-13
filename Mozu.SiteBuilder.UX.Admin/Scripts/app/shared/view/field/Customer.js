
/**
 * @class Taco.shared.view.field.Customer
 */

Ext.define('Taco.shared.view.field.Customer', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.taco.customerfield',

    //displayTpl: '{primaryLastName}, {primaryFirstName} - {primaryEmail}',
    displayField: 'primaryEmail',

    emptyText: 'Search',

    listConfig: {
        loadingText: 'Searching...',
        emptyText: 'No mathching customers found.',
        getInnerTpl: function () {
            return '{primaryLastName}, {primaryFirstName} - {primaryEmail}';
        },
        refresh: function () {
            var toolbar = this.pagingToolbar;

            Ext.view.View.prototype.refresh.call(this);

            if (this.rendered && toolbar && toolbar.rendered && !this.preserveScrollOnRefresh) {
                this.getEl().appendChild(toolbar.getEl());
                if (this.getStore().getTotalCount() <= this.pageSize) this.getEl().last().hide();
                else this.getEl().last().show();
            }
        }
    },
    pageSize: 30,

    queryParam: 'filter',

    allQuery: '',

    initComponent: function () {

        if (!this.store) {
            this.store = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Customers',
                pageSize: this.pageSize,
                autoLoad: true
            });
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