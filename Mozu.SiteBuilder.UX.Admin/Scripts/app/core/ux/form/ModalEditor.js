/**
 * @class Taco.core.ux.form.ModalEditor
 */

// Ext.define('Taco.core.ux.form.ModalEditor', {
//     extend: 'Taco.core.ux.modal.Content',
//     mixins: {
//         editorwrapper: 'Taco.core.ux.form.EditorWrapper'
//     },

//     constructor: function (config) {
//         this.callParent(arguments);
//         this.mixins.editorwrapper.constructor.call(this, config);
//     },

//     initComponent: function () {
//         this.initWrapper();

//         this.body = {
//             items: [this.form]
//         };

//         this.header = {
//             actions: this.actions,
//             title: this.title
//         };

//         this.callParent(arguments);
//     }
// });