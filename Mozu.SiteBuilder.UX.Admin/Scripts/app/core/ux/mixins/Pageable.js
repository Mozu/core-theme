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

Ext.define('Taco.core.ux.mixins.Pageable', {
    requires: ['Taco.core.util.ExceptionWhiner',
        'Ext.toolbar.Paging'],
    constructor: function () {
        this.createGridPager();
    },
    createGridPager: function () {
        if (!this.store) {
            console.log("the store must be defined in the class before initializing the paging toolbar;");
            return;
        }

        this.gridPager = Ext.create('Ext.toolbar.Paging', {
            componentCls: 'x-grid-paging-toolbar',
            store: this.store,
            displayInfo: true,
            dock: 'bottom',
            inputItemWidth: 45,
            border: '0 1 1'
        });

        this.dockedItems = Ext.Array.clone(this.dockedItems || []);
        this.dockedItems.push(this.gridPager);

        return this.gridPager;
    }
});