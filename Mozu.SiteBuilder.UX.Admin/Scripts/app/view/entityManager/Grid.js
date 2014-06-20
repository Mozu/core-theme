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

    enableNavHeader: true,

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
            [{ orderStatus: 'Open' }, 'Open Orders'],
            [{ paymentstatus: 'Paid', fulfillmentStatus: 'NotFulfilled' }, 'Paid, Pending Fulfillment Orders'],
            [{ fulfillmentStatus: 'Fulfilled' }, 'Fulfilled Orders'],
            [{ orderStatus: 'Cancelled' }, 'Cancelled Orders'],
            [{}, 'All Orders']
        ]
    },




    stateful: false,

    //stateId: 'statefulOrderGrid',



    initComponent: function () {
        var me = this,
            collumnMap = {},
            fieldCount = 0;

        
        this.store.each(function (record) {
            var fields = record.get('fields') || {};

            Ext.Object.each(fields || {}, function (key,value) {
                var hidden = true;
                if (!collumnMap[key]) {
                    if (fieldCount < 8 && !Ext.isArray(value) && !Ext.isObject(value)) {
                        hidden = false;
                        fieldCount++;
                    }
                   
                    collumnMap[key] = {
                        xtype: 'gridcolumn',
                        dataIndex: key,
                        renderer:function (value,metaData,record) {
                            var fields = record.get('fields');
                            if (fields) {
                                return fields[key];
                            }
                            
                        },
                        hidden:hidden,
                        text: key,
                        flex: 1,
                        width: 150,
                    }
                }
            });

        }, this);
        this.columns = [];
        if (this.store.entityType == 'cms') {
            this.columns.push({
                xtype: 'gridcolumn',
                dataIndex: 'id',
                renderer: function (value, metaData, record) {
                    return record.raw.name;

                },
          
                text: 'name',
                flex: 1,
                width: 150,
            });
        }

        Ext.Object.each(collumnMap, function (key) {
            this.columns.push(collumnMap[key]);
        }, this);
        //me.Lists = Ext.create('Taco.view.entityManager.Lists', { dock: 'left' });
        //me.dockedItems = me.dockedItems || [];
        //me.dockedItems.push(me.Lists);

        me.callParent(arguments);
       
        //me.insertDocked(0, me.Lists);
    },

    onCreate: function () {

        
    },

    

    launchLoadedEditor: function (record, options) {
        var complexMetaData = { record: record, options: options };

        if (this.reFetchRecordOnEdit) {
            delete complexMetaData.record;
        }

        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate(this.editorRoute + '/' + record.getId(), complexMetaData);
        }, 1, this);
    },
    


});
