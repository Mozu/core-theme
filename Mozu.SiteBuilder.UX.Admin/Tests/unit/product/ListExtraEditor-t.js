StartTest(function (t) {
    var m = {};


    t.setOnlyMocks();


    t.chain(
        function (next) {
            t.requireOk('Taco.view.product.subform.ListExtraEditor', 'Taco.model.ProductExtra', 'Taco.model.ProductTypeAttribute', next);
        },
        function (next) {
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
                "attributeName": "prod extra 1"
            });


            m.form = Ext.create(
                'Taco.view.product.subform.ListExtraEditor', {
                    productExtra: m.productExtra,
                    productTypeAttribute: m.productTypeAttribute,
                    flex: 1,
                    renderTo: Ext.getBody()
                }
            );


            t.waitForComponentVisible(m.form, next);

        },
        function (next) {
            m.itemAdder = m.form.down('#itemAdder');
            t.clickSelect(m.itemAdder, 'aaaa', next);

        },
        function (next) {
            m.grid = m.form.down('grid');
            t.matchGridCellContent(m.grid, 0, 0, 'aaaa', 'found extra value');
            t.clickSelect(m.itemAdder, 'bbb', next);

        },
        //function (next) {
        //    setTimeout(next, 100);
        //},
        function (next) {
            t.matchGridCellContent(m.grid, 1, 0, 'bbb', 'found second extra value');
            t.clickToEditCell(m.grid, 0, 4, next);
        },
        function (next, inputEl) {
            t.type(inputEl, 22.56, next);
        },
         function (next) {
            t.click(t.getExt().getBody(), next);
        },
        function (next) {
            t.is(m.grid.store.getAt(0).get('deltaPrice'), 22.56, 'delta value set');
        }
    );


});