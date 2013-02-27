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
                xtype: 'unitfield',
                name: 'packageWeight',
                fieldLabel: 'Weight',
                emptyText: 'lbs',
                unitString: ' lbs',
                unitAtEnd: true,
                decimalPrecision: 3,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            
            }, {
            xtype: 'formflexbox',
            width: 320,
            cls: Taco.baseCSSPrefix + 'flex-field-spacing',
            defaults: {
                width: 100,
                xtype: 'unitfield',
                unitString: 'in',
                decimalPrecision: 3,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
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
                name:'packageLength',
                emptyText: 'l'
            }, {
                name:'packageWidth',
                emptyText: 'w'
            }, {
                name:'packageHeight',
                emptyText: 'h'
            }]
        }];

        this.callParent( arguments );
    }

});