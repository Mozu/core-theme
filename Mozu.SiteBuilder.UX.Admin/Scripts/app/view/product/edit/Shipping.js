/**
 * @author Travis Johnson
 * @class Taco.view.product.edit.Shipping
 */

    Ext.define('Taco.view.product.edit.Shipping', {
        extend : 'Taco.core.ux.form.Module',
        disabled : true,
        model : 'Taco.model.Product',

        disabledTitle : 'manage shipping',
        disabledMessage : 'Here you can add an optional handling charge, or specify this product as having free shipping.',

        form : {
            defaults : {
                xtype : 'textfield',
                labelAlign : 'top',
                labelSeparator : ''
            },
            items : []
        },

        initComponent : function() {
            var me = this;

            me.callParent(arguments);
        }
    });

