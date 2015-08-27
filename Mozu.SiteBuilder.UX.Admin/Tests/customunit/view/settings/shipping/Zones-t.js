StartTest(function (t) {
    var m = {};


    t.setOnlyMocks();

  
    t.simManager().register([
        {
            url: '/admin/app/shipping/rules/read',
            stype: 'json',
            data: [
                {
                    "code": "123",
                    "description": "123",
                    "domain": "Shipping.DestinationAddress",
                    "expression": "CountryCode eq \"US\""
                },
                {
                    "code": "Americas",
                    "description": "North, Central, and South America",
                    "domain": "Shipping.DestinationAddress",
                    "expression": "CountryCode eq \"US\" or CountryCode eq \"CA\" or CountryCode eq \"MX\" or CountryCode eq \"GT\" or CountryCode eq \"BZ\" or  CountryCode eq \"SV\" or CountryCode eq \"HN\" or CountryCode eq \"NI\" or CountryCode eq \"CR\" or CountryCode eq \"PA\" or  CountryCode eq \"BS\" or CountryCode eq \"CU\" or CountryCode eq \"JM\" or CountryCode eq \"HT\" or CountryCode eq \"DO\" or  CountryCode eq \"VG\" or CountryCode eq \"KN\" or CountryCode eq \"AG\" or CountryCode eq \"DM\" or CountryCode eq \"LC\" or CountryCode eq \"VC\" or CountryCode eq \"GD\" or CountryCode eq \"BB\" or CountryCode eq \"TT\" or    CountryCode eq \"AR\" or CountryCode eq \"BO\" or CountryCode eq \"BR\" or CountryCode eq \"CL\" or CountryCode eq \"CO\" or CountryCode eq \"EC\" or CountryCode eq \"GF\" or CountryCode eq \"GY\" or CountryCode eq \"PY\" or CountryCode eq \"PE\" or CountryCode eq \"SR\" or CountryCode eq \"UY\" or CountryCode eq \"VE\" or CountryCode eq \"FK\""
                },
                {
                    "code": "APAC",
                    "description": "All Asian countries in addition to Australia and New Zealand",
                    "domain": "Shipping.DestinationAddress",
                    "expression": "CountryCode eq \"AF\" or CountryCode eq \"BH\" or CountryCode eq \"BD\" or CountryCode eq \"BT\" or CountryCode eq \"MM\" or CountryCode eq \"BN\" or CountryCode eq \"KH\" or CountryCode eq \"CN\" or CountryCode eq \"TP\" or CountryCode eq \"IN\" or CountryCode eq \"ID\" or CountryCode eq \"IR\" or CountryCode eq \"IQ\" or CountryCode eq \"IE\" or CountryCode eq \"JP\" or CountryCode eq \"JO\" or CountryCode eq \"KZ\" or CountryCode eq \"KP\" or CountryCode eq \"KR\" or CountryCode eq \"KW\" or CountryCode eq \"KG\" or CountryCode eq \"LA\" or CountryCode eq \"LV\" or CountryCode eq \"MY\" or CountryCode eq \"MV\" or CountryCode eq \"MN\" or CountryCode eq \"NP\" or CountryCode eq \"OM\" or CountryCode eq \"PK\" or CountryCode eq \"PH\" or CountryCode eq \"QA\" or CountryCode eq \"RU\" or CountryCode eq \"SA\" or CountryCode eq \"SG\" or CountryCode eq \"LK\" or CountryCode eq \"TK\" or CountryCode eq \"TH\" or CountryCode eq \"TR\" or CountryCode eq \"TM\" or CountryCode eq \"AE\" or CountryCode eq \"UZ\" or CountryCode eq \"VN\" or CountryCode eq \"YE\" or CountryCode eq \"AU\" or CountryCode eq \"NZ\""
                }
            ],
            doPost: function () {
                return this.doGet.apply(this, arguments);
            }
        }
    ]);


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
                        t.waitForRowsVisible(m.shippingZones, next);
                       
                    },
                    function (next) {
                        t.matchGridCellContent(m.shippingZones, 1, 0, 'Americas', 'Found Rule In Grid');
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
        
        next);


}
