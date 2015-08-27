/**
 * @class Taco.view.paymentAndCheckout.RadioList
 * @author Michael Speed Elder
 * Date: 8/30/12
 * Time: 8:27 AM
 *
 *
 */

Ext.define('Taco.view.paymentAndCheckout.RadioList', {
    extend: 'Ext.container.Container',
    alias: 'widget.radiolist',
    layout: 'vbox',

    radioValue: '',
    radioName: '',
    radioBoxLabel: 'Default Box Label',
    radioDescription: 'Default text block explaining blah blah blah',

    initComponent: function () {
        var me = this;

        me.items = [{
            xtype: 'radio',
            name: me.radioName,
            inputValue: me.radioValue,
            boxLabel: me.radioBoxLabel
        }, {
            xtype: 'box',
            width: '100%',
            autoEl: 'p',
            html: me.radioDescription,
            margin: '0 0 20 0'
        }];

        me.callParent( arguments );
    },

    getBoxLabel: function () {
        return this.radioBoxLabel;
    }
});