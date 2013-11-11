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
        
        contextStore.filter([{
            filterFn: function (item) {
            return item.get('isMozuRendered') && item.get("contextType") == 's';
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
                                    '<ul class="menu" style="width: 200px;">',
                                        '<li class="title-large">',
                                            '<span>{[values.name]}</span>',
                                        '</li>',
                                        '<li class="content">',
                                            '<div><a  data-siteId="{[values.id]}" data-url="generalsettings" href="/admin/{[values.urlToken]}/generalsettings">Site Settings</a></div>',
                                            '<div><a  data-siteId="{[values.id]}" data-url="themes" href="/admin/{[values.urlToken]}/themes">Theme</a></div>',
                                            '<div><a  data-siteId="{[values.id]}" data-url="website" href="/admin/{[values.urlToken]}/website">Edit</a></div>',
                                            '<div><a  data-siteId="{[values.id]}" target="_blank" href="/_gosite/{[values.id]}">View Live Site</a></div>',
                                            '<div><a  data-siteId="{[values.id]}" target="_blank" href="/_gosite/{[values.id]}?environment=preview">View Preview Site</a></div>',
                                        '</li>',
                                    '</ul>',
                                    '<div class="title-large">{[values.name]}</div>',
                                    '<img class="thumbnail" src="/_gosite/{[values.id]}?environment=preview&redir=sitethumbnail">',
                                '</li>',
                    '</tpl>',
                '</ul>'
                ],
                listeners: {
                    click: {
                        element: 'el',
                        delegate: '[data-url]',
                        fn: function (event, node) {
                            event.stopEvent();
                            var site = Taco.app.context.findSite(parseInt(node.dataset.siteid));
                            Taco.app.context.setCurrentContext(site);
                            Taco.core.StateManager.attemptNavigate(node.dataset.url);
                        }
                    }
                }
            }]
        };

        this.callParent(arguments);
    }

});