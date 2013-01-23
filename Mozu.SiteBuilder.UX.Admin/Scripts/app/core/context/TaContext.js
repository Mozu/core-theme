Ext.define('Taco.core.context.TaContext', {
    extend: 'Ext.util.Observable',
    requires: ['Taco.core.AppState'],

    singleton: true,
    currentSiteId: -1,
    siteCollections:[],
    currentSiteCollectionId:-1,
    constructor: function() {
        var me = this;
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
        Ext.forEach(me.siteCollections, function (sc) {
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
        return this.findSite(this.currentSiteId);
    },
    getCurrentSite:function() {
        return this.findSite(this.currentSiteCollectionId);
    },
    findSiteCollection: function (id) {
        var me=this,foundCol;
        Ext.forEach(me.siteCollections, function (sc) {
            if (sc.id === id) {
                foundCol=sc;
            }
        });
        return foundCol;
    },
    findSite: function (id) {
        var foundSite, me = this;
        Ext.forEach(me.siteCollections, function (sc) {
            Ext.forEach(sc.sites, function (site) {
                if (id === site.id) {
                    foundSite = site;
                }
            });
        });
        return foundSite;
    }
});