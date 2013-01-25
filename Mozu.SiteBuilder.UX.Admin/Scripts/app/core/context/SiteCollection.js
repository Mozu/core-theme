Ext.define('Taco.core.context.SiteCollection', {
    //extend: 'Ext.util.Observable',
    
    id: -1,
    sites:null,
    constructor: function (config) {
        var me = this;
        me.sites = Ext.Array.clone(me.sites | []);
        config = Ext.apply({}, config);
        Ext.apply(me, config);
        
        me.callParent([config]);
        


        
        
        Ext.each(me.sites, function (site, idx) {
            site.siteCollection = me;
            me.sites[idx]= Ext.create('Taco.core.context.Site', site);

        });
        

        
    }
    
});