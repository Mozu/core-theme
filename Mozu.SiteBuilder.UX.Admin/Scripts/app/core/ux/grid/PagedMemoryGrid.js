/**
 * @class Taco.core.ux.grid.PagedMemoryGrid
  * A base class for grid panels that load their data locally and have support for client side paging.
  *         
            // Example of a two column side by side layout of two paged memory grids.  Note that you shoud use column layout not hbox. 
            // hbox layout causes a weird layout run error bug in the 4.2.2 version of extjs we are using. Column layout does not.
            {
                xtype: 'container',                
                layout:"column",
                items: [
                    Ext.create('Taco.core.ux.grid.PagedMemoryGrid', {
                        data: [],

                        model: "Taco.model.Channel",

                        //stylizes the grid for use inside of a subform
                        ui: "subform-section",  // ""subform", "subform-subform", "subform-section", "subform-section-child" 
                        
                        // adds border to the grid;
                        bodyStyle: "border-width:1px",

                        columnWidth: .5,

                        padding: "0 10 0 0",
                    }),
                    Ext.create('Taco.core.ux.grid.PagedMemoryGrid', {

                        data: [{
                            "name": "asdf",
                            "id": "asdf"
                        },{
                            "name": "asdf2",
                            "id": "asdf2"
                        }],

                        fields: ["name", "id"],

                        //stylizes the grid for use inside of a subform
                        ui: "subform-section",  // ""subform", "subform-subform", "subform-section", "subform-section-child" 

                        // adds border to the grid;
                        bodyStyle: "border-width:1px",
                        columnWidth: .5,
                        padding: "0 0 0 10",
                    })
                ]
            }


            // Example of a paged memory grid that has an increased pageSize. the grid will default to a height for 5 but grow in height until it hits 10 records and then will start paging.
            Ext.create('Taco.core.ux.grid.PagedMemoryGrid', {
                pageSize: 10
            })


  */
Ext.define('Taco.core.ux.grid.PagedMemoryGrid', {
    extend: 'Taco.core.ux.grid.Panel',

    requires: [
        'Taco.core.ux.store.PagingMemoryStore',        
        'Taco.core.ux.grid.plugins.AutoSelect'
    ],
    

    alias: 'widget.taco.pagedmemorygrid',

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid',
        pageable: 'Taco.core.ux.mixins.Pageable',
        searchable: 'Taco.core.ux.mixins.Searchable',
        gridcontextmenu: 'Taco.core.ux.mixins.GridContextMenu',
        actionColumn:'Taco.core.ux.mixins.ActionColumn'
    },
    
    /*
     *
     */
    title: "Paged Memory Grid",

    /*
     * // this will need to be adjusted to fit the row height based on number of pageSize. 275 is ideal for the default pageSize of 5
     */
    minHeight: 275,    

    /*
     *
     */
    showActionsColumn: true,

    
    /*
     *
     */
    enablePaging :true,

    /*
     *
     */
    pageSize: 5,

    /*
     *
     */
    autoHidePagingToolbar: true,


    /*
     * optional config that is applied to the store before instantiation.
     */
    storeCfg: {            
        
    },

    // if you want the entries into the store to be unique and non repeatable, you will need to set the idProperty to the unique code or id for the entity you are adding to the store.
    idProperty: null,

    fields: null,

    model: null,

    sorters: null,

    initComponent: function () {
        var me = this;
        me.dockedItems = me.dockedItems || [];
        me.mixins = me.mixins || [];
        
        this.tools = this.tools || [];

        this.columns = this.getColumnConfig();

        // testing code
        /*
        this.tools.push({
            xtype: "button",
            ui: "action",
            scale: "medium",
            text: "add",
            handler: function () {
                me.store.add({
                    name: "asdf " + Ext.Number.randomInt(0,100000000),
                    id: "asdf" + Ext.Number.randomInt(0, 100000000)
                })
            },
            scope: me
        }, {
            xtype: "button",
            ui: "action",
            scale: "medium",
            text: "add many",
            handler: function () {
                me.store.add(
                    [
                        { name: "name1", id: 1 },
                        { name: "name2", id: 1 },
                        { name: "name3", id: 2 },
                        { name: "name4", id: 3 },
                        { name: "name5", id: 4 },
                        { name: "name6", id: 5 },
                        { name: "name7", id: 6 }
                    ]
                )
            },
            scope: me
        })
        */

        // testing data
        this.data = this.data || [
            /*
            { name: "name1", id: 1 },
            { name: "name2", id: 1 },
            { name: "name3", id: 2 },
            { name: "name4", id: 3 },
            { name: "name5", id: 4 },
            { name: "name6", id: 5 },
            { name: "name7", id: 6 }
            */
        ];


        // needs to be a pagingMemoryStore. Cant pass in a store and have it work right.
        this.store = Ext.create('Taco.core.ux.store.PagingMemoryStore', this.getStoreConfig());

        // this plugin will auto select the first record in the grid and manage reselection of the selected item after a store load
        if (this.enableAutoSelect !== false) {
            this.plugins = this.plugins || [];
            this.plugins.push(Ext.create('Taco.core.ux.grid.plugins.AutoSelect'));
        }


        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);


        if (me.enablePaging) {
            // initialize the grid paging toolbar mixin
            this.mixins.pageable.constructor.apply(this);
        }

        
        if (this.showActionsColumn) {
            var actionColumn = this.getActionColumn();
            if (actionColumn) {
                this.columns.push(actionColumn);
            }
        }

        this.callParent(arguments);

        this.mixins.gridcontextmenu.constructor.apply(this);
    },    

    onDeleteSuccess: function () {
        var me = this;
                
        // if we are on some page other than the first page an you deleted the last record in the stores current page. we need to load the previous page
        if (me.store.count() === 0 && me.store.currentPage > 1) {
            me.store.loadPage(me.store.currentPage-1)
        }

    },

    getStoreConfig : function (){

        var storeCfg = {
            autoLoad: false,
            idProperty: this.idProperty,
            sorters: this.sorters,        
            data: this.data,
            pageSize: this.pageSize
        }

        storeCfg = Ext.apply(storeCfg, this.storeCfg);

        if (this.model) {
            var model;

            if (Ext.isString(this.model)) {
                model = Ext.ModelManager.getModel(this.model);
            } else if (this.model.isModel && this.model.isModel()) {
                model = this.model;
            }
            
            if (!model) {
                throw ("Model: " + this.model  + " was not found. Verify you have added the model in the requires for the view that is including this paged memory grid");
            }
            
            storeCfg.model = model

            // use the grids defined id property if one is provided otherwise try and pick it out of the model if one exists;
            if (model.prototype.idProperty) {
                storeCfg.idProperty = this.idProperty || model.prototype.idProperty
            }

        } else {
            // if no fields and no model need to default to something to keep the grid working;
            storeCfg.fields = (this.fields) ? this.fields : ["name"];
        }

        return storeCfg
    },

    getColumnConfig: function () {
        return [
            {
                //xtype: 'gridcolumn',
                dataIndex: 'name',
                stateId: 'name',
                text: 'Name',
                hideable: false,
                flex: 1,
                minWidth: 150,
                sortable: true
            }
        ]
    },

    getValues : function (){
        return this.store.getValues();
    },

    removeAll: function () {
        var me = this;
        //me.store.getProxy().data.items = [];
        me.store.removeAll();
        me.store.loadPage(1);
    },
});