/**
 * @class Taco.view.product.subform.OverrideContainer
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.OverrideContainer', {
    extend: 'Ext.container.Container',
    // extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.override',

    componentCls: Taco.baseCSSPrefix + 'override-container',
    // style: {
    //     '-webkit-justify-content': 'flex-start'
    //     display: ''
    // },

    width: '100%',

    initComponent: function () {
        // *** Extend the defaults with any configured in; otherwise, use the presets defined in the target object
        this.defaults = Ext.apply({
            xtype: 'textfield',
            labelAlign: 'top',
            labelSeparator: '',
            width: '100%'
        }, this.defaults || {});


        // *** Prepend "Override globals" checkbox to items collection
        this.items.unshift({
            xtype: 'checkbox',
            width: 'auto',
            boxLabel: 'Override global',
            labelAlign: 'right',
            labelSeparator: '',
            cls: Taco.baseCSSPrefix + 'override-checkbox'
        });

        this.callParent( arguments );
    }
});