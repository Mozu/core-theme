StartTest(function (t) {


    var m = {};
    window.m = m;
    debugger;
    t.chain(
        function (n) {
            t.requireOk('Taco.model.Entity', 'Taco.store.Entities', 'Taco.view.entityManager.Grid', n);

        },
        function (n) {
            Taco.app.context.setCurrentSite(Taco.app.context.masterCatalogs[0].sites[0].id);
            //  debugger;
            m.store = Ext.create('Taco.store.Entities', {
                listName: 'phipps.people',
                entityType: 'mzdb'
            });
            m.store.load({
                callback: n,
                scope: this
            });

        },
        function (n) {
            m.grid = Ext.create('Taco.view.entityManager.Grid', {
                    store: m.store
                }
            );

            Taco.app.contentView.removeAll();
            Taco.app.contentView.add(m.grid);

        }
    );


});