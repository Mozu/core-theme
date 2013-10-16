/**
 * @class Taco.core.ux.modal.Helper
 */
// Ext.define('Taco.core.ux.modal.Helper', {
//     extend: 'Taco.core.ux.modal.Modal', 
//     alias: 'widget.helpermodal',
//     autoShow: true,
//     width: 600,

//     initComponent: function () {
        
//         var record = this.form.record;
//         var editors = this.form.editors;

//         if (this.form.editors.length > 0) {
//             this.form = Ext.create(this.form.editors[0]);
//             for (x = 1; x < editors.length; x++) {
//                 this.form.add(Ext.create(this.form.editors[x]));
//             }
//         }
        
//         this.form.loadRecord(record);

//         Ext.apply(this, {
//             content: {
//                 items: [this.form]
//             },
//             actions: {
//                 items: [{
//                     xtype: 'dirtybutton',
//                     dirtyState: true,
//                     text: 'OK',
//                     click: function () {
//                         this.form.update();
//                         this.hide();
//                     },
//                     scope: this
//                 }, {
//                     xtype: 'secondaryaction',
//                     text: 'Cancel',
//                     click: function () {
//                         this.hide();
//                     },
//                     scope: this
//                 }]
//             }
//         });

//         this.items = [this.form];

//         this.callParent(arguments);
//     }
// })