/**
 * @class Taco.view.product.subform.SEO
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.SEO', {
    extend: 'Taco.view.product.subform.Subform',
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
                this.slugField = this.down('[name="slug"]');
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
        newValue = name
            .replace(/^\s\s*/, '') // Trim start
            .replace(/\s\s*$/, '') // Trim end
            .toLowerCase() // Camel case is bad
            .replace(/[^a-z0-9_\-~!\+\s]+/g, '') // Exchange invalid chars
            .replace(/[\s]+/g, '-'); // Swap whitespace for single hyphen
        this.slugField.onNameChangeValue = newValue;
        this.slugField.setValue(newValue);

    }
});