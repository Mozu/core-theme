/**
 * @class Taco.view.productRanking.Keyword
*/
/**
 * @class Taco.view.productRanking.Keyword
*/
Ext.define('Taco.view.productRanking.grid.Keyword', {
    extend: 'Taco.core.ux.grid.PagedMemoryGrid',
    requires: [
        'Taco.model.ProductRanking'
    ],

    //stylizes the grid for use inside of a subform
    ui: "subform-section",  // ""subform", "subform-subform", "subform-section", "subform-section-child" 

    title:"Keywords",

    // adds border to the grid;
    bodyStyle: "border-width:1px",

    sorters: ["keyword"],

    /*
     *  Controls whether the action column is added to the column collection.     
     */
    showActionsColumn: true,

    /*
     * the model you are displaying in the grid. this will be used to determine requiredBehaviors permissions.
     *  Example 
     *  requiredBehaviorsModel: 'Taco.model.CouponSet'
     */
    requiredBehaviorsModel: "",

    /* 
     *show the default edit action in the actions and context menu;
     */
    enableEditAction: false,

    /* 
     *show the default delete action in the actions and context menu;
     */
    enableDeleteAction: true,

    /* 
     *show the default delete action in the actions and context menu;
     */
    enableDeleteAllAction: true,

    // often overwritten as Remove All or Delete All.
    deleteAllActionText: "Remove All",

    deletePromptMsg: "Are you sure you want to remove this?",

    deletePromptTitle: "Remove",

    idProperty : "keyword",

    model : "Taco.model.KeywordModel",

    initComponent: function () {
        var me = this;

        me.getSelectionModel().preventFocus = true;
        
        // should consider putting this in the model folder if this is going to become 
        var keywordModel = Ext.define('Taco.model.KeywordModel', {
            extend: 'Ext.data.Model',
            fields: [{
                name: 'keyword',
                type: 'string'
            }],
            idProperty: 'keyword'
        });        

        this.data = this.record.get('keywordObjects')
        
        me.dockedItems = me.dockedItems || [];        
        
        me.initQuickAddBar();

        me.callParent(arguments);


        me.addDocked(me.quickAddBar, 'top');

    },

    onQuickAdd: function () {

        var me = this,
            field = this.getQuickAddField(),
            value = field.getValue().trim(),
            valueArray = (value) ? value.split(/[,]+/) : [],
            recordsToAdd =[],

        valueArray = Ext.Array.clean(valueArray);
        if (valueArray.length === 0) {
            return;
        }

        Ext.Array.each(valueArray, function(val) {
            recordsToAdd.push({ 'keyword': val });
        });

        if (recordsToAdd.length === 0) {
            field.reset();
            field.focus(false, 200);
        }

        var addedRecords = this.getStore().add(recordsToAdd);
        field.reset();
        field.focus(false, 200);
    },

    getQuickAddField: function () {
        var me = this;
        if (!me.quickAddField) {
            me.quickAddField = Ext.widget({
                xtype: 'textfield',
                flex: 1,
                margin: '0 10 0 0',
                emptyText: 'Type Keywords Here',
                listeners: {
                    scope: me,
                    specialkey: function (field, e) {
                        if (e.getKey() == e.ENTER) {
                            me.onQuickAdd();
                        }
                    }
                }
            });
        }
        return me.quickAddField;
    },

    initQuickAddBar: function () {
        var me = this;

        me.quickAddButton = Ext.widget({
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Add',
            handler: me.onQuickAdd,
            scope: me
        });

        me.quickAddBar = Ext.create('Ext.toolbar.Toolbar', {
            dock: 'top',
            layout: 'hbox',
            cls: 'taco-content-navcontainer-white',
            padding: {
                top: 0,
                left: 0,
                right: 0,
                bottom:5
            },
            items: [
                me.getQuickAddField(),
                me.quickAddButton
            ]
        });

    },
    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this;
        return [
            {
                xtype: 'gridcolumn',
                dataIndex: 'keyword',
                text: 'Keyword',
                hideable: false,
                flex: 3,
                minWidth: 100,
                sortable: true
            }, {
                xtype: 'taco.menucolumn',
                flex: 1,
                menuItems: [
                    {
                        text: 'Remove',
                        itemId: 'removeMenuItem',
                        // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                        menuColumnHandler: 'deleteMenuColumnHandler',
                        //requiredBehaviors: {
                        //    model: 'Taco.model.Discount',
                        //    behavior: 'delete'
                        //},
                        scope: me
                    }, {
                        text: 'Remove All',
                        itemId: 'removeAllMenuItems',
                        menuColumnHandler: function() {
                            me.store.removeAll();
                        },
                        scope: me
                    }
                ]
            }
        ];
    },


    // itereate all of the rcords and pluck out just the keyword members and push them into an array.
    getValues: function () {
        var me = this,
            values = this.callParent(arguments);

        return Ext.Array.map(values, function (row) {
            return row.get('keyword');
        }, this);
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function (destroy) {

        this.callParent(arguments);
    }
});
