/**
 * @class Taco.view.website.entityAdapters.ProductEntityAdapter
 */
// Ext.define('Taco.view.website.entityAdapters.ProductEntityAdapter', {

//     extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
// 	allowedActions:{copy:false,preview:true,destroy:false},
//     modelName: 'Taco.model.Product',
//     getStore: function () {
//         return this.editor.products;
//     },

//     isHidden: function () {
//         return !this.get().get('isActive');
//     },
//     setHidden: function (hide) {
//         this.get().set('isActive', !hide);
//     },

//     getId: function () {
//         return this.pageProps.pageContext.productCode;
//     },

//     doFormView: function () {
//         Taco.core.StateManager.attemptNavigate('products/edit/' + this.get().getId());
//     },




//     getPageSettings: function () {
//         var me = this;
//         return [
//             {
//                 panelCls: 'Taco.view.website.settings.General',
//                 getRecord: function () {

//                     return me.get().getProductInSite();
//                 }
//             },
//             //{
//             //    panelCls: 'Taco.view.website.settings.Templates',
//             //    getRecord: function () {
//             //        return me.get().getProductInSite();
//             //    }
//             //},
//             {
//                 panelCls: 'Taco.view.website.settings.Seo',
//                 getRecord: function () {
//                     return me.get().getProductInSite();
//                 }
//             }];
//     }

// });