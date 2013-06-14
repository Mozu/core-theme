/**
 * The discount editor view
 */
Ext.define('Taco.view.settings.shipping.Form', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    enableStoreSyncTasks: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    initComponent: function() {

        this.items = [{ html: '<h2>New Shipping Settings Coming Soon!</h2>' } ];

        this.callParent(arguments);
    }

});