/**
 * @author Michael Speed Elder
 * @class Taco.view.paymentAndCheckout.FieldDescription
 * Defines a container with space for field(s) and an adjacent body of text description.
 */

Ext.define('Taco.view.paymentAndCheckout.FieldDescription', {
    extend: 'Ext.container.Container',
    alias: 'widget.field-description',
    layout: 'hbox',

    childField: false,
    childDescription: '',
    descriptionTop: 40,

    initComponent: function () {
        var me = this;

        var description = Ext.create('Ext.Component', {
            autoEl: 'p',
            margin: me.descriptionTop + ' 0 0 0',
            cls: 'taco-field-description-text',
            html: me.childDescription
        });

        if( me.childField && description )
            me.items = [ me.childField, description ];
        else
            throw new TypeError("FieldContainer object requires truthy values for 'childField' and 'childDescription' properties.");

        me.callParent( arguments );
    }
});