Ext.define('Taco.core.context.SiteCollection', {
    //extend: 'Ext.util.Observable',
    urlToken: null,
    contextType: 'c',
    name: '',
    id: -1,
    sites: null,
    
    constructor: function (config) {
        var me = this;
        me.sites = Ext.Array.clone(me.sites | []);
        config = Ext.apply({}, config);
        Ext.apply(me, config);
        
        me.callParent([config]);

        me.urlToken = me.contextType +':'+ me.id;
        
        Ext.each(me.sites, function (site, idx) {
            site.siteCollection = me;
            me.sites[idx]= Ext.create('Taco.core.context.Site', site);
        });
    },

    getSiteId: function () {
        if (this.sites.length == 1) {
            return this.sites[0].getSiteId();
        }
        return null;

    },

    getSiteGroupId: function () {
        return this.id;
    }
});