/**
 * @class Taco.view.customers.Index
 */

Ext.define('Taco.view.customers.Index', {
    extend: 'Taco.view.react.Index',
    alias: 'widget.taco.index.customer',

    initComponent: function () {
        this.callParent(arguments);
    },

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.customers.AdvancedSearchForm',
        emptySearchText: 'Search'
    },
    
    allowCreate: function() {
        return false;
    }
});
