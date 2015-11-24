/**
 * @class Taco.view.productRanking.Category
*/
Ext.define('Taco.view.productRanking.grid.Category', {
    extend: 'Taco.core.ux.grid.PagedMemoryGrid',
    requires: [
        'Taco.model.ProductRanking'
    ],

    //stylizes the grid for use inside of a subform
    ui: "subform-section",  // ""subform", "subform-subform", "subform-section", "subform-section-child" 

    title:"Categories",

    // adds border to the grid;
    bodyStyle: "border-width:1px",

    sorters: ['nameAndCode'],

    /*
     *  Controls whether the action column is added to the column collection.     
     */
    showActionsColumn: true,

    /*
     * the model you are displaying in the grid. this will be used to determine requiredBehaviors permissions.
     *  Example 
     *  requiredBehaviorsModel: 'Taco.model.CouponSet'
     */
    requiredBehaviorsModel: 'Taco.model.Category',

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
    deleteAllActionText: 'Remove All',

    deletePromptMsg: 'Are you sure you want to remove this?',

    deletePromptTitle: 'Remove',

    idProperty : 'category',

    model : 'Taco.model.Category',

    initComponent: function () {
        var me = this;
        var filters = this.record.get('filters');

        me.catStore = Ext.create('Taco.store.Categories', {
            autoLoad: true,
            listeners: {
                load: function(store) {
                    /*
                    *   Loads the existing categories into the grid's store
                    */
                    var existing = [];
                    if (filters.length === 0) { return; }
                    Ext.each(filters, function(filter) {
                        var categoryCode = filter.value;
                        var index = store.findBy(function(record) {
                            return record.get('categoryCode') === categoryCode;
                        });
                        if (index > -1) {
                            existing.push(store.getAt(index));
                        }
                    });
                    me.store.add(existing);
                }
            }
        });
        
        me.dockedItems = me.dockedItems || [];
        
        me.initQuickAddBar();

        me.callParent(arguments);

        me.addDocked(me.quickAddBar, 'top');

    },

    onQuickAdd: function () {

        var me = this,
            field = me.getQuickAddField(),
            records = field.getValueRecords();

        if (records.length === 0) { return; }

        records = Ext.Array.clean(records);

        me.store.add(records);

        field.clearValue();
        field.focus(false, 200);

    },

    getQuickAddField: function () {
        var me = this;
        if (!me.quickAddField) {
            me.quickAddField = Ext.create('Ext.ux.form.field.BoxSelect', {
                queryMode: 'local',
                allowBlank: true,
                editable: true,
                getStore: function() { return me.catStore; },
                store: me.catStore,
                lastQuery: '',
                valueField: 'id',
                multiSelect: false,
                typeAhead: true,
                hideTrigger: true,
                displayField: 'nameAndCode',
                flex: 1,
                triggerOnClick: false,
                margin: '0 10 0 0',
                listeners: {
                    scope: me,
                    specialkey: function (cmp, e) {
                        if (e.getKey() == e.ENTER) {
                            me.onQuickAdd();
                        }
                    },
                    select: me.onQuickAdd
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
            handler: me.launchCategoryModal,
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
    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchCategoryModal: function () {
        var me = this,
            treeStore = Taco.core.data.StoreManager.getCategoryTreeByCatalog();

        me.modal = Ext.create('Taco.view.category.Modal', {
            store: treeStore
        });

        me.modal.on({
            savesuccess: function (modal, values) {
                me.store.add(values);
            },
            scope: this
        });
    },
    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this;
        return [
            {
                xtype: 'gridcolumn',
                dataIndex: 'nameAndCode',
                text: 'Category',
                hideable: false,
                flex: 3,
                minWidth: 100,
                sortable: true
            }
        ];
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function (destroy) {

        this.callParent(arguments);
    }
});