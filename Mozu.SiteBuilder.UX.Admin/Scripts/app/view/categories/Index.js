/**
 * @class Taco.view.categories.Index
 */

Ext.define('Taco.view.categories.Index', {
    extend: 'Taco.view.react.Index',
    alias: 'widget.taco.index.category',

    initComponent: function () {
        this.callParent(arguments);
    },

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.categories.AdvancedSearchForm',
        emptySearchText: 'Search'
    },

    contextConfig: {
        supportedLevels: ['c'],
        requiresContextOfType: ['c']
    },
    
    allowCreate: function() {
        return false;
    }
});
