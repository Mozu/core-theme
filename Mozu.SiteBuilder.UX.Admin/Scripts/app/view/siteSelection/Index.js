Ext.define('Taco.view.siteSelection.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.view.siteSelection.SiteView'],

    requiresContextOfType: 's',
    
    initComponent: function() {
        this.header = {
            title: 'Site Selection'
        };

        /*
        this.siteView = Ext.create('Taco.view.theme.ThemeView', {
            store: this.store
        });

        this.body = {
            items: [this.siteView]
        };
        */
        this.body = {
            items: [{
                xtype: 'button',
                text: 'ere'
            }]
        };


        this.callParent(arguments);
    }

});