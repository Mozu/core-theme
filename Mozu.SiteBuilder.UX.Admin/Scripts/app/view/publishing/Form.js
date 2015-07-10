/**
 * The discount editor view
 */
Ext.define('Taco.view.publishing.Form', {   
    extend: 'Taco.core.ux.form.NavForm2',
    requires: [
        'Taco.view.publishing.grid.Draft'
    ],

    initComponent: function () {
        this.items = [
            Ext.create('Taco.view.publishing.grid.Draft')
        ]
        this.callParent(arguments);
    }
});
