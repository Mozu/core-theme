/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.window.WindowWithActions',
        'Taco.overrides.panel.Tool'
    ],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {        


        var me = this,
            modal, modaless, uibtns, bodyScrollListener;


        modal = Ext.create('Taco.core.ux.window.WindowWithActions', {
            title: 'Shipping Settings',
            draggable: true,
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

        panel = Ext.create('Ext.panel.Panel', {
            ui: 'subform',
            title: 'Subform',
            closable: true,
            bodyPadding: '20 0',
            header: {
                layout: {
                    type: 'hbox',
                    align: 'middle',
                    alignRoundingMethod: 'ceil'
                }
            },
            items: [{
                xtype: 'component',
                html: 'Hello world'
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
                }, {
                    xtype: 'datetime',
                    fieldLabel: 'Datetime',
                    value: new Date()
                }, {
                    xtype: 'datefield',
                    fieldLabel: 'Datefield',
                    value: new Date()
                }]
        });

        // put it all together
        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            layout: 'auto',
            items: [uibtns, panel]
        });

        this.callParent(arguments);

        this.modal = modal;
        this.modaless = modaless;
    },
        
        this.thomStore.loadData(window.theData);
        window.model1 = this.thomStore.getAt(0);
        window.model2Store = this.thomStore.getAt(0).getModel2s();
        window.model3Store = window.model2Store.getAt(0).getModel3s();
        window.model3s = window.model3Store.getAt(0);

    },
    doIt: function (senario) {
        var newData = Ext.clone(window.theData);
        if (senario == 1) {
            newData[0].model2s[0].name = theData[0].model2s[0].name + new Date().getTime();
        }
        if (senario == 2) {
            newData[0].model2s[0].model3s[0].name = theData[0].model2s[0].model3s[0].name + new Date().getTime();
        }
        window.model1.set(newData[0]);
        //this.thomStore.loadData(newData);
    },
    launchModal: function (type) {
        var modal = this[type];

        modal.show();
    }
});