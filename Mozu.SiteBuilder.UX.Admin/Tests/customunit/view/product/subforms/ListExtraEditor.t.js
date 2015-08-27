StartTest(function (t) {
    var m = {};


    t.setOnlyMocks();
    
    t.chain(
        function (next) {
            t.diag('extra add tests');
            t.requireOk('Taco.view.product.subform.ListExtraEditor', 'Taco.model.ProductExtra', 'Taco.model.ProductTypeAttribute', next);
        },
        function (next) {
            SetupModesAndViewForCreateTests(t, next, m);
        },
        
        function (next) {

            t.subTest('Add product Extras', function (t) {
                t.chain([
                    function (next) {
                        t.clickSelect(m.itemAdder, 'aaaa', next);
                    },
                    function (next) {
                        m.grid = m.form.down('grid');
                        t.matchGridCellContent(m.grid, 0, 0, 'aaaa', 'found extra value');
                        t.is(m.grid.store.getAt(0).getId(), 'aaaa', 'item found in store');
                        m.grid.store.commitChanges();
                        t.clickSelect(m.itemAdder, 'bbb', next);

                    },
                    function (next) {
                        t.matchGridCellContent(m.grid, 1, 0, 'bbb', 'found second extra value');
                        t.is(m.grid.store.getAt(1).getId(), 'bbb', 'item found in store');
                        t.is(m.grid.store.isDirty(), true, 'extras store was updated as dirty');
                        next();
                    }
                ]);

            }, next);
        },
        function (next) {
            t.subTest('Set product Extra Values', function (t) {
                t.chain(
                    function (next) {
                        t.clickToEditCell(m.grid, 0, 4, next);
                    },
                    function (next, inputEl) {

                        t.selectText(inputEl);
                        t.type(inputEl, '22.57[ENTER]', next);
                    },
                    function (next) {
                        t.is(m.grid.store.isDirty(), true, 'extras store was updated as dirty');
                        t.is(m.grid.store.getAt(0).get('deltaPrice'), 22.57, 'delta value set');
                        m.grid.store.commitChanges();
                        t.clickToEditCell(m.grid, 1, 5, next);
                    },
                    function (next, inputEl) {
                        t.selectText(inputEl);
                        t.type(inputEl, '2[ENTER]', next);
                    },
                    function (next) {
                        t.is(m.grid.store.isDirty(), true, 'extras store was updated as dirty');
                        t.is(m.grid.store.getAt(1).get('quantity'), 2, 'quantity value set');
                        m.grid.store.commitChanges();
                        next();
                      
                    }
                );

            }, next);
        });



});
function SetupModesAndViewForCreateTests (t, next, m) {

    m.product = Ext.create('Taco.model.Product', {
        masterCatalogId: Taco.app.context.masterCatalogs[0].id
    });

    m.productExtra = Ext.create('Taco.model.ProductExtra', {
        "attributeFQN": "tenant~prod_extra_1",
        "isRequired": false,
        "isMultiSelect": false,
        "values": []
    });
    m.productTypeAttribute = Ext.create('Taco.model.ProductTypeAttribute', {
        "attributeFQN": "tenant~prod_extra_1",
        "selectedValues": [
            {
                "id": "aaaa",
                "attributeFQN": "tenant~prod_extra_1",
                "value": "aaaa"
            },
            {
                "id": "bbb",
                "value": "bbb"
            },
            {
                "id": "ccc",
                "value": "ccc"
            }
        ],
        "dataType": "ProductCode",
        "inputType": "List",
        "attributeName": "prod extra 1",
        "adminName": "prod extra 1"
    });


    m.form = Ext.create(
        'Taco.view.product.subform.ListExtraEditor', {
            product:m.product,
            productExtra: m.productExtra,
            productTypeAttribute: m.productTypeAttribute,
            flex: 1,
            renderTo: Ext.getBody()
        }
    );

    t.chain(
        function (next) {
            t.waitForComponentVisible(m.form, next);
        },
        function (next) {
            m.itemAdder = m.form.down('#itemAdder');
            next();
        },
        next);


}
