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
     

        this.items = [
            {
                width : '100%',
                product : this.product,
                xtype: 'productoverride',
                productInCatalogInfo :this.productInCatalogInfo,
                persistChangesToModel : true,
                overrideFieldName: 'isSEOContentOverridden',
                hideOverride: (this.isGlobal),
                items: [
                    {
                        fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.meta_title,
                        name: 'metaTitle'
                    }, {
                        fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.slug,
                        xtype: 'taco-slugfield',
                        name: 'slug',
                        margin: '20 0 0 0'
                    }, {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        margin: '20 0 0 0',
                        items: [
                            {
                                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.meta_description,
                                name: 'metaDescription',
                                xtype: 'textarea',
                                flex: 1,
                                width: '50%',
                                margin: '0 15 0 0',
                                height: 250
                            }, {
                                xtype: 'textarea',
                                flex: 1,
                                name: 'metaKeywords',
                                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.meta_keywords,
                                width: '50%',
                                margin: '0 0 0 15',
                                height: 250
                            }
                        ]
                    }


                ]
            }
        ];

        this.callParent(arguments);
        this.on('afterrender', function () {
            
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