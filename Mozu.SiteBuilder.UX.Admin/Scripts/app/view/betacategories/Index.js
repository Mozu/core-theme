/**
 * @class Taco.view.betacategories.Index
 */

Ext.define('Taco.view.betacategories.Index', {
    extend: 'Taco.view.react.Index',
    alias: 'widget.taco.index.betacategories',

    initComponent: function () {
        this.callParent(arguments);
    },

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.category.AdvancedSearchForm',
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
