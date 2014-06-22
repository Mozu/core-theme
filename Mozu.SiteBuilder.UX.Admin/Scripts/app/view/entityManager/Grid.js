/**
 * @class Taco.view.order.Index
 */


Ext.define('Taco.view.entityManager.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.entityManagerGrid',
    requires: [
        'Taco.core.ux.form.Form'
    ],

    contextConfig: {
        supportedLevels: ['t','m','c','s']
    },

    launchEditorOnClick: false,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.TargetRule',

    enableNavHeader: false,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,


    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,

    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,



    showActionsColumn: true,

    hideSearchToolbar: false,
    selType: 'rowmodel',





    autoScroll: true,




    enableQuickFilters: false,

    advancedSearchConfig: {
        advancedFormCls: 'Taco.core.ux.form.Form',

        quickFilterData: [
           
        ]
    },




    stateful: false,

    //stateId: 'statefulOrderGrid',



    initComponent: function () {
        var me = this,
            collumnMap = {},
            fieldCount = 0,
            menu;

        me.defaultView = me.listMetaData.views[0];
        me.currentView = me.defaultView;
        this.initListView(me.currentView);


       


        //me.Lists = Ext.create('Taco.view.entityManager.Lists', { dock: 'left' });
        //me.dockedItems = me.dockedItems || [];
        //me.dockedItems.push(me.Lists);

        


        me.callParent(arguments);

        if (me.listMetaData.views.length > 0 ) {
            menu = Ext.widget('menu');
            Ext.Array.each(me.listMetaData.views, function (view) {
                menu.add({
                    text: view.name,
                    view: view,
                    handler: function (cmp) { me.initListView(cmp.view); }
                });
            });
            this.gridPager.insert(this.gridPager.items.getCount() - 2, '-');
            this.gridPager.insert(this.gridPager.items.getCount()-2,{
                text:'views',
                menu: menu
            });
            
        } 

        //me.insertDocked(0, me.Lists);
    },


    initListView: function (view) {
        var me = this,
            columns = [],
            store;
        if (me.listMetaData.entityType == 'cms') {
            columns.push({
                xtype: 'gridcolumn',
                dataIndex: 'id',
                renderer: function (value, metaData, record) {
                    return record.raw.name;

                },

                text: 'document name',
                flex: 1,
                width: 150,
            });
        }

        Ext.Array.each(view.fields, function (viewField) {
            columns.push({
                xtype: 'gridcolumn',
                dataIndex: viewField.name,
                renderer: function (value, metaData, record) {
                    var fields = record.get('fields');
                    if (fields) {
                        return fields[viewField.name];
                    }
                    return undefined;
                },
                text: viewField.name,
                flex: 1,
                width: 150,
            });
        });

        store = Ext.create('Taco.store.Entities', {
            listName: (me.listMetaData.nameSpace ? me.listMetaData.nameSpace + '.' : '') + me.listMetaData.name,
            entityType: me.listMetaData.entityType,
            autoLoad: true
        });

        if (me.rendered) {
            me.reconfigure(store, columns);
        } else {
            me.columns = columns;
            me.store = store;
        }
        
    },
    onCreate: function () {

        //do nothing
    },

    

    //launchLoadedEditor: function (record, options) {
    //    var complexMetaData = { record: record, options: options };

    //    if (this.reFetchRecordOnEdit) {
    //        delete complexMetaData.record;
    //    }

    //    Ext.defer(function () {
    //        Taco.core.StateManager.attemptNavigate(this.editorRoute + '/' + record.getId(), complexMetaData);
    //    }, 1, this);
    //},
    


});
