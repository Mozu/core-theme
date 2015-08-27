/**
 * @class Taco.view.product.AddSiteContainer
 * @author Michael Speed Elder
 *
 * This class represents the [+] tab that allows products to be associated (or unassociated) with multiple sites.
 */

Ext.define('Taco.view.product.AddSiteContainer', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.form.field.Checkbox',
        'Ext.form.CheckboxGroup'
    ],

    componentCls: Taco.baseCSSPrefix + 'available-site-list',
    floating: true,
    shadow: false,

    initComponent: function () {
        var me = this,
            sites = Taco.app.context.getMasterCatalog().sites,
            checkboxes = [];

        Ext.each(sites, function ( site ) {
            var siteId = site.id;

            checkboxes[ checkboxes.length ] = {
                siteId: siteId,
                siteName: site.name,
                boxLabel: site.name,
                checked: Ext.Array.contains(me.currentSites, siteId)
            }
        });

        this.checkboxgroup = Ext.widget({
            xtype: 'checkboxgroup',
            columns: 1,
            vertical: true,
            defaults: {
                handler: function () {
                    var siteInfoPair = {};
                    siteInfoPair[this.siteId] = this.siteName;
                    me.fireEvent('selectionchange');
                }
            },
            items: checkboxes
        });

        this.items = [this.checkboxgroup];

        //this.enableBubble('formTabCountChange');
        //
        
        this.addEvents([
            'selectionchange'
        ]);

        this.callParent( arguments );
    },

    /**
     * @public
     * @return {Object} An object containing all the siteId:siteName pairs of selected checkboxes
     */
    getSelectedSites: function () {
        var simpleSiteList = {},
            cbSelected = this.checkboxgroup.getChecked(),
            ids   = Ext.Array.pluck(cbSelected, 'siteId'),
            names = Ext.Array.pluck(cbSelected, 'siteName');

        for(var i = ids.length; i--;) {
            simpleSiteList[ ids[i] ] = names[i];
        }

        return simpleSiteList;
    }
});