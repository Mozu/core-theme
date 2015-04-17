StartTest(function (t) {
    var m = {},
        formatMessage = function(testResult) {
            return testResult.scenario + '. ==> Expected: "' +
                JSON.stringify(testResult.expected) + '" ==> Actual: ' + JSON.stringify(testResult.actual);
        };

    t.describe('Taco.model.Product.getBundleItemTotals()', function (t, next) {

        t.it("should total bundles & if sales price is null, use price.", function(t, next) {
            t.chain(
                function setup(next) {
                    m = {};
                    m.testCases = [
                        {
                            scenario: 'One component with 0 sales price',
                            bundleComponents: [
                                {price:20, salePrice:10, quantity: 1},
                                {price:20, salePrice: 0, quantity: 1}
                            ],
                            expected: {price:40, salePrice:10}
                        }, {
                            scenario: 'One component with null sales price',
                            bundleComponents: [
                                {price:20, salePrice: 10, quantity: 1},
                                {price:20, salePrice: null, quantity: 1}
                            ],
                            expected: {price:40, salePrice:30}
                        }, {
                            scenario: '1 component, qty 2, with null sales price',
                            bundleComponents: [
                                {price:20, salePrice: 10, quantity: 1},
                                {price:20, salePrice: null, quantity: 2}
                            ],
                            expected: {price:60, salePrice:50}
                        }
                    ];
                    next();
                },

                function setup(next) {
                    var components;
                    m.testCases.forEach(function (testCase) {
                        components = [];
                        testCase.bundledProducts = Ext.create('Ext.data.Store', {
                            model: 'Taco.model.BundledProduct',
                            data: testCase.bundleComponents
                        });

                        testCase.tacoBundle = Ext.create('Taco.model.Product', {
                            bundledProducts: testCase.bundeledProducts
                        });
                    });
                    next();
                },

                function execute(next) {
                    m.testCases.forEach(function (testCase) {
                        debugger;
                        testCase.actual = testCase.tacoBundle.getBundleItemTotals(testCase.bundledProducts);
                    });
                    next();
                },

                function assert() {
                    m.testCases.forEach(function(testResult) {
                        t.is(JSON.stringify(testResult.actual), JSON.stringify(testResult.expected), formatMessage(testResult));
                    });
                }
            );
        });

    });

});
