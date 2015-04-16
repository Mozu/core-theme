StartTest(function (t) {
    var m = {},
        formatMessage = function(testResult) {
            return testResult.scenario + '. ==> Input: "' +
                testResult.textValue + '" ==> Output: ' + JSON.stringify(testResult.actual);
        };

    t.describe('Taco.core.util.Filter.ToJSON(filterValue, advSearchFieldNames, keyValueDelimiter)', function (t, next) {

        t.it("should match adv search fields, otherwise put in keyword bucket", function(t, next) {
            t.chain(
                function setup(next) {
                    m = {};
                    m.advSearchFields = ['status', 'keyword', 'type'];
                    m.delimiter = ':';
                    m.testCases = [
                        {
                            scenario: 'Standard field',
                            textValue: 'status:Active',
                            expected: {status: 'Active'}
                        }, {
                            scenario: 'Keyword containing ":" & field',
                            textValue: '12:00 status:Active',
                            expected: {keyword: '12:00', status: 'Active'}
                        }, {
                            scenario: 'Two fields',
                            textValue: 'status:Active type:Free',
                            expected: {status: 'Active', type: 'Free'}
                        }, {
                            scenario: 'Value with spaces and 2 fields',
                            textValue: 'type: Configurable Product with Options status:All',
                            expected: {type: 'Configurable Product with Options', status: 'All'}
                        }, {
                            scenario: 'Keyword must come first, otherwise adds to previous field',
                            textValue: 'status:Active 12:00 type:Free',
                            expected: {status: 'Active 12:00', type:'Free'}
                        }
                    ];
                    next();
                },

                function execute(next) {
                    m.testCases.forEach(function(testCase) {
                        testCase.actual = Taco.core.util.Filter.toJSON(testCase.textValue, m.advSearchFields, m.delimiter);
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

        t.it("should handle empty adv search fields by placing everything in keywords", function (t, next) {
            t.chain(
                function setup(next) {
                    m = {};
                    m.advSearchFields = [];
                    m.delimiter = ':';
                    m.testCases = [
                        {
                            scenario: 'No search fields to match against',
                            textValue: 'status:Active',
                            expected: { keyword: 'status:Active' }
                        }, {
                            scenario: 'No field with colon',
                            textValue: '12:00',
                            expected: { keyword: '12:00' }
                        }, {
                            scenario: 'Empty text value',
                            textValue: '',
                            expected: {}
                        }, {
                            scenario: 'Null text value',
                            textValue: null,
                            expected: {}
                        }
                    ];
                    next();
                },

                function execute(next) {
                    m.testCases.forEach(function(testCase) {
                        testCase.actual = Taco.core.util.Filter.toJSON(testCase.textValue, m.advSearchFields, m.delimiter);
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
