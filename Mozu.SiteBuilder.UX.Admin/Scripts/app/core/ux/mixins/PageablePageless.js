/**
 * @class Taco.core.ux.mixins.Pageable 
 * Grid Mixin that provides custom paging toolbar
 * add this to the initComponent of your grid to initilize this mixin
  
    // to include this mixin in your class:

        mixins: {
            pageable: 'Taco.core.ux.mixins.Pageable'
        },

    
    // to initialize the mixing

        < ... code fragment ... >

            initComponent: function (){

                //initialize the grid paging toolbar
                this.mixins.pageable.constructor.apply(this);

                this.callParent(arguments)
            }

        < ... code fragment ... >
 *
 */

Ext.define('Taco.core.ux.mixins.PageablePageless', {
    requires: ['Taco.core.util.ExceptionWhiner',
        'Taco.core.ux.grid.LinkPaging',
        'Taco.core.ux.grid.PagelessPaging'],

    autoHidePagingToolbar: false,

    constructor: function () {
        this.createGridPager();
    },
    createGridPager: function () {
        var me = this;

        if (!this.store) {
            console.log("the store must be defined in the class before initializing the paging toolbar;");
            return;
        }

        this.gridPager = Ext.create('Taco.core.ux.grid.PagelessPaging', {
            componentCls: 'x-link-paging-toolbar',
            width: '100%',
            store: this.store,
            displayInfo: true,
            grid: me,
            inputItemWidth: 45
        })
        

        this.gridPagerContainer = Ext.create('Ext.toolbar.Toolbar', {
            dock: 'bottom',
            width: '100',
            items: [
                this.gridPager
            ]
        });

        if (me.autoHidePagingToolbar) {
            me.mon(me.store, "load", me.updatePagingToolbarVisibility, me);
            me.mon(me.store, "add", me.updatePagingToolbarVisibility, me);
            me.mon(me.store, "remove", me.updatePagingToolbarVisibility, me);

            if (me.store.hasLoaded() && !me.store.isLoading()) {
                me.updatePagingToolbarVisibility();
            }

            
            
        }

        this.dockedItems = Ext.Array.clone(this.dockedItems || []);
        this.dockedItems.push(this.gridPagerContainer);

        return this.gridPager;
    },
    updatePagingToolbarVisibility: function () {
        var me = this;        
        if (me.store.pageSize >= me.store.getTotalCount()) {
            me.gridPager.hide();
        } else {
            me.gridPager.show();
        }
    }

});