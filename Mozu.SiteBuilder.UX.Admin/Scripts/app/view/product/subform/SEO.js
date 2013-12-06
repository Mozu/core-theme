/**
 * @class Taco.view.product.subform.SEO
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.SEO', {
    extend: 'Taco.view.product.subform.Subform',
    requires:['Taco.core.ux.form.SlugField'],
    alias: 'widget.productseosubform',
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
                    name: 'metaTitle'
                }, {
                    fieldLabel: 'Slug',
                    xtype:'taco-slugfield',
                    name: 'slug'
                }, {
                    fieldLabel: 'Meta Description',
                    name: 'metaDescription',
                    xtype: 'textarea'
                }]
        }];

        this.callParent(arguments);
        
        if (Ext.isEmpty((this.productInCatalogInfo || this.product).get('slug'))) {
            this.on('boxready', function () {
                this.productForm = this.up('productform');
                this.slugField = this.down('taco-slugfield');
                this.mon(this.productForm, 'productnamechange', this.onNameChange, this);
            });
        }

    },
    onNameChange: function (record, name) {
        if ( (this.productInCatalogInfo || this.product )  != record) {
            return;
        }
        var previous = this.slugField.onNameChangeValue,
            current = this.slugField.getValue(),
            newValue;
        if (current && previous != current) {
            return;
        }
        
        
        this.slugField.setValue(name);
        this.slugField.onNameChangeValue =  this.slugField.getValue();

    }
});