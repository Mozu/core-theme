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
    alias: 'widget.entityManagerGrid',
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
        var me = this;


        me.editors = Taco.core.data.StoreManager.getOrCreate('Taco.store.EntityEditors');

        me.lists = Ext.create('Taco.view.entityManager.Lists', {
            listeners: {
                itemclick: function (tree, record) {


                    me.contentContainer.removeAll();

                    me.form = me.grid = null;
                    me.grid = Ext.create('Taco.view.entityManager.Grid', {
                        listMetaData: record.raw.metaData,
                        bubbleEvents: ['cellclick', 'create']
                    });
                    me.contentContainer.add(me.grid);
                    me.showHideButtons();

                }
            }
        });

        me.contentContainer = Ext.widget('container', {
            flex: 1,
            layout: 'fit',
            listeners: {
                cellclick: me.onCellClick,
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


        //me.insertDocked(0, me.Lists);
    },

    showHideButtons: function () {
        var me = this,
            header = this.getHeader();
        this.saveActionButton = this.saveActionButton || header.down('#saveActionButton');
        this.cancelActionButton = this.cancelActionButton || header.down('#cancelActionButton');
        this.createActionButton = this.createActionButton || header.down('#createActionButton');
        this.saveActionButton.setVisible(me.form);
        this.cancelActionButton.setVisible(me.form);
        this.createActionButton.setVisible(me.grid);

    },

    onCreate: function () {
        var me = this,
            record = new Taco.model.Entity({
                entityListName: this.grid.listMetaData.entityType == 'cms' ? null : this.grid.listMetaData.name,
                nameSpace: this.grid.listMetaData.nameSpace,
                documentListName: this.grid.listMetaData.entityType == 'cms' ? this.grid.listMetaData.name : null,
                tenantId: Taco.app.context.getTenantId(),
                properties: {},
                item: {}

            }),
            menu;
        if (this.grid.listMetaData.documentTypes && this.grid.listMetaData.documentTypes.length > 1) {
            menu = Ext.widget({
                xtype: 'menu',
                itemHandler: function (cmp) {
                    record.set('documentType', cmp.text);
                    me.loadEditor(record);
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
        me.loadEditor(record);


    },
    loadEditor: function (record) {
        var me = this;
        me.contentContainer.removeAll();
        me.grid = null;
        me.form = Ext.create('Taco.view.entityManager.DynamicFormContainer', {
            record: record,
            bubbleEvents: ['savesuccess', 'saveSuccess', 'savefailure'],
            editor: me.editors.getById(record.get('entityListName')) || me.editors.getById(record.get('documentListName')) || me.editors.getById('default')
        });
        me.contentContainer.add(me.form);
        me.showHideButtons();
    },
    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        var me = this,
            header = view.getHeaderAtIndex(cellIndex);
        if (!header) {
            return;
        }

        me.contentContainer.removeAll();
        me.grid = null;
        me.form = Ext.create('Taco.view.entityManager.DynamicFormContainer', {
            record: record,
            bubbleEvents: ['savesuccess', 'saveSuccess'],
            editor: me.editors.getById(record.get('entityListName')) || me.editors.getById(record.get('documentListName')) || me.editors.getById('default')
        });
        me.contentContainer.add(me.form);
        me.showHideButtons();
    }


});