/**
 * @class Taco.view.product.subform.Extras
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Extras', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'Extras',

    initComponent: function () {
        var prod = this.product,
            createButton = {
                xtype: 'button',
                text: 'Click to create Extra',
                handler: function() {

                    console.log(prod);
                }
            };

        console.log(prod);
        
        this.items = [{
            xtype: 'productoverride',
            //overrideFieldName: 'extras',
            //hideOverride: this.isSingleSite,
            items: [createButton, {
                fieldLabel: 'Name',
                name: 'name'
            }, {
                fieldLabel: 'Delta Price',
                name: 'delta'
            }]
        }];

        this.callParent( arguments );
    }
});