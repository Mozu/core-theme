/**
 * @class Taco.core.ux.modal.Browser
 * @author Travis Johns
 * The Modal version of the Browser page, not to be confused with that other Browser Modal
 */

// Ext.define('Taco.core.ux.modal.BrowserModal', {
//     extend: 'Taco.core.ux.modal.Content',

//     autoShow: true,
//     fullHeight: true,
//     width: 800,

//     mixins: {
//         browsable: 'Taco.core.ux.browser.Browsable'
//     },

//     initComponent: function () {
//         this.content = this.body = {}
        
//         this.initBrowserConfig();

//         this.actions = {
//             items: [{
//                 xtype: 'primarybutton',
//                 listeners: {
//                     click: this.onSave,
//                     scope: this
//                 }
//             }, {
//                 xtype: 'secondaryaction',
//                 listeners: {
//                     click: this.onCancel,
//                     scope: this
//                 }
//             }]
//         };

//         this.callParent(arguments);

//         this.initBrowserListeners();
//     },

//     setMargins: function (forceWidth, forceHeight) {
//         return {
//             marginLeft: -(forceWidth || this.getEl().getWidth()) / 2,
//             marginTop: -(forceHeight || this.getEl().getHeight()) / 2 -10
//         };
//     },

//     onSave: function () {
//         if (this.fireEvent('beforesave', this)) {
//             this.hide();
//             this.fireEvent('save', this, this.gridPanel.getSelectionModel().getSelection());
//         }
//     },

//     onCancel: function () {
//         if (this.fireEvent('beforecancel', this)) {
//             this.hide();
//             this.fireEvent('cancel', this);
//         }
//     }
// })