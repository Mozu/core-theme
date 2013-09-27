/**
 * @class Taco.view.product.subform.Shipping
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Shipping', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'Shipping',
    
    initComponent: function () {
        this.record = this.product;
        this.items = [{
            xtype: 'container',
            width: '100%',
            layout: 'hbox',
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
                value:(this.record.phantom )? 1 : this.record.get('packageWeight'),
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
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                defaults: {
                    width: 100,
                    margin: '0 0 0 10',
                    xtype: 'unitfield',
                    unitString: 'in',
                    decimalPrecision: 3,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false
                },
                items: [{
                    margin: 0,
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
        }];

        this.callParent(arguments);
        this.on('afterrender', function () {
            var weight = this.findField('packageWeight');
            if (!weight.getValue()) {
               
                weight.setValue(1);
                this.record.set('packageWeight', 1);
               
             
            }
        },this, {
            delay :100
        } );
    }

});