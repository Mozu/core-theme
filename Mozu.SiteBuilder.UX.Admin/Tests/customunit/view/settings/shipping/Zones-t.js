StartTest(function (t) {
    var m = {};


    t.setOnlyMocks();

    t.chain(
        function (next) {
            t.diag('extra add tests');
            t.requireOk('Taco.view.settings.shipping.Zones', next);
        },
        function (next) {
            SetupModesAndViewForCreateTests(t, next, m);
        },

        function (next) {

            t.subTest('View Rulez', function (t) {
                t.chain([
                    function (next) {
                        t.waitForRowsVisible(m.grid, next);
                       
                    },
                    function (next) {
                        t.matchGridCellContent(m.grid, 1, 0, 'USA', 'Found Rule In Grid');
                        next();
                    }
                ]);

            }, next);
        },
        function (next) {
            next();
            //t.subTest('Set product Extra Values', function (t) {
            //    t.chain(
            //        function (next) {
            //            t.clickToEditCell(m.grid, 0, 4, next);
            //        },
            //        function (next, inputEl) {

            //            t.selectText(inputEl);
            //            t.type(inputEl, '22.57[ENTER]', next);
            //        },
            //        function (next) {
            //            t.is(m.grid.store.isDirty(), true, 'extras store was updated as dirty');
            //            t.is(m.grid.store.getAt(0).get('deltaPrice'), 22.57, 'delta value set');
            //            m.grid.store.commitChanges();
            //            t.clickToEditCell(m.grid, 1, 5, next);
            //        },
            //        function (next, inputEl) {
            //            t.selectText(inputEl);
            //            t.type(inputEl, '2[ENTER]', next);
            //        },
            //        function (next) {
            //            t.is(m.grid.store.isDirty(), true, 'extras store was updated as dirty');
            //            t.is(m.grid.store.getAt(1).get('quantity'), 2, 'quantity value set');
            //            m.grid.store.commitChanges();
            //            next();

            //        }
            //    );

            //}, next);
        });



});
function SetupModesAndViewForCreateTests(t, next, m) {

    //m.productExtra = Ext.create('Taco.model.ProductExtra', {
    //    "attributeFQN": "tenant~prod_extra_1",
    //    "isRequired": false,
    //    "isMultiSelect": false,
    //    "values": []
    //});
    //m.productTypeAttribute = Ext.create('Taco.model.ProductTypeAttribute', {
    //    "attributeFQN": "tenant~prod_extra_1",
    //    "selectedValues": [
    //        {
    //            "id": "aaaa",
    //            "attributeFQN": "tenant~prod_extra_1",
    //            "value": "aaaa"
    //        },
    //        {
    //            "id": "bbb",
    //            "value": "bbb"
    //        },
    //        {
    //            "id": "ccc",
    //            "value": "ccc"
    //        }
    //    ],
    //    "dataType": "ProductCode",
    //    "inputType": "List",
    //    "attributeName": "prod extra 1"
    //});


    m.shippingZones = Ext.create(
        'Taco.view.settings.shipping.Zones', {
          
        }
    );
    Taco.app.contentView.add(m.shippingZones);

    t.chain(
        function (next) {
            t.waitForComponentVisible(m.shippingZones, next);
        },
        function (next) {
            m.grid = m.shippingZones.down('grid');
            next();
        },
        next);


}
