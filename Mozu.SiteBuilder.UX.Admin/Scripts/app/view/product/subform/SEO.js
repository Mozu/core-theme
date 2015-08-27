/**
 * @class Taco.view.product.subform.SEO
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.SEO', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.core.ux.form.SlugField'],
    alias: 'widget.productseosubform',
    title: 'SEO',

    bodyPadding: '0 0 0 0',

    initComponent: function () {
     

        this.delayItems = [
            {
                width : '100%',
                product : this.product,
                xtype: 'productoverride',
                productInCatalogInfo :this.productInCatalogInfo,
                persistChangesToModel : true,
                overrideFieldName: 'isSEOContentOverridden',
                hideOverride: this.isSingleSite,
                items: [
                    {
                        fieldLabel: 'Meta Title',
                        name: 'metaTitle'
                    }, {
                        fieldLabel: 'Slug',
                        xtype: 'taco-slugfield',
                        name: 'slug'
                    }, {
                        fieldLabel: 'Meta Description',
                        name: 'metaDescription',
                        xtype: 'textarea'
                    }, {
                        xtype: 'textarea',
                        name: 'metaKeywords',
                        fieldLabel: 'Meta Keywords'
                    }
                ]
            }
        ];

        this.callParent(arguments);
        this.on('afterrender', function () {
            this.add(this.delayItems);
            this.productForm = this.up('productform');
            this.slugField = this.getForm().findField('slug');
            this.metaTitle = this.getForm().findField('metaTitle');
            this.metaDescription = this.getForm().findField('metaDescription');

            if (this.productForm.isCreate) {
                this.manageListeners(true);
            }


        }, this, { single: true, delay: 16 });

        this.mon(Taco.app, 'productduplicated', this.manageListeners, this, true);
    },

    manageListeners: function (attach) {
        var fn = (attach === true ? 'mon' : 'mun');

        this[fn](this.productForm, {
            productnamechange: {
                scope: this,
                fn: 'onNameChange'
            },
            productfulldescriptionchange: {
                scope: this,
                fn: 'onProductLongDescriptionChange'
            },
            savesuccess: {
                scope: this,
                fn: 'manageListeners'
            }
        });
    },

    onProductLongDescriptionChange: function (record, value) {
        if ((this.productInCatalogInfo || this.product) != record) {
            return;
        }
        var shadow = document.createElement('span');
        shadow.innerHTML = value;

        this.metaDescription.setValue((shadow.innerText || '').trim());
    },

    onNameChange: function (record, name) {
        if ((this.productInCatalogInfo || this.product) != record) {
            return;
        }
        this.metaTitle.setValue(name);
        var previous = this.slugField.onNameChangeValue,
            current = this.slugField.getValue(),
            newValue;
        if (current && previous != current) {
            return;
        }


        this.slugField.setValue(name);
        this.slugField.onNameChangeValue = this.slugField.getValue();

    }
});