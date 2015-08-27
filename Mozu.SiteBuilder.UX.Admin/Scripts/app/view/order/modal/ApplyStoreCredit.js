///**
// * @class Taco.view.order.modal.ApplyStoreCredit
// */


//Ext.define('Taco.view.order.modal.ApplyStoreCredit', {
//    extend: 'Taco.core.ux.window.Modal',
//    requires: [
//        'Taco.model.StoreCredit',
//        'Taco.store.StoreCredits',
//        'Taco.core.ux.form.DateTime',
//        'Taco.core.ux.form.CurrencyField'
//    ],

//    scale: 'large',
//    title: 'Apply Store Credit',
//    models: ['Taco.model.StoreCredit'],

//    initComponent: function () {
//        var me = this;

        
//        this.callParent(arguments);
//    },

//    /**
//     * Show the loading mask while we wait for the service to respond with the draft record.
//     */
//    show: function() {
//        this.callParent(arguments);


//        if (!this.store) {
//            this.loadCreditsStore();
//            return;
//        }

//        if (this.store.isLoading()) {
//            return;
//        }
//        if (this.store.isLoaded()) {
//            this.onLoadStore();
//        }
//        else {
//            this.loadCreditsStore();
//        }
//    },

//    /**
//     * Call the service and get an updated credits store.
//     */
//    loadCreditsStore: function () {
//        var me = this,
//            customerId = me.record.get('customerId');
        
//         var mask = me.setLoading({
//             msg: "Loading",
//             // making the initial loading mask white to avoid the screen flash
//             //maskCls: "x-mask taco-white-mask"
//         }, me.body);

//        this.store = Taco.store.StoreCredits.createForCustomer(customerId);
//        this.store.load({
//            callback: function(records, operation) {
//                if (operation.success) {
//                    me.onLoadStore();
//                }
//                else {
//                    Taco.app.fireEvent('setmessage', "Error loading customer credits.", 'error');
//                    me.setLoading(false, this.body);
//                }
//            }
//        });
//    },

//    // when the draft record has loaded create and add the total and grid and hide the loading mask;
//    onLoadStore: function() {
//        var me = this;
        
//        this.setLoading(false, this.body);
//    },

//});
