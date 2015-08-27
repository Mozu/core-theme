StartTest(function (t) {


    var m = {};
    window.m = m;
   
    t.chain(
        function (n) {
            t.requireOk('Taco.model.Entity', 'Taco.store.Entities', 'Taco.view.entityManager.Grid','Taco.view.entityManager.Lists','Taco.view.entityManager.Index', n);

        },
        function (n) {
            Taco.app.context.setCurrentSite(Taco.app.context.masterCatalogs[0].sites[0].id);
            n();
        },
         function (n) {
         
             m.index = Ext.create('Taco.view.entityManager.Index');
             Taco.app.contentView.removeAll();
                Taco.app.contentView.add(m.index);
         }

        //function(n){
        //    //  debugger;
        //    m.store = Ext.create('Taco.store.Entities', {
        //        listName: 'phipps.people',
        //        entityType: 'mzdb'
        //    });
        //    m.store.load({
        //        callback: n,
        //        scope: this
        //    });

        //},
        //function (n) {
        //    m.grid = Ext.create('Taco.view.entityManager.Grid', {
        //            store: m.store
        //        }
        //    );

        //    Taco.app.contentView.removeAll();
        //    Taco.app.contentView.add(m.grid);

        //    m.treeStore = Ext.create('Taco.store.EntitiesListsTree');
        //    m.treeStore.load({
        //        callback: n,
        //        scope: this
        //    });

        //},
        //function (n) {
        //    console.log(m.treeStore);
        //}
        
    );


});