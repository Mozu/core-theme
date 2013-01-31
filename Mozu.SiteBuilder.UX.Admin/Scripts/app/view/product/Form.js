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

        this.tabPanel = Ext.create('Taco.core.ux.tab.Panel', {
            navigation: true,
            items: items
        });

        this.items = [this.tabPanel];

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
        }), siteForm, wasSingleSite;
        
        siteInfo.phantom = true;
        this.inSitesStore.add(siteInfo);
        siteInfo.set('productCode', this.record.getId());
        siteInfo.phantom = true;
        
        wasSingleSite = this.isSingleSite;

        this.isSingleSite = this.singleSiteCheck();

        siteForm = Ext.create('Taco.view.product.SiteForm', {
            isSingleSite: this.isSingleSite,
            record:siteInfo,
            product: this.record,
            productInSiteInfo: siteInfo
        });

        this.siteForms.push(siteForm);
      
        this.tabPanel.add(siteForm);
    },

    removeSite: function (siteId) {
        var record = this.inSitesStore.findRecord('siteId', siteId),
            form;

        if (!record) {
            return;
        }

        Ext.each(this.siteForms, function (f) {
            if (record !== f.productInSiteInfo) {
                return;
            }
            form = f;
            return false;
        });

        if (!form) {
            return;
        }

        this.tabPanel.remove(form);
        this.inSitesStore.remove(record);
    }
});