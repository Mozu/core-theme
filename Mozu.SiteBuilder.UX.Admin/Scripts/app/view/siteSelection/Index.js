Ext.define('Taco.view.siteSelection.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [],

    
    cls: 'taco-theme-selector',
    
    initComponent: function () {
        var me = this,
            dataStore = { "site": [] },
            contextStore = Ext.clone(Taco.app.context.getStore());
        

        this.header = {
            title: 'Site Selection'
        };
        
        contextStore.filter([{
            filterFn: function (item) {
            return item.get('isMozuRendered') && item.get("contextType") == 's';
        } }]);

        
        Ext.Array.forEach(contextStore.data.items, function (el) {
            dataStore.site.push({ "id": el.data.id, "name": el.data.name, "urlToken": el.data.urlToken, "urlRouteDisplay": (Taco.tenantSettings && Taco.tenantSettings.customRoutesVisible ? "block" : "none") });
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
                                            '<div><a  data-siteId="{[values.id]}" data-url="generalsettings/site" href="/admin/{[values.urlToken]}/generalsettings/site">Site Settings</a></div>',
                                            '<div><a  data-siteId="{[values.id]}" data-url="themes" href="/admin/{[values.urlToken]}/themes">Theme</a></div>',
                                            '<div><a  data-siteId="{[values.id]}" data-url="website" href="/admin/{[values.urlToken]}/website">Edit</a></div>',
                                            '<div><a  data-siteId="{[values.id]}" data-url="redirects" href="/admin/{[values.urlToken]}/redirects">Redirects</a></div>',
                                            '<div style="display:{[values.urlRouteDisplay]}"><a  data-siteId="{[values.id]}"  data-url="siteroutes" href="/admin/{[values.urlToken]}/siteroutes">Custom Url Routes</a></div>',
                                            '<div><a  data-siteId="{[values.id]}" target="_blank" href="/_gosite/{[values.id]}">View Live Site</a></div>',
                                            '<div><a  data-siteId="{[values.id]}" target="_blank" href="/_gosite/{[values.id]}?environment=preview">View Staged Site</a></div>',
                                        '</li>',
                                    '</ul>',
                                    '<div class="title-large">{[values.name]}</div>',
                                    '<img class="thumbnail" style="max-width:300px;max-height:300px" src="/admin/app/themes/sitethumbNail?siteId={[values.id]}&ts={[Ext.Date.now()]}" >',
                                '</li>',
                    '</tpl>',
                '</ul>',
                '<tpl if="Ext.isEmpty(site)">',
                    'There are no Mozu-hosted storefronts enabled.',
                '</tpl>'
                ],
                listeners: {
                    click: {
                        element: 'el',
                        delegate: '[data-url]',
                        fn: function (event, node) {
                            event.stopEvent();
                            var site = Taco.app.context.findSite(parseInt(node.dataset.siteid,10));
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