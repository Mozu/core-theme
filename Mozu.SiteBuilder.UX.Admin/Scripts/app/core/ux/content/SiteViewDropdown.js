Ext.define('Taco.core.ux.content.SiteViewDropdown', {
    extend: 'Ext.button.Button',
    alias: 'widget.taco-siteviewdropdown',
    cls: Taco.baseCSSPrefix + 'site-view-dropdown',
    ui: 'link',
    cls: 'taco-action-secondary taco-siteview-dropdown',
    scale: 'medium',
    text: 'View',
    height: 40,
    initComponent: function() {
        this.menu = Ext.create('Ext.menu.Menu', {
            cls: 'taco-siteviewdropdown-menu',
            items: [
                {
                    text: 'View Live',
                    handler: this.viewLiveHandler
                },
                {
                    text: 'View Staged',
                    handler: this.viewStagedHandler
                }
            ]
        });

        this.callParent(arguments);
    },
    viewLiveHandler: function() {
        window.open('/_gosite/' + Taco.app.context.getSiteId() + '?environment=live&redir=' + encodeURIComponent('/'));
    },
    viewStagedHandler: function() {
        window.open('/_gosite/' + Taco.app.context.getSiteId() + '?environment=preview&redir=' + encodeURIComponent('/'));
    }
});