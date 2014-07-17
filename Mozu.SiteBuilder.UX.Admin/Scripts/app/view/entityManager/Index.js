/**
 * @class Taco.view.order.Index
 */


Ext.define('Taco.view.entityManager.Index', {
    extend: 'Ext.panel.Panel',
    mixins: {
        //  editorwrapper: 'Taco.core.ux.form.EditorWrapper',
        navHeader: 'Taco.core.ux.mixins.NavHeader',
        permissions: 'Taco.core.ux.mixins.Permissions'
    },
    alias: 'widget.entityManager',
    requires: [
        'Taco.core.ux.form.Form',
        'Taco.view.entityManager.Lists',
        'Taco.store.EntityEditors',
        'Taco.view.entityManager.DynamicFormContainer',
        'Taco.core.data.StoreManager'
    ],
    title: 'Entity Manager',
    createButtonEnabled: true,
    contextConfig: {
        supportedLevels: ['t', 'm', 'c', 's']
    },
    enableNavHeader: true,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },

   
    doSave: function () {
        this.form.doSave.apply(this.form, arguments);
    },

    initComponent: function () {
        var me = this,
            metaData = Taco.core.StateManager.getCurrentState().metaData,
            qs = metaData.args[metaData.args.length - 1];

        me.additionalActions = [
            {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'More',
                margin: '0 0 0 10',
                itemId:'moreActionButton',
                scope: this,
                menu: {
                    plain: true,
                    shadow: false,
                    listeners: {
                        beforeshow: function (cmp) {
                            cmp.down('#publishActionButton').disable(!(me.listmetaData.enablePublishing && me.getCurrentEntityRecord().data.publishState == 'staging'));
                        },
                    },
                    items: [
                        {
                            text: 'Preview in Site',
                            itemId: 'previewActionButton',
                            
                            handler: function (menuItem) {
                                //scope is set to index on all action buttons by container.
                                var record = me.getCurrentEntityRecord(),
                                    siteId = Taco.app.context.getContextAtLevel('s').id;

                                url = "/cms/" + record.get('documentListName') + "/" + record.get('name');
                                window.open('/_gosite/' + Taco.app.context.getSiteId() + '?environment=live&redir=' + encodeURIComponent(url), 'taco-preview');
                            }
                        }, {
                            itemId: 'publishActionButton',
                            text: 'Publish',
                            
                            handler: function (menuItem) {
                                //scope is set to index on all action buttons by container.
                                alert('tbd');
                            }
                        }
                    ]
                }
            }
        ];
        me.editors = Taco.core.data.StoreManager.getOrCreate('Taco.store.EntityEditors');

        me.lists = Ext.create('Taco.view.entityManager.Lists', {
            listeners: {
                itemclick: function (tree, record) {
                    me.onOpenList(record);
                }
            }
        });

        me.contentContainer = Ext.widget('container', {
            flex: 1,
            layout: 'fit',
            listeners: {
                itemedit: me.onItemEdit,
                create: me.onCreate,

                savesuccess: me.saveSuccess,
                savefailure: me.saveFailure,
                render: me.showHideButtons,
                scope: this
            }
        });

        me.items = [
            me.lists,
            me.contentContainer
        ];


        if (this.enableNavHeader) {
            //initialize the content navigation toolbar.
            this.mixins.navHeader.init.apply(this);
        }


        me.callParent(arguments);

        if (qs.entityType && qs.list) {
            me.on('render', function () {

                var fn = function () {
                    var listRecord;
                    Ext.Object.each(me.lists.store.tree.nodeHash, function (k, v, obj) {
                        var md = v.raw.metaData;
                        if (md && qs.entityType == md.entityType && qs.list == md.name) {
                            listRecord = v;
                        }
                    });
                    if (listRecord) {
                        me.onOpenList(listRecord);
                        me.lists.getSelectionModel().select(listRecord);
                    }
                };
                if (me.lists.store.isLoading()) {
                    me.mon(me.lists.store, 'load', fn, { single: true });
                } else {
                    fn();
                }

            });
        }
        //me.insertDocked(0, me.Lists);
    },

    showHideButtons: function () {
        var me = this,
            header = this.getHeader();
        this.saveActionButton = this.saveActionButton || header.down('#saveActionButton');
        this.cancelActionButton = this.cancelActionButton || header.down('#cancelActionButton');
        this.createActionButton = this.createActionButton || header.down('#createActionButton');
        this.moreActionButton = this.moreActionButton || header.down('#moreActionButton');
        this.saveActionButton.setVisible(me.form);
        this.cancelActionButton.setVisible(me.form);
        this.createActionButton.setVisible(me.grid);
        this.moreActionButton.setVisible(me.getCurrentEntityRecord() && me.getCurrentEntityRecord().get('entityType') == 'cms');

    },

    getCurrentEntityRecord: function () {
        var me = this;
        return me.form ? me.form.record : null;
    },
    getListMetaData : function () {
        var me = this;
        return me.listmetaData;

    },

    onOpenList: function (record) {
        var me = this;

        if (!record.raw.metaData) {
            return;
        }

        me.listmetaData = record.raw.metaData;


        me.contentContainer.removeAll();

        me.form = me.grid = null;
        me.grid = Ext.create('Taco.view.entityManager.Grid', {
            listMetaData: record.raw.metaData,
            bubbleEvents: ['cellclick', 'create', 'itemedit']
        });
        Taco.core.StateManager.addState('entities?entityType=' + record.raw.metaData.entityType + '&list=' + record.raw.metaData.name);
        me.contentContainer.add(me.grid);
        me.showHideButtons();
    },
    onCreate: function () {
        var me = this,
            record = new Taco.model.Entity({
                listFQN: this.grid.listMetaData.listFQN,
                documentListName:  this.grid.listMetaData.listFQN || this.grid.listMetaData.name ,
                tenantId: Taco.app.context.getTenantId(),
                entityType: this.grid.listMetaData.entityType,
                documentType: this.grid.listMetaData.documentTypes && this.grid.listMetaData.documentTypes.length ? this.grid.listMetaData.documentTypes[0] : undefined,
                properties: {},
                item: {}

            }),
            menu;


        if (this.grid.listMetaData.documentTypes && this.grid.listMetaData.documentTypes.length > 1) {
            menu = Ext.widget({
                xtype: 'menu',
                itemHandler: function (cmp) {
                    record.set('documentType', cmp.text);
                    me.promptCmsName(record);
                }

            });
            Ext.Array.each(this.grid.listMetaData.documentTypes, function (dType) {
                menu.add({
                    text: dType,
                    handler: menu.itemHandler

                });
            });
            menu.showBy(me.createActionButton);
            return;

        }

        me.promptCmsName(record);


    },

    promptCmsName: function (record) {

       
        var me = this;
        me.loadEditor(record);
        //if (record.get('entityType') == 'cms') {
        //    Ext.Msg.prompt({
        //        title: 'File Name',
        //        msg: 'Please enter a file Name:  ',
        //        width: 300,
        //        buttons: Ext.Msg.OKCANCEL,
        //        multiline: true,
        //        fn: function (res, name) {
        //            if (res == 'ok') {
        //                record.set('name', name);
        //                me.loadEditor(record);
        //            }
        //        },
        //        //animateTarget: 'addAddressBtn',
        //        icon: Ext.window.MessageBox.INFO
        //    });
        //} else {
        //    me.loadEditor(record);
        //}
    },

    loadEditor: function (record) {
        var me = this;
        me.contentContainer.removeAll();
        me.grid = null;
        me.form = Ext.create('Taco.view.entityManager.DynamicFormContainer', {
            record: record,
            bubbleEvents: ['savesuccess', 'saveSuccess', 'savefailure'],
            editor: me.editors.findEditor(record)
        });
        me.contentContainer.add(me.form);
        me.showHideButtons();
    },
    onItemEdit: function (view, record) {

        var me = this;

        record.reload({
            success: function () {
                me.contentContainer.removeAll();
                me.grid = null;
                me.form = Ext.create('Taco.view.entityManager.DynamicFormContainer', {
                    record: record,
                    bubbleEvents: ['savesuccess', 'saveSuccess'],
                    editor: me.editors.findEditor(record)
                });
                me.contentContainer.add(me.form);
                me.showHideButtons();
            }
        });


    }


});