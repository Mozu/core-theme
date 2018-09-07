/**
 * @class Taco.view.synonyms.Index
 * @author Brandon Jernigan
 * @date 6/24/16
 *
 */
Ext.define('Taco.view.synonyms.Index', {
    extend: 'Taco.view.react.Index',
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    initComponent: function () {
        this.items = [];
        this.callParent(arguments);
    }
});
