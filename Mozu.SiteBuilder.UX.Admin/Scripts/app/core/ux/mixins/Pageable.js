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
                this.mixins.pageable.constructor.apply(this, arguments);

                this.callParent(arguments)
            }

        < ... code fragment ... >
 *
 */

Ext.define('Taco.core.ux.mixins.Pageable', {
    requires: ['Taco.core.util.ExceptionWhiner'],
    constructor : function () {
        this.createGridPager()
    },
    createGridPager: function () {
        if (!this.store) {
            console.log("the store must be defined in the class before initializing the paging toolbar;")
            return;
        }

        this.gridPager = Ext.create('Taco.core.ux.grid.Pager', {
            store: this.store
        });

        var dockedItems = this.dockedItems || [];
        dockedItems.push(this.gridPager);

        return this.gridPager;
    }
});