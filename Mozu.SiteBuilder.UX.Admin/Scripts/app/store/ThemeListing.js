/**
 * @class Taco.store.ThemeListing
 * @author Michael Speed Elder
 * Date: 8/20/12
 * Time: 3:59 PM
 *
 * The ThemeListing store
 */

Ext.define('Taco.store.ThemeListing', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.ThemeListing'
    // , autoLoad: true
    // , listeners: {
    //     load: function () {
    //         var model = this.findRecord('selected', true);
    //         if (model) {
    //             Ext.defer(function () {
    //                 if( this.getSelectionModel )
    //                     this.getSelectionModel().select([model], false, true);
    //             }, 1000, this);
    //         }
    //     }
    // }
});

// ORIGINAL FILE //

// this.store = Ext.create('Ext.data.Store', {
//     model: 'Taco.model.ThemeListing',
//     autoLoad: true,
//     listeners: {
//         load: function () {
//             var model = this.store.findRecord('selected', true);
//             if (model) {
//                 Ext.defer(function () {
//                     this.getSelectionModel().select([model], false, true);
//                 }, 1000, me);
//             }
//         },
//         scope: this
//     }
// });