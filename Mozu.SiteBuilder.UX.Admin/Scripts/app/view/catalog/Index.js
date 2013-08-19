/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.window.WindowWithActions',
        'Overrides.panel.Tool'
    ],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {
        var me = this,
            modal, modaless, uibtns, bodyScrollListener;

        modal = Ext.create('Taco.core.ux.window.WindowWithActions', {
            title: 'Shipping Settings',
            primaryText: 'Yes, save changes',
            secondaryText: 'No, don\'t save',
            items: [{
                xtype: 'component',
                height: 1200,
                html: 'This is where more text would go.'
            }]
        });

        modaless = Ext.create('Taco.core.ux.window.Window', {
            title: 'Shipping Settings',
            scale: 'small',
            items: [{
                xtype: 'component',
                html: 'Hello world! Lorem ipsum dolor sit amet...'
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
                handler: Ext.bind(me.launchModal, me, ['modal'])
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
                        text: 'Preview',
                        handler: Ext.bind(me.launchModal, me, ['modaless'])
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
        this.modaless = modaless;
    },

    launchModal: function (type) {
        var modal = this[type];

        modal.show();
    }
});
