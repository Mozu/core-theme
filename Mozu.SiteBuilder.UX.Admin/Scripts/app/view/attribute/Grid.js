/**
 * @class Taco.view.discount.Grid
*/
Ext.define('Taco.view.attribute.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    requires: [
        'Taco.model.Attribute',
        'Taco.store.AttributesGrid',
        'Taco.view.attribute.AdvancedSearchForm',
        'Taco.view.attribute.Edit'
    ],

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
    },

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },
    
    launchEditorOnClick:true,
    
    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.Attribute',

    enableNavHeader: true,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: true,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: "Create New Attribute",

    showActionsColumn: true,

    hideSearchToolbar: false,
    
    title: "Attributes",

    store: { type: 'Taco.store.AttributesGrid' },  

    autoScroll: true,

    enableQuickFilters:false,

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.attribute.AdvancedSearchForm'
    },

    onCreate: Ext.emptyFn,

    stateful: true,

    stateId: 'statefulAttributesGrid',

    statics: {
        
    },
        
    initComponent: function () {
        var me = this;

        this.columns = this.getColumnConfig();

        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);
        
        me.callParent(arguments);
    },
    
    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this;
        return [
            {
                dataIndex: 'adminName',
                stateId: 'adminName',
                text: 'Administration Name',
                flex: 1,
                minWidth: 120
            }, {
                dataIndex: 'name',
                stateId: 'name',
                text: 'Name',
                flex: 1,
                minWidth: 120
            }, {
                dataIndex: 'id',
                stateId: 'id',
                hidden: true,
                sortable: false,
                text: 'ID',
                minWidth: 200
            }, {
                dataIndex: 'code',
                stateId: 'code',
                hidden: true,
                text: 'Code',
                minWidth: 200
            }, {
                dataIndex: 'inputType',
                stateId: 'inputType',
                sortable: false,
                text: 'Input Type',
                width: 130
            }, {
                text: 'Type',
                stateId: 'type',
                width: 200,
                sortable: false,
                renderer: function(value, metaData, record) {
                    var ret = [];
                    if (record.get('isOption')) {
                        ret.push('Option')
                    }
                    if (record.get('isExtra')) {
                        ret.push('Extra')
                    }
                    if (record.get('isProperty')) {
                        ret.push('Property')
                    }
                    return ret.join(', ');
                }
            }, {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuItems: [
                    {
                        text: 'Edit',
                        menuColumnHandler: 'editMenuColumnHandler',
                        scope: me
                    }, {
                        text: 'Delete',
                        // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                        menuColumnHandler: "deleteMenuColumnHandler",
                        //requiredBehaviors: {
                        //    model: 'Taco.model.Attribute',
                        //    behavior: 'delete'
                        //},
                        scope: me
                    }
                ]
            }
        ];

    },

    onItemClick: function (view, record, elm, index, e) {
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.launchEditor(record);
            Taco.app.StateManager.addState('attributes/edit/' + record.getId(), { id: record.getId() });
        }
    },

    doCreate : function (){
        var controller = "attributes";
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    },


    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('attributes/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
    }

});