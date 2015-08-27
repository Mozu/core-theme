ace.define("ace/mode/mozu_filter_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (e, t, n) {
    "use strict";
    var r = e("../lib/oop"),
        i = e("./text_highlight_rules").TextHighlightRules,
        s = function () {
            var e = "eq|ne|gt|ge|lt|le|in|cont|sw|and|or",
                t = "true|false|null",
                n = "near",
                r = this.createKeywordMapper({
                    "support.function": n,
                    keyword: e,
                    "constant.language": t
                }, "identifier", !0);
            this.$rules = {
                start: [{
                    token: "string",
                    regex: '".*?"'
                }, {
                    token: "string",
                    regex: "'.*?'"
                }, {
                    token: "constant.numeric",
                    regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
                }, {
                    token: r,
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
            }, this.normalizeRules()
        };
    r.inherits(s, i), t.FilterSyntaxHighlightRules = s
}), ace.define("ace/mode/mozufilter", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/mozu_filter_rules", "ace/range"], function (e, t, n) {
    "use strict";
    var r = e("../lib/oop"),
        i = e("./text").Mode,
        s = e("./mozu_filter_rules").FilterSyntaxHighlightRules,
        o = e("../range").Range,
        u = function () {
            this.HighlightRules = s
        };
    r.inherits(u, i),
        function () {
            this.lineCommentStart = "--", this.$id = "ace/mode/mozufilter";
        }.call(u.prototype), t.Mode = u
})