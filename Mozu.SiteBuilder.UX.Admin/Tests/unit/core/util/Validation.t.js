StartTest(function (t) {
    var m = {},
        formatMessage = function(testResult) {
            return testResult.scenario + '. ==> Input: "' +
                testResult.input + '" ==> Output: ' + testResult.actual;
        };

    t.describe('Taco.core.util.Validation.toValidSeoSlug(slug)', function (t, next) {

        t.it("should match adv search fields, otherwise put in keyword bucket", function(t, next) {
            t.chain(
                function setup(next) {
                    m = {};
                    m.testCases = [
                        {
                            scenario: 'should replace space by hyphen',
                            input: 'product standard',
                            expected: 'product-standard'
                        }, {
                            scenario: 'should convert text to lowercase',
                            input: 'PRODUCT Standard',
                            expected: 'product-standard'
                        }, {
                            scenario: 'should allow a period within the string',
                            input: 'product.standard',
                            expected: 'product.standard'
                        }, {
                            scenario: 'should replace ending period with a hyphen',
                            input: 'product standard.',
                            expected: 'product-standard-'
                        }, {
                            scenario: 'should replace special characters with hyphens',
                            input: 'gx$200*g4&',
                            expected: 'gx-200-g4-'
                        }, {
                            scenario: 'should replace sequential special characters with a single hyphen',
                            input: 'gx200*((',
                            expected: 'gx200-'
                        }, {
                            scenario: 'should replace "%" with a hyphen',
                            input: 'gx200%fx',
                            expected: 'gx200-fx'
                        }
                    ];
                    next();
                },

                function execute(next) {
                    m.testCases.forEach(function(testCase) {
                        testCase.actual = Taco.core.util.Validation.toValidSeoSlug(testCase.input);
                    });
                    next();
                },

                function assert() {
                    m.testCases.forEach(function(testResult) {
                        t.is(testResult.actual, testResult.expected, formatMessage(testResult));
                    });
                }
            );
        });

    });

});
