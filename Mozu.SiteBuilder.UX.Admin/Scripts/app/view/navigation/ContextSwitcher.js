/**
 * @class Taco.view.navigation.ContextSwitcher
 * @author Jimmy Sanford, Michael Speed Elder
 * 
 */
Ext.define('Taco.view.navigation.ContextSwitcher', {
    extend: 'Ext.container.Container',
    requires: ['Taco.view.navigation.ContextSwitcherView'],

    componentCls: Taco.baseCSSPrefix + 'context-switcher',

    width: 250, // TODO: Width needs to be set to be pushed right in an Hbox.  This is shitty.

    initComponent: function () {
        this.label = Ext.create('Ext.container.Container', {
            autoEl: {
                tag: 'div',
                cls: Taco.baseCSSPrefix + 'context-switcher-trigger',
                html: 'Context Switcher 9000 <span>&#9662;</span>' // &#9660
            }
        });

        this.list = Ext.create('Taco.view.navigation.ContextSwitcherView');

        this.items = [
            this.label,
            this.list
        ];

        this.callParent( arguments );

        this.on({
            afterrender: this.clickHandler,
            contextClicked: this.changeContexts,
            scope: this
        })
    },

    changeContexts: function (record, newValue) {
        Taco.app.context.setCurrentContext( record.raw );
        this.setValue( newValue );
    },

    /**
     * Handles toggling the "submenu" (ContextSwitcherView) of available contexts.
     */
    clickHandler: function () {
        this.getEl().on('click', function () {
            var list = this.list;

            if( !list.isVisible() ) {
                this.label.addCls('showing-list');
                list.showBy( this, 'tr-br', [-50, 0] );
            } else {
                this.label.removeCls('showing-list');
                list.hide();
            }
        }, this);
    },

    setValue: function ( newVal ) {
        this.label.update( newVal + '<span>&#9662;</span>' );
    }
});