/**
 * @class Taco.view.returns.Index
 */

Ext.define('Taco.view.returns.Index', {
    extend: 'Taco.view.react.Index',
    alias: 'widget.taco.index.returns',

    initComponent: function () {
        this.callParent(arguments);
    },

    // Need this later.
    /*advancedSearchConfig: {
        advancedFormCls: 'Taco.view.customers.AdvancedSearchForm',
        emptySearchText: 'Search'
    },*/

    allowCreate: function () {
        return false;
    }
});
