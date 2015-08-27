// This is how you add Mozu filter and sorting syntax highlighting

define(function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var FilterSyntaxHighlightRules = function () {

        var keywords = (
            "eq|ne|gt|ge|lt|le|in|cont|sw|and|or|desc|asc"
        );

        var builtinConstants = (
            "true|false|null"
        );

        var builtinFunctions = (
            "near"
        );

        var keywordMapper = this.createKeywordMapper({
            "support.function": builtinFunctions,
            "keyword": keywords,
            "constant.language": builtinConstants
        }, "identifier", true);

        this.$rules = {
            "start": [{
                token: "string",           // " string
                regex: '".*?"'
            }, {
                token: "string",           // ' string
                regex: "'.*?'"
            }, {
                token: "constant.numeric", // float
                regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token: keywordMapper,
                regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token: "keyword.operator",
                regex: "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="
            }, {
                token: "paren.lparen",
                regex: "[\\(]"
            }, {
                token: "paren.rparen",
                regex: "[\\)]"
            }, {
                token: "text",
                regex: "\\s+"
            }]
        };
        this.normalizeRules();
    };

    oop.inherits(FilterSyntaxHighlightRules, TextHighlightRules);

    exports.FilterSyntaxHighlightRules = FilterSyntaxHighlightRules;
});