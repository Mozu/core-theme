Ext.define('Taco.core.context.TaContext', {
    extend: 'Ext.util.Observable',
    requires: ['Taco.core.context.SiteCollection', 'Taco.core.context.Site'],

    currentSiteId: -1,
    siteCollections:null,
    currentSiteCollectionId:-1,
    
    constructor: function (config) {
        var me = this;
        me.siteCollections = Ext.Array.clone(me.siteCollections | []);
        config = Ext.apply({}, config);
        Ext.apply(me, config);

        me.callParent([config]);

        me.init(config);
       
        

        
    },
    init: function (data) {
        var me = this;
        Ext.each(data.siteCollections, function(sc,idx) {
            me.siteCollections[idx] = Ext.create('Taco.core.context.SiteCollection', sc);

        });
    },
    setCurrentSite: function (id) {
        var me = this, newSite = me.findSite(id), newCol = newSite!= null ? newSite.siteCollection: null;
        
        
        if (me.currentSiteId != id) {
            if (!me.fireEvent('change', me,  { change: 'site', site: newSite, colection: newCol })) {
                return false;
            }
        }
        if (newCol != me.getCurrentSiteCollection()) {
            if (!me.fireEvent('change', me, { change: 'sitecollection', site: newSite, colection: newCol })) {
                return false;
            }
        }

        me.currentSiteId = newSite != null ? newSite.id : null;
        me.currentSiteCollectionId = newCol != null ? newCol.id : null;
        return true;
    },
    setCurrentSiteCollection: function (id) {
        var me = this, newCol, curSite = me.getCurrentSite();
        Ext.each(me.siteCollections, function (sc) {
            if (sc.id === id) {
                newCol = sc;
            }
        });
        if (newCol != me.getCurrentSiteCollection()) {
            if (!me.fireEvent('change', me,{ change:'sitecollection', site: null, colection: newCol })) {
                return false;
            }
        }
        if (curSite != null ) {
            if (!me.fireEvent('change', me,  { change: 'site', site: null, colection: newCol })) {
                return false;
            }
        }
        me.currentSiteId = null;
        me.currentSiteCollectionId = newCol != null ? newCol.id : null;
        return true;
    },
    getCurrentSiteCollection: function () {
        return this.findSiteCollection(this.currentSiteCollectionId);
    },
    getCurrentSite:function() {
        return this.findSite(this.currentSiteId);
    },
    findSiteCollection: function (id) {
        var me=this,foundCol;
        Ext.each(me.siteCollections, function (sc) {
            if (sc.id === id) {
                foundCol=sc;
            }
        });
        return foundCol;
    },
    findSite: function (id) {
        var foundSite, me = this;
        Ext.each(me.siteCollections, function (sc) {
            Ext.each(sc.sites, function (site) {
                if (id === site.id) {
                    foundSite = site;
                }
            });
        });
        return foundSite;
    }
});