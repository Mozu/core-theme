Ext.define('Taco.view.website.Header', {
	extend: 'Ext.container.Container',
    mixins: {
        permissions: 'Taco.core.ux.mixins.Permissions'
    },
    requires: [],
    initComponent: function() {
    	this.items = [];
    	this.callParent(arguments);
    }
});