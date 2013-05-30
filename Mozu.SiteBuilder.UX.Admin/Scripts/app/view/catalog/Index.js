/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.EditContainer'],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {
        this.mono = Ext.create('Ext.panel.Panel', {
            width: 1000,
            height: 400,
            padding: 39,
            border: true,
            style: {
                backgroundColor: 'white',
                border: '1px solid #bfbfbf'
            },
            items: [{
                xtype: 'component',
                html: 'hello world'
            }],
            dockedItems: [{
                xtype: 'container',
                dock: 'top',
                height: 50,
                border: '0 0 1',
                padding: '0 0 20',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                style: {
                    fontWeight: 'bold',
                    fontSize: '24px',
                    lineHeight: '30px',
                    color: '#323232',
                    borderWidth: '0px 0px 1px',
                    borderStyle: 'solid',
                    borderColor: '#bfbfbf'
                },
                items: [{
                    xtype: 'component',
                    html: 'Custom Panel',
                    flex: 1
                }, {
                    xtype: 'container',
                    itemId: 'actionsCt',
                    hidden: true,
                    layout: {
                        type: 'hbox',
                        defaultMargins: '0 0 0 10'
                    },
                    items: [{
                        xtype: 'taco.button',
                        text: 'Save',
                        handler: function () {
                            var toolbar = this.up('container[dock=top]');

                            if (toolbar) {
                                toolbar.toggleActions();
                            }
                        }
                    }, {
                        xtype: 'taco.button',
                        text: 'Cancel',
                        handler: function () {
                            var toolbar = this.up('container[dock=top]');

                            if (toolbar) {
                                toolbar.toggleActions();
                            }
                        }
                    }]
                }, {
                    xtype: 'button',
                    itemId: 'gear',
                    text: ' ',
                    menu: {
                        plain: true,
                        items: [{
                            text: 'lorem',
                            handler: function () {
                                var toolbar = this.up('container[dock=top]');

                                if (toolbar) {
                                    toolbar.toggleActions();
                                }
                            }
                        }, {
                            text: 'ipsum'
                        }]
                    }
                }],
                toggleActions: function () {
                    var tool = this.items.get('gear'),
                        actions = this.items.get('actionsCt');

                    if (tool.isHidden()) {
                        actions.hide();
                        tool.show();
                    } else {
                        actions.show();
                        tool.hide();
                    }
                }
            }],
        });

        this.thing = Ext.create('Taco.core.ux.EditContainer', {
            height: 400,
            width: 1000,
            title: 'Hello World',
            menu: {
                plain: true,
                shadow: true,
                items: [{
                    text: 'lorem',
                    handler: function () {
                        var ct = this.up('[isEditContainer]');
                        ct.
                        ct.toggleActions();
                    }
                }, {
                    text: 'ipsum'
                }]
            },
            tools: [{
                xtype: 'button',
                text: ' ',
                menu: {
                    plain: true,
                    shadow: false,
                    items: [{
                        text: 'Edit',
                        handler: function () {
                            var ct = this.up('[isEditContainer]');
                            ct.toggleActions();
                        }
                    }]
                }
            }],
            actions: [{
                xtype: 'taco.button',
                text: 'Cancel',
                handler: function () {
                    var ct = this.up('[isEditContainer]');
                    ct.toggleActions();
                }
            }],
            items: [{
                xtype: 'component',
                html: 'what'
            }]
        });

        Ext.apply(this.body, {
            items: [this.thing]
        });

        this.callParent(arguments);
    }
});