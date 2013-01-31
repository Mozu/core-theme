/**
 * @class Taco.view.product.Form
 * @author Michael Speed Elder
 *
 */
Ext.define('Taco.view.product.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.tab.Panel',
        'Taco.view.product.GlobalForm',
        'Taco.view.product.SiteForm'
    ],

    id: 'taco',

    layout: 'fit',

    isSingleSite: true,

    initComponent: function() {

        this.inSitesStore = this.record.productInSitesStore();

        this.stores = [this.inSitesStore];

        this.globalForm = Ext.create('Taco.view.product.GlobalForm', {
            record: this.record
        });

        this.siteForms = [];

        this.isSingleSite = this.singleSiteCheck();

        this.inSitesStore.data.each(function (info) {
            this.siteForms.push(Ext.create('Taco.view.product.SiteForm', {
                isSingleSite: this.isSingleSite,
                record: info,
                product: this.record,
                productInSiteInfo: info
            }));
        }, this);

        var items = this.siteForms.slice(0);

        items.unshift(this.globalForm);

        this.tabpanel = Ext.create('Taco.core.ux.tab.Panel', {
            navigation: true,
            items: items
        });

        this.items = [this.tabpanel];

        this.callParent(arguments);
    },

    singleSiteCheck: function () {
        return this.inSitesStore.data.length === 1;
    },

    addSaveTasks: function (tasks) {

        tasks.add({
            key: 'sync-productInSiteInfo-store',
            store: this.inSitesStore
        });
        

        return tasks;
    },
    addSite: function (siteId) {
        var siteInfo = Ext.create('Taco.model.ProductInSiteInfo', {
            siteId: siteId,
            productCode:this.record.getId()
        });
        siteInfo.phantom = true;
        this.inSitesStore.add(siteInfo);
        siteInfo.set('productCode', this.record.getId());
        siteInfo.phantom = true;
        var wasSingleSite = this.isSingleSite;

        this.isSingleSite = this.singleSiteCheck();

        var siteForm = Ext.create('Taco.view.product.SiteForm', {
            isSingleSite: this.isSingleSite,
            record:siteInfo,
            product: this.record,
            productInSiteInfo: siteInfo
        });
      
        this.tabpanel.add(siteForm);
    }
});