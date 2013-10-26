/**
 * @class Taco.view.product.subform.SEO
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.SEO', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'SEO',
    
    initComponent: function () {
        this.defaults.width = '100%';
        this.defaults.product = this.product;
        this.defaults.productInCatalogInfo = this.productInCatalogInfo;
        this.defaults.persistChangesToModel = true;

        this.items = [{
            xtype: 'productoverride',
            overrideFieldName: 'isSEOContentOverridden',
            hideOverride: this.isSingleSite,
            items: [{
                fieldLabel: 'Meta Title',
                name: 'metaTagTitle'
            }, {
                fieldLabel: 'Friendly URL',
                name: 'seoFriendlyUrl'
            }, {
                fieldLabel: 'Meta Description',
                name: 'metaTagDescription',
                xtype: 'textarea'
            }]
        }];

        this.callParent( arguments );
    }
});