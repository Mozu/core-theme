
/**
 * @class Taco.view.storefrontProduct.modal.StorefrontProductModal
 */

Ext.define('Taco.view.storefrontProduct.modal.StorefrontProductModal', {
    extend: 'Taco.core.ux.window.Modal',

    requires: [
        'Taco.view.storefrontProduct.Grid'
    ],

    // this should really be the default;
    closeAction: 'destroy',

    autoShow: true,
    closable: true,
    scale: 'large',
    title: 'Products Preview',
    createType: '',
    isCreateMode: true,
    record: null,
    closeOnSave: true,

    actionColumnWidth: 50,

   /* resizable: {
        dynamic: true,
        handles: 'w sw s se e',
        heightIncrement: 1,
        minHeight: 600,
        minWidth: 800,
        preserveRatio: false,
        widthIncrement: 1
    },*/
    
    initComponent: function (eOpts) {
        var me = this;

        this.layout = {
            type: 'fit'
        };
        
        // Todo: Need to listen for a navigation (via backbutton) and cancel the navigation if editor is dirty or prompt user to cancel and navigate.
        // Todo: Create override/mixin/plugin for Ext.Window to add support for relative height and width with min max values.

        /*this.titleTemplate = new Ext.XTemplate(
            '{editType} {couponSetType} Coupon Set'
        );*/

        /*this.title = this.titleTemplate.apply({
            editType: me.isCreateMode ? 'Create' : 'Edit',
            couponSetType: me.record ? me.record.get('couponSetType') : me.createType
        });*/

        //onBeforeClose
        //me.mon(me, 'beforecancel', me.onBeforeCancel);
        //me.mon(me, 'beforesave', me.onBeforeSave);

        this.initUi();
        this.callParent(arguments);
        
        /*if (this.isCreateMode) {
            this.managePanelsOnCreate(false, 'Save & Continue', false);  //has to be after parent call
        }*/
    },

    initUi : function() {

        this.items = this.items || [];
        this.grid = Ext.create('Taco.view.storefrontProduct.Grid', {
                header: true
        });
        this.items.push(this.grid);
    },

    doSave: function() {

        this.saveSuccess({
            WayneIsAwsome: true //TODO: 
        });
    },
    

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy : function (destroy) {
        this.callParent(arguments);
    }
});
