Ext.define('Taco.view.siteSelection.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [],

    requiresContextOfType: 's',
    cls: 'taco-theme-selector',
    
    initComponent: function () {
        var me = this;
        var dataStore = { "site": [] };
        var contextStore = Ext.clone(Taco.app.context.getStore());
        

        this.header = {
            title: 'Site Selection'
        };
        
        contextStore.filter([{ filterFn: function(item) {
            return item.get("contextType") == 's';
        } }]);

        
        Ext.Array.forEach(contextStore.data.items, function (el, index, arr) {
            dataStore.site.push({ "id": el.data.id, "name": el.data.name, "urlToken": el.data.urlToken });
        }, me);

        this.body = {
            items: [{
                xtype: 'component',
                renderData: dataStore,
                renderTpl: [
                    '<ul class="group">',
                    '<tpl for="site">',
                                '<li class="theme-swatch">',
                                    '<ul class="menu">',
                                        '<li class="title">',
                                            '<span>{[values.name]}</span>',
                                        '</li>',
                                        '<li class="actions">',
                                            '<a class="action-preview" href="#">Site Settings</a>',
                                            '<a class="action-settings" href="/admin/{[values.urlToken]}/themes">Theme</a>',
                                            '<a class="action-addons" href="/admin/{[values.urlToken]}/sites/pages">Edit</a>',
                                            '<a class="action-addons" target="_blank" href="/_gosite/{[values.urlToken]}">View Live Site</a>',
                                        '</li>',
                                    '</ul>',
                                    '<div class="title">{[values.name]}</div>',
                                    '<img class="thumbnail" src="/_gosite/{[values.id]}?environment=preview&redir=sitethumbnail">',
                                '</li>',
                    '</tpl>',
                '</ul>'
                ]
            }]
        };

        this.callParent(arguments);
    }

});