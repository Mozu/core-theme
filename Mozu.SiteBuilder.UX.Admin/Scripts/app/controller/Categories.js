/**
* @class Taco.controller.Categories
* @author Jason Cochran
* The Category controller
*/
Ext.define('Taco.controller.Categories', {
    extend: 'Taco.core.Controller',
    requires:['Taco.view.category.Edit'],
    editorView: 'Taco.view.category.Edit',
    listView: null,
    models: ['Category'],
    views: ['category.Index', 'category.Index'],
    stores: ['Categories']
    //modelName: 'Category',
    //contextPlaceholders: {
    //    tc: function () {
    //        return Ext.create('Taco.core.ux.content.Container', {
    //            header: {
    //                title: "choose a site"
    //            },

    //            body: {
    //                layout: 'auto',
    //                items: [{
    //                    html: 'placeholder for choose site  interstitial '
    //                }]
    //            }
    //        });
    //    }
    //}

    //init: function () {

    //    var me = this;
    //    this.control({
    //        'contentheader': {
    //            newcategory: function () {
    //                me.loadEditor();
    //            }
    //        }
    //    });
    //},

    //index: function () {
    //    this.createContentView('Taco.view.category.Index');
    //},

    //edit: function (params) {
    //    var id = isNaN(params) ? ("id" in params ? params.id : params.args[0]) : params;
    //    this.createContentView('Taco.view.category.Index', {editRecordId: id});
    //},

    //createEditor: function (id) {
    //    return Ext.create('Taco.view.category.Edit', id ? {
    //        recordId: id
    //    } : {});
    //}
});