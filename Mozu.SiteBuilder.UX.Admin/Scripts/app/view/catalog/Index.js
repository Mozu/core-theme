/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.window.WindowWithActions'
    ],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {
        var me = this,
            modal, uibtns;

        modal = Ext.create('Taco.core.ux.window.WindowWithActions', {
            autoShow: false,
            height: 400,
            width: 400,
            title: 'More Actions',
            primaryText: 'Go',
            secondaryText: 'Don\'t Go',
            items: [{
                xtype: 'component',
                html: 'This is where more text would go.'
            }]
        });

        uibtns = Ext.create('Ext.Container', {
            layout: {
                type: 'hbox',
                defaultMargins: '5'
            },
            items: [{
                xtype: 'button',
                frame: false,
                scale: 'medium',
                ui: 'action',
                text: 'Cancel'
            }, {
                xtype: 'button',
                frame: false,
                scale: 'medium',
                ui: 'action-primary',
                text: 'Save',
                handler: Ext.bind(me.launchModal, me)
            }, {
                xtype: 'button',
                frame: false,
                scale: 'medium',
                ui: 'action',
                text: 'More',
                menuAlign: 'tr-br?',
                menu: {
                    plain: true,
                    shadow: false,
                    items: [{
                        text: 'Preview'
                    }, {
                        text: 'Delete'
                    }]
                }
            }, {
                xtype: 'splitbutton',
                frame: false,
                scale: 'medium',
                ui: 'action-primary',
                text: 'Select',
                menuAlign: 'tr-br?',
                menu: {
                    plain: true,
                    shadow: false,
                    items: [{
                        text: 'Select all'
                    }, {
                        text: 'Select all but this'
                    }]
                }
            }]
        });

        // put it all together
        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            layout: 'auto',
            items: [uibtns]
        });

        this.callParent(arguments);

        this.modal = modal;
    },

    launchModal: function () {
        var modal = this.modal;

        modal.show();
    }
});
