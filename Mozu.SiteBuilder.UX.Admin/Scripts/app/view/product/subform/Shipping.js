/**
 * @class Taco.view.product.subform.Shipping
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Shipping', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.core.ux.form.FlexBox'],

    title: 'Shipping',
    
    initComponent: function () {
        this.items = [{
            fieldLabel: 'Package Weight',
            value: '126 kg'
        }, {
            xtype: 'formflexbox',
            width: 320,
            cls: Taco.baseCSSPrefix + 'flex-field-spacing',
            defaults: {
                width: 100,
                xtype: 'textfield'
            },
            items: [{
                xtype: 'component',
                width: '100%',
                cls: 'x-form-item-label x-form-item-label-top',
                autoEl: {
                    'tag': 'label',
                    'html': 'Package Dimensions'
                }
            }, {
                emptyText: 'l'
            }, {
                emptyText: 'w'
            }, {
                emptyText: 'h'
            }]
        }];

        this.callParent( arguments );
    }
});