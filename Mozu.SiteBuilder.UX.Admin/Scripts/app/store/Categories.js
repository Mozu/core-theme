/**
* @class Taco.store.Categories
* @author Jason Cochran
* The Categories store
*/


    Ext.define('Taco.store.Categories', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Category'
        //,
        //pathSetFn: function(store, records, successFul) {
          
        //    store.each(function(item) {
        //        var parentId = item.get('parentId');
        //        if (parentId) {
        //            item.set('parent', store.getById(parentId));
        //        }
        //    });

        //    store.each(function(item) {
        //        var parent, arr = [], pathString = "";

        //        while (true) {
        //            parent = item.get('parent');
        //            if (parent && arr.indexOf(parent) == -1) {
        //                arr.push(parent);
        //            } else {
        //                break;
        //            }
        //        }
        //        arr.reverse();
        //        Ext.each(arr, function(ansestor) {
        //            pathString += '/' + ansestor.get('name');
        //        });
        //        item.set('path', pathString);

        //    });

        //},
            
            
        //constructor:function () {

        //    this.callParent(arguments);
        //    this.on('load', this.pathSetFn);
        //} 
    });
