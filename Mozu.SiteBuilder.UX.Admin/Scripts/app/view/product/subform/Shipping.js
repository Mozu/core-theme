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
        this.record = this.product;
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
                minValue :.001,
                hideTrigger: true,
                value:this.record.get('packageWeight') || 1,
                keyNavEnabled: false,
                required: true,
                allowBlank: false,
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

        this.callParent(arguments);
        this.on('afterrender', function () {
            var weight = this.findField('packageWeight');
            if (!weight.getValue()) {
                this.suspendEvents(false);
                weight.setValue(1);
                weight.resetOriginalValue();
                this.resumeEvents();
            }
        });
    }

});