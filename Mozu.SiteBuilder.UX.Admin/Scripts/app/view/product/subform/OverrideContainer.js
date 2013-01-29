/**
 * @class Taco.view.product.subform.OverrideContainer
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.OverrideContainer', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.container.Container',
        'Ext.form.field.Checkbox'
    ],
    alias: 'widget.override',

    componentCls: Taco.baseCSSPrefix + 'override-container',

    width: '100%',

    initComponent: function () {
        var me = this;

        // *** Extend the defaults with any configured in; otherwise, use the presets defined in the target object
        // *** NOTE: this.defaults is passed on to the subitems for convenience.
        this.defaults = Ext.apply({
            xtype: 'textfield',
            labelAlign: 'top',
            labelSeparator: '',
            width: '100%'
        }, this.defaults || {});

        // *** 'subitems' are items of child Container
        this.subitems = this.items;

        this.items = [{
            xtype: 'checkbox',
            width: 'auto',
            boxLabel: 'Override global',
            labelAlign: 'right',
            cls: Taco.baseCSSPrefix + 'override-checkbox',
            handler: function (checkbox, isChecked) {
                if( isChecked ) {
                    me.enable();
                } else {
                    me.disable();
                }
            }
        }, {
            xtype: 'container',
            width: "100%",
            items: this.subitems,
            defaults: this.defaults
        }];

        this.callParent( arguments );
    },

    /**
     * @override Ext.container.Container.disable
     *
     * Call disable method of child container to prevent checkbox of Override Container from being disabled.
     */
    disable: function ( silently ) {
        this.down('container').disable( silently );
    },

    /**
     * @override Ext.container.Container.enable
     *
     * Call enable method of child container, since Override Container should not be disabled in any circumstance.
     */
    enable: function ( silently ) {
        this.down('container').enable( silently );
    }
});