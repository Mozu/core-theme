/**
 * The discount editor view
 */
Ext.define('Taco.view.publishing.Form', {   
    extend: 'Taco.core.ux.form.NavForm2',
    requires: [
        'Taco.view.publishing.grid.Draft'
    ],

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m']
    },

    initComponent: function () {
        this.items = [];
        this.callParent(arguments);
    }
});
