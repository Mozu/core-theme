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
                title: 'SiteID: ' + info.get('siteId'),
                isSingleSite: this.isSingleSite,
                record: info
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
    }
});