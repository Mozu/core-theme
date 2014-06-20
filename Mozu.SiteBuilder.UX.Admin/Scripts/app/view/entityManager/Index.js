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

    contextConfig: {
        supportedLevels: ['t', 'm', 'c', 's']
    },

    layout: {
        type: 'hbox',
        align:'stretch'
    },
    initComponent: function () {
        var me = this;

        me.editors = Taco.core.data.StoreManager.getOrCreate('Taco.store.EntityEditors');

        me.lists = Ext.create('Taco.view.entityManager.Lists', {
            listeners: {
                select: function (tree, record) {
                    var entityType = record.parentNode.getId(),
                        listName = entityType == 'mzdb' ? record.raw.metaData.nameSpace + '.' + record.raw.metaData.name :  record.raw.metaData.name;
                    
                    me.gridContainer.removeAll();
                    var store= Ext.create('Taco.store.Entities', {
                        listName: listName,
                        entityType: entityType
                    });
                    store.load({
                        callback:function () {
                            
                            me.grid = Ext.create('Taco.view.entityManager.Grid', {
                                store: store,
                                listType:record.raw.metaData.documentTypes ? 'cms':'mzdb',
                                listMetaData: record.raw.metaData,
                                bubbleEvents :['cellclick','create']
                            });
                            me.gridContainer.add(me.grid);
                            
                        }
                    });
                }
            }
        });
        
        me.gridContainer = Ext.widget('container', {
            flex: 1, layout: 'fit' ,
            listeners: {
                cellclick: me.onCellClick,
                create : me.onCreate,
                scope:this
            }
        });

        me.items = [
           me.lists,
            me.gridContainer
        ];


        me.callParent(arguments);
       
        //me.insertDocked(0, me.Lists);
    },
    onCreate:function () {
        var me = this,
            record = new Taco.model.Entity({
            entityListName: this.grid.listType =='cms'? null: this.grid.listMetaData.name,
            nameSpace: this.grid.listMetaData.nameSpace,
            documentListName: this.grid.listType == 'cms' ? this.grid.listMetaData.name : null,
            tenantId:Taco.app.context.getTenantId(),
            properties: {},
            item: {}


        });
        
        me.gridContainer.removeAll();
        me.grid = null;
        me.form = Ext.create('Taco.view.entityManager.DynamicFormContainer', {
            record: record,
            editor: me.editors.getById(record.get('entityListName')) || me.editors.getById(record.get('documentListName')) || me.editors.getById('default')
        });
        me.gridContainer.add(me.form);
       
    },
    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        var me = this,
            metaData = { id: record.getId() },
            header = view.getHeaderAtIndex(cellIndex);
        if (!header) {
            return;
        }

        me.gridContainer.removeAll();
        me.grid = null;
        me.form = Ext.create('Taco.view.entityManager.DynamicFormContainer', {
            record: record,
            editor: me.editors.getById(record.get('entityListName')) || me.editors.getById(record.get('documentListName')) || me.editors.getById('default')
    });
        me.gridContainer.add(me.form);
       
    },
   


});
