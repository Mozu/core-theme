/**
 * @class Taco.view.product.subform.Shipping
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Shipping', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.core.ux.form.FlexBox'],

    title: 'Shipping',
    cls: Taco.baseCSSPrefix + 'product-admin-subform-shipping',
    
    initComponent: function () {
        this.items = [{
            xtype: 'formflexbox',
            justify: false,
            items: [{
                xtype: 'unitfield',
                name: 'packageWeight',
                fieldLabel: 'Weight',
                emptyText: 'lbs',
                unitString: ' lbs',
                unitAtEnd: true,
                decimalPrecision: 3,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false,
                style: {
                    'margin-right': '20px'
                }
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: 'Package Dimensions',
                width: 320,
                items: [{
                    xtype: 'formflexbox',
                    justify: true,
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
                        name:'packageLength',
                        emptyText: 'l'
                    }, {
                        name:'packageWidth',
                        emptyText: 'w'
                    }, {
                        name:'packageHeight',
                        emptyText: 'h'
                    }]
                }]
            }]
        }];

        this.callParent( arguments );
    }

});