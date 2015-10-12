describe('Hypr Live', function() {
    it('registers in the absence of RequireJS as a global called Hypr', function() {
        expect(window.Hypr).to.be.ok;
    });
    it('has an `engine` property that is a template engine', function() {
        expect(Hypr.engine).to.respondTo('render');
    });
    describe('accessors for mozu data', function() {
        before(function() {
            HyprLiveContext.locals.themeSettings = {
                foo: 'bar'
            };
            HyprLiveContext.locals.labels = {
                funch: 'gunch {0}'
            };

            HyprLiveContext.templates['path/to/example'] = '{% if legaltemplate %}something{% endif %}';
            HyprLiveContext.templates['path/to/example2'] = '{{pageContext.query.funch}}';
            HyprLiveContext.templates['path/to/example3'] = '{{pageContext.query.bluch}}';
            HyprLiveContext.templates['path/to/example4'] = '{{pageContext.query.htmlqs}}';
            history.replaceState({}, null, window.location.href.split('?').shift() + "?funch=wunch&gunch= spaces then brunch&htmlqs=<b>bla</b>")
        });
        it('include getTemplate, getThemeSetting, and getLabel methods', function() {
            expect(Hypr).to.respondTo('getTemplate');
            expect(Hypr).to.respondTo('getThemeSetting');
            expect(Hypr).to.respondTo('getLabel');
        });
        it('getTemplate returns a compiled template', function() {
            var tpt = Hypr.getTemplate('path/to/example');
            expect(tpt).to.have.property('precompiledTpl');
            expect(tpt).to.have.property('path').that.is.equal('path/to/example');
            expect(tpt).to.respondTo('render');
            expect(tpt.render({ legaltemplate: true })).to.equal('something');
            expect(tpt.render({})).to.equal('');
        });
        it('getThemeSetting returns a theme setting value', function() {
            expect(Hypr.getThemeSetting('foo')).to.equal('bar');
        });
        it('getLabel returns a label with argument interpolated as values in a string format', function() {
            expect(Hypr.getLabel('funch')).to.equal('gunch {0}');
            expect(Hypr.getLabel('funch', 'wunch')).to.equal('gunch wunch');
        });

        it('pageContext.query includes a valid querystring value', function () {
            expect(Hypr.getTemplate('path/to/example2').render()).to.equal('wunch');
            expect(Hypr.getTemplate('path/to/example3').render()).to.equal('');
            expect(Hypr.getTemplate('path/to/example4').render()).to.equal('&lt;b&gt;bla&lt;/b&gt;');
        });
    });
    describe('custom tags', function() {
        before(function() {
            HyprLiveContext.locals.themeSettings = HyprLiveContext.locals.themeSettings || {};

            HyprLiveContext.locals.themeSettings.listProductThumbSize = 150;
        });

        ['require_script', 'json_attribute', 'data_attributes'].forEach(function(attr) {
            it('has a null tag ' + attr + ' that fails silently', function() {
                expect(Hypr.engine.render('{% ' + attr + ' %}')).not.to.throw;
            });
        });
        it('has a null tag comment that opens and closes and hides contents', function() {
            expect(Hypr.engine.render('{% comment %}florp{% endcomment %}')).to.equal('');
        });
        it('has a tag {% dump %} that emits type information and json', function() {
            expect(Hypr.engine.render('{% dump thing %}', { locals: { thing: { stuff: 'wat' } } })).to.equal('<pre class="hypr-dump"><code>[object Object]\n{\n  &quot;stuff&quot;: &quot;wat&quot;\n}\n</code></pre>');
        });
        it('has a tag {% with %} that sets a variable inside delimiters', function() {
            expect(Hypr.engine.render('{% with "foo" as bar %}{{ bar }}{% endwith %}{{ bar }}')).to.equal('foo');
            expect(Hypr.engine.render('{% with "foo"|upper as bar %}{{ bar }}{% endwith %}{{ bar }}')).to.equal('FOO');
            expect(Hypr.engine.render('{% with "foo"|upper|first as bar %}{{ bar }}{% endwith %}{{ bar }}')).to.equal('F');
        });
        it('has a tag {% dropzone %} that produces an empty dropzone div', function() {
            expect(Hypr.engine.render('{% dropzone "why-not" %}')).to.equal('<div id="mz-drop-zone-why-not" class="mz-drop-zone"></div>');
            expect(Hypr.engine.render('{% dropzone "why-again" scope="page" %}')).to.equal('<div id="mz-drop-zone-why-again" class="mz-drop-zone"></div>');
        });

        it('has a tag {% make_url "image" %} that produces a valid Image url', function() {
            var data = { locals: { image: { imageUrl: '//cdn.mozu.com/img.jpg' } } };
            expect(Hypr.engine.render('{% make_url "image" image %}', data))
                .to.equal('//cdn.mozu.com/img.jpg?_mzCb=1234');
            expect(Hypr.engine.render('{% make_url "image" image with max=themeSettings.listProductThumbSize as_parameter %}', data))
                .to.equal('//cdn.mozu.com/img.jpg?max=150&_mzCb=1234');
            expect(Hypr.engine.render('{% make_url "image" image with max=themeSettings.listProductThumbSize size=1 as_parameter %}', data))
                .to.equal('//cdn.mozu.com/img.jpg?max=150&size=1&_mzCb=1234');
        });

        it('has a tag {% make_url "product" %} that produces a valid Product url', function() {
            expect(Hypr.engine.render('{% make_url "product" 1234 %}'))
                .to.equal('/p/1234');
            expect(Hypr.engine.render('{% make_url "product" "something-code-12" %}'))
                .to.equal('/p/something-code-12');
            expect(Hypr.engine.render('{% make_url "product" model %}', { locals: { model: { productCode: 'something-code-12' } } }))
                .to.equal('/p/something-code-12');
        });

        it('has a tag {% make_url "category" %} that produces a valid Category url', function() {
            expect(Hypr.engine.render('{% make_url "category" 1234 %}'))
                .to.equal('/c/1234');
            expect(Hypr.engine.render('{% make_url "category" "something-code-12" %}'))
                .to.equal('/c/something-code-12');
            expect(Hypr.engine.render('{% make_url "category" model %}', { locals: { model: { categoryCode: 'something-code-12' } } }))
                .to.equal('/c/something-code-12');
        });

        it('has a tag {% make_url "sorting" %} that produces a valid Sorting url', function() {
            // ensure query string is not overwritten
            history.replaceState({}, null, window.location.href.split('?').shift() + "?a=1&b=21");

            expect(Hypr.engine.render('{% make_url "sorting" "price:asc" %}'))
                .to.equal('?a=1&b=21&sortBy=price%3Aasc');
            expect(Hypr.engine.render('{% make_url "sorting" sort %}', { locals: { sort: 'price:desc' } }))
                .to.equal('?a=1&b=21&sortBy=price%3Adesc');
            expect(Hypr.engine.render('{% make_url "sorting" sort %}', { locals: { sort: 'price:desc,rating:asc' } }))
                .to.equal('?a=1&b=21&sortBy=price%3Adesc%2Crating%3Aasc');
            
            // ensure sortBy is being replaced
            history.replaceState({}, null, window.location.href.split('?').shift() + "?a=1&b=21&sortBy=dead%3Adata");
            expect(Hypr.engine.render('{% make_url "sorting" "price:asc" %}'))
                .to.equal('?a=1&b=21&sortBy=price%3Aasc');
        });

        it('has a tag {% make_url "facet" %} that produces a valid Faceting url', function() {
            // ensure query string is not overwritten
            history.replaceState({}, null, window.location.href.split('?').shift() + '?a=1&b=21');
            expect(Hypr.engine.render('{% make_url "facet" "size:1,size:2" %}'))
                .to.equal('?a=1&b=21&facetValueFilter=size%3A1%2Csize%3A2');
            expect(Hypr.engine.render('{% make_url "facet" facet %}', { locals: { facet: { filterValue: 'size:1,size:2' } } }))
                .to.equal('?a=1&b=21&facetValueFilter=size%3A1%2Csize%3A2');

            // append if a facetValueFilter alread exists
            history.replaceState({}, null, window.location.href.split('?').shift() + '?a=1&b=21&facetValueFilter=size%3A1%2Csize%3A2');            
            expect(Hypr.engine.render('{% make_url "facet" "size:3" %}'))
                .to.equal('?a=1&b=21&facetValueFilter=size%3A1%2Csize%3A2%2Csize%3A3');

            // remove facet value if already defined
            history.replaceState({}, null, window.location.href.split('?').shift() + '?a=1&b=21&facetValueFilter=size%3A1%2Csize%3A2%2Csize%3A3');            
            expect(Hypr.engine.render('{% make_url "facet" "size:3" %}'))
                .to.equal('?a=1&b=21&facetValueFilter=size%3A1%2Csize%3A2');
        });

        it('has a tag {% make_url "cdn" %} that produces a valid CDN url with cache busting support', function() {
            expect(Hypr.engine.render('{% make_url "cdn" "/files/video.mp4" %}'))
                .to.equal('//cdn.mozu-perf.volusion.com/9795-9865/files/video.mp4?_mzCb=1234');
        });

        it('has a tag {% make_url "paging" %} that produces a valid Paging url', function() {
            // currently on Page 3 (startIndex: 20)
            var data = { locals: { productCollection: { pageCount: 5, pageSize: 10, startIndex: 20, totalCount: 48 }, i: 5 } };

            history.replaceState({}, null, window.location.href.split('?').shift() + '?a=1&b=21&startIndex=20');
            expect(Hypr.engine.render('{% make_url "paging" productCollection with page="first" as_parameter %}', data)).to.equal('?a=1&b=21&startIndex=0');
            expect(Hypr.engine.render('{% make_url "paging" productCollection with page="last" as_parameter %}', data)).to.equal('?a=1&b=21&startIndex=40');
            expect(Hypr.engine.render('{% make_url "paging" productCollection with page="previous" as_parameter %}', data)).to.equal('?a=1&b=21&startIndex=10');
            expect(Hypr.engine.render('{% make_url "paging" productCollection with page="next" as_parameter %}', data)).to.equal('?a=1&b=21&startIndex=30');
            expect(Hypr.engine.render('{% make_url "paging" productCollection with page=1 as_parameter %}', data)).to.equal('?a=1&b=21&startIndex=0');
            expect(Hypr.engine.render('{% make_url "paging" productCollection with page=2 as_parameter %}', data)).to.equal('?a=1&b=21&startIndex=10');
            expect(Hypr.engine.render('{% make_url "paging" productCollection with page=3 as_parameter %}', data)).to.equal('?a=1&b=21&startIndex=20');
            expect(Hypr.engine.render('{% make_url "paging" productCollection with page=4 as_parameter %}', data)).to.equal('?a=1&b=21&startIndex=30');
            expect(Hypr.engine.render('{% make_url "paging" productCollection with page=i as_parameter %}', data)).to.equal('?a=1&b=21&startIndex=40');

            // ensure startIndex min is 0
            expect(Hypr.engine.render('{% make_url "paging" productCollection with page=0 as_parameter %}', data)).to.equal('?a=1&b=21&startIndex=0');

            // ensure startIndex max is 40 
            expect(Hypr.engine.render('{% make_url "paging" productCollection with page=6 as_parameter %}', data)).to.equal('?a=1&b=21&startIndex=40');

            // ensure current page if none is defined
            expect(Hypr.engine.render('{% make_url "paging" productCollection %}', data)).to.equal('?a=1&b=21&startIndex=20');

            // allow user to change pageSize
            expect(Hypr.engine.render('{% make_url "paging" productCollection with pageSize=30 as_parameter %}', data)).to.equal('?pageSize=30&a=1&b=21&startIndex=20');
        });
    });
    describe('custom filters', function() {
        before(function () {
            history.replaceState({}, null, window.location.href.split('?').shift() + "?funch=wunch&gunch= spaces then brunch&htmlqs=<b>bla</b>");
        });
        it('has a currency filter that formats currency (currently US only)', function() {
            expect(Hypr.engine.render('{{ dolla|currency }}', { locals: { dolla: 3 } })).to.equal('$3.00');
            expect(Hypr.engine.render('{{ dolla|currency }}', { locals: { dolla: 3.0002 } })).to.equal('$3.00');
            expect(Hypr.engine.render('{{ dolla|currency("USD ") }}', { locals: { dolla: 3.0002 } })).to.equal('USD 3.00');
            expect(Hypr.engine.render('{{ dolla|currency }}', { locals: { dolla: 3000000 } })).to.equal('$3,000,000.00');
        });
        it('has a divisibleby filter that returns true if the number is divisible by the argument', function() {
            var tpt2 = '{% if n|divisibleby(2) %}{{ n }}{% else %}no{% endif %}';
            var tpt3 = '{% if n|divisibleby(3) %}{{ n }}{% else %}no{% endif %}';
            expect(Hypr.engine.render(tpt2, { locals: { n: 4 } })).to.equal('4');
            expect(Hypr.engine.render(tpt2, { locals: { n: 5 } })).to.equal('no');
            expect(Hypr.engine.render(tpt3, { locals: { n: 5 } })).to.equal('no');
            expect(Hypr.engine.render(tpt3, { locals: { n: 6 } })).to.equal('6');
        });
        it("has a divide filter that divides the value by the argument", function() {
            var plain = '{{ num|divide(3) }}';
            var operatedOn = '{% if num|divide(4) > 2 %}bigger than 8{% else %}8 or less{% endif %}'
            expect(Hypr.engine.render(plain, { locals: { num: 9 } })).to.equal('3');
            expect(Hypr.engine.render(plain, { locals: { num: 5 } })).to.equal('1.6666666667');
            expect(Hypr.engine.render(operatedOn, { locals: { num: 12 } })).to.equal('bigger than 8');
            expect(Hypr.engine.render(operatedOn, { locals: { num: 7 } })).to.equal('8 or less');
        });
        it("has an add filter that adds the value to the argument", function() {
            var plain = '{{ num|add(3) }}';
            var operatedOn = '{% if num|add(3) > 8 %}bigger than 5{% else %}5 or less{% endif %}'
            expect(Hypr.engine.render(plain, { locals: { num: 7 } })).to.equal('10');
            expect(Hypr.engine.render(plain, { locals: { num: 7.7681231 } })).to.equal('10.7681231');
            expect(Hypr.engine.render(operatedOn, { locals: { num: 7 } })).to.equal('bigger than 5');
            expect(Hypr.engine.render(operatedOn, { locals: { num: 3 } })).to.equal('5 or less');
        });

        it("has a subtract filter that subtracts the value from the argument", function() {
            var plain = '{{ num|subtract(3) }}';
            var operatedOn = '{% if num|subtract(3) > 5 %}bigger than 5{% else %}5 or less{% endif %}'
            expect(Hypr.engine.render(plain, { locals: { num: 7 } })).to.equal('4');
            expect(Hypr.engine.render(plain, { locals: { num: 7.7681231 } })).to.equal('4.7681231');
            expect(Hypr.engine.render('{{ num|subtract(term) }}', { locals: { term: 7.7681231, num: 10 } })).to.equal('2.2318769');
            expect(Hypr.engine.render(operatedOn, { locals: { num: 9 } })).to.equal('bigger than 5');
            expect(Hypr.engine.render(operatedOn, { locals: { num: 3 } })).to.equal('5 or less');
        });

        it("has a multiply filter that multiplies the value by the argument", function() {
            var plain = '{{ num|multiply(3) }}';
            var operatedOn = '{% if num|multiply(3) > 15 %}bigger than 5{% else %}5 or less{% endif %}'
            expect(Hypr.engine.render(plain, { locals: { num: 7 } })).to.equal('21');
            expect(Hypr.engine.render(operatedOn, { locals: { num: 9 } })).to.equal('bigger than 5');
            expect(Hypr.engine.render(operatedOn, { locals: { num: 3 } })).to.equal('5 or less');
        });

        describe("has a floatformat filter that", function() {

            function testFilter(fstr, n, output) {
                it("works with num|floatformat" + fstr + " on " + n + " to produce " + output, function() {
                    expect(Hypr.engine.render('{{ num|floatformat' + fstr + '}}', { locals: { num: n } })).to.equal(output);
                });
            }

            testFilter('', 7.7117473, "7.7");
            testFilter('', 7.7, "7.7");
            testFilter('', "7.0", "7");
            testFilter('', '0.7', '0.7');
            testFilter('', '0.07', '0.1');
            testFilter('', '0.007', '0.0');
            testFilter('', '0.0', '0');
            testFilter('(3)', '7.7', '7.700');
            testFilter('(3)', '6.000000', '6.000');
            testFilter('(3)', '6.200000', '6.200');
            testFilter('(-3)', '6.200000', '6.200');
            testFilter('(-3)', '13.1031', '13.103');
            testFilter('(-2)', '11.1197', '11.12');
            testFilter('(-2)', '11.0000', '11');
            testFilter('(-2)', '11.000001', '11.00');
            testFilter('(2)', '11.0000', '11.00');
            testFilter('(2)', '11.000001', '11.00');
            testFilter('(3)', '8.2798', '8.280');
            testFilter('', 'foo', '');
            testFilter('("bar")', '13.1031', '13.1031');
            testFilter('(2)', '18.125', '18.13');
            testFilter('("bar")', 'foo', '');
            testFilter('', '¿Cómo esta usted?', '');
            testFilter('', null, '');
            testFilter('(0)', '13.125', '13');
            testFilter('(0)', '13.925', '14');
            testFilter('(0, "down")', '13.925', '13');
            testFilter('(2, "down")', '13.248', '13.24');

        });

        var dateScenarios = [
            ['2001-12-12', '2001-12-12', "0 minutes"],
            ['2002-12-12', '2001-12-12', "0 minutes"],
            ['2001-12-12', '2002-12-13', "1 year 0 months"],
            ['2002-12-12', '2002-12-13', "1 day 0 hours"],
            ['2002-12-12', '2003-01-20', "1 month 1 week"],
            ['2002-12-12', new Date(2002, 11, 12, 4, 30, 0), "10 hours 30 minutes"] // timezone offset
        ];

        describe("has date filters including", function() {
            describe("timeuntil, which prints a humanized date interval", function() {

                function testTimeUntil(n, fstr, output) {
                    it("works with value|timeuntil(" + fstr + ") on " + n + " to produce " + output, function() {
                        expect(Hypr.engine.render('{{ value|timeuntil("' + (new Date(fstr)).toISOString() + '") }}', { locals: { value: (new Date(n)).toISOString() } })).to.equal(output);
                    });
                }

                dateScenarios.forEach(function(scenario) {
                    testTimeUntil.apply(this, scenario);
                });


            })

            describe("is_after, which returns boolean whether a date is after another date", function() {

                function testIsAfter(n, fstr, output) {
                    n = new Date(n);
                    fstr = new Date(fstr);
                    it("works with value|is_after(" + fstr.toISOString() + ") on " + n.toISOString() + " to return " + (n > fstr), function() {
                        expect(Hypr.engine.render('{{ value|is_after("' + fstr.toISOString() + '") }}', { locals: { value: n.toISOString() } })).to.equal((n > fstr).toString());
                    });
                }

                dateScenarios.forEach(function(scenario) {
                    testIsAfter.apply(this, scenario);
                })

            });

            describe("is_before, which returns boolean whether a date is before another date", function() {

                function testIsBefore(n, fstr, output) {
                    n = new Date(n);
                    fstr = new Date(fstr);
                    it("works with value|is_before(" + fstr.toISOString() + ") on " + n.toISOString() + " to return " + (n < fstr), function() {
                        expect(Hypr.engine.render('{{ value|is_before("' + fstr.toISOString() + '") }}', { locals: { value: n.toISOString() } })).to.equal((n < fstr).toString());
                    });
                }

                dateScenarios.forEach(function(scenario) {
                    testIsBefore.apply(this, scenario);
                });

            });

            describe('parse_date, which turns a string, number or date into a date value', function() {
                function testParseDate(scenario) {
                    var n = scenario[0],
                        output = scenario[1];
                    it("parses " + n + " into " + output, function() {
                        expect(Hypr.engine.render('{{ value|parse_date }}', { locals: { value: n } })).to.equal(output);
                    });
                }

                [
                    ['2015-05-12', ((+(new Date('2015-05-12'))) / 1000).toString()],
                    [1879263, ((+new Date(1879263 * 1000)) / 1000).toString()],
                    [new Date(2002, 10, 14, 9, 2, 9, 23), ((+(new Date(2002, 10, 14, 9, 2, 9, 23))) / 1000).toString()],
                    ['1', ((+new Date(1000)) / 1000).toString()]
                ].forEach(testParseDate);
            });


            describe('add_time, which takes an internal time value represented in seconds and adds time to it', function() {
                function testAddTime(scenario) {
                    var n = scenario[0];
                    var toAdd = scenario[1];
                    var output = scenario[2];
                    it("adds " + scenario[1] + ' to ' + scenario[0] + ' to produce ' + output + ', which is the internal representation of date ' + new Date(Number(output) * 1000), function() {
                        expect(Hypr.engine.render('{{ value|add_time(t) }}', { locals: { value: n, t: scenario[1] } })).to.equal(output.toString());
                    });
                }

                [
                    ['2015-01-01', 86400, (new Date(+(new Date('2015-01-01')) + 86400000)).getTime() / 1000]
                ].forEach(testAddTime);

            })
        });

        it('has an add_url_param filter that adds a parameter intelligently to a url', function() {
            var url = 'http://example.com/',
                urlWithQuery = url + '?one=two',
                urlWithTwoQueries = urlWithQuery + '&three=four',
                ctx = {
                    locals: {
                        url1: url,
                        url2: urlWithQuery,
                        url3: urlWithTwoQueries
                    }
                };
            expect(Hypr.engine.render('{{ url1|add_url_param("sortBy","derp desc") }}', ctx)).to.equal('http://example.com/?sortBy=derp%20desc');
            expect(Hypr.engine.render('{{ url2|add_url_param("sortBy","derp asc") }}', ctx)).to.equal('http://example.com/?one=two&amp;sortBy=derp%20asc');
            expect(Hypr.engine.render('{{ url3|add_url_param("sortBy","flerp asc") }}', ctx)).to.equal('http://example.com/?one=two&amp;three=four&amp;sortBy=flerp%20asc');
        });
        it('has a slugify filter that turns strings into url-suitable slugs', function() {
            var stpt = '{{ s|slugify }}';
            expect(Hypr.engine.render(stpt, { locals: { s: 'ábso,lutely!' } })).to.equal('abso-lutely-');
        });
        it('has a truncatewords filter that truncates strings by word count and adds an ellipsis', function() {
            expect(Hypr.engine.render('{{ d|truncatewords(5) }}', { locals: { d: 'One two three four' } })).to.equal('One two three four');
            expect(Hypr.engine.render('{{ d|truncatewords(5) }}', { locals: { d: 'One two three four five six' } })).to.equal('One two three four five ...');
        });
        it('has a string_format filter that interpolates an arbitrary number of vars into a format string', function() {
            expect(Hypr.engine.render('{{ f|string_format(y) }}', { locals: { f: '{0}', y: '1' } })).to.equal('1');
            expect(Hypr.engine.render('{{ f|string_format(x,y,z) }}', { locals: { f: '{0} {1}{{2}}', x: 'What', y: 'is', z: 'this' } })).to.equal('What is{this}');
        });
        it('has a prop filter that gets the property of an object, used at the end of filter chains, case insensitive by default', function() {
            expect(Hypr.engine.render('{{ list|first|prop("name") }}', { locals: { list: [{ name: 'Nigel' }, { name: 'David' }] } })).to.equal('Nigel');
            expect(Hypr.engine.render('{{ list|first|prop("Name") }}', { locals: { list: [{ name: 'Nigel' }, { name: 'David' }] } })).to.equal('Nigel');
            expect(Hypr.engine.render('{{ list|first|prop("Name") }}', { locals: { list: [{ name: 'Nigel' }, { name: 'David' }] } })).to.equal('Nigel');
            expect(Hypr.engine.render('{{ list|first|prop("Name", true) }}', { locals: { list: [{ name: 'Nigel' }, { Name: 'David' }] } })).to.equal('');
        });
        it('has a findwhere filter that gets the member of a collection that has a certain property value', function() {
            expect(Hypr.engine.render('{{ list|findwhere("Name","david")|prop("instrument") }}', { locals: { list: [{ name: 'Nigel', instrument: 'lead guitar' }, { name: 'David', instrument: 'rhythm guitar' }] } })).to.equal('rhythm guitar');
            expect(Hypr.engine.render('{{ list|findwhere("Name","david", true)|prop("instrument") }}', { locals: { list: [{ name: 'Nigel', instrument: 'lead guitar' }, { name: 'David', instrument: 'rhythm guitar' }] } })).to.equal('');
        });
        it('has a get_product_attribute filter that gets an attribute on a mozu runtime product', function() {
            var tpt1 = '{% with p|get_product_attribute("tenant~manufacturer") as manufacturer %}{{ manufacturer.values|first|prop("stringValue") }}{% endwith %}';
            expect(Hypr.engine.render(tpt1, { locals: { p: MozuProduct } })).to.equal('Seismic Audio');
            var tpt2 = '{% with p|get_product_attribute("tenant~product-crosssell") as crossells %}{% for crossell in crossells.values %} {{ crossell.stringValue }} {% endfor %}{% endwith %}';
            expect(Hypr.engine.render(tpt2, { locals: { p: MozuProduct } })).to.equal(' Speaker Stand  Enforcer II  FL-155P  FL-15P  TW12S35  TW12S75 ');
            var tpt3 = '{% with p|get_product_attribute("tenant~additional-handling") as addlh %}{{ addlh.values|first|prop("value") }}{% endwith %}';
            expect(Hypr.engine.render(tpt3, { locals: { p: MozuProduct } })).to.equal('false');
        });

        /*
         *  "values": [
                    {
                        "value": "Speaker-Stand",
                        "stringValue": "Speaker Stand"
                    },
                    {
                        "value": "Enforcer-II",
                        "stringValue": "Enforcer II"
                    },
                    {
                        "value": "FL-155P",
                        "stringValue": "FL-155P"
                    },
                    {
                        "value": "FL-15P",
                        "stringValue": "FL-15P"
                    },
                    {
                        "value": "TW12S35",
                        "stringValue": "TW12S35"
                    },
                    {
                        "value": "TW12S75",
                        "stringValue": "TW12S75"
                    }
         */

        it('has a get_product_attribute_values filter that gets a list of just the primitive values of an attribute on a mozu runtime product', function() {
            var tpt1 = '{{ p|get_product_attribute_values("tenant~product-crosssell")|join }}';
            expect(Hypr.engine.render(tpt1, { locals: { p: MozuProduct } })).to.equal('Speaker Stand,Enforcer II,FL-155P,FL-15P,TW12S35,TW12S75');
            var tpt2 = '{{ p|get_product_attribute_values("tenant~product-crosssell", true)|join }}';
            expect(Hypr.engine.render(tpt2, { locals: { p: MozuProduct } })).to.equal('Speaker-Stand,Enforcer-II,FL-155P,FL-15P,TW12S35,TW12S75');
        });
        it('has a get_product_attribute_value filter that gets the first value of an attribute on a mozu runtime product', function() {
            var tpt1 = '{{ p|get_product_attribute_value("tenant~manufacturer") }}';
            expect(Hypr.engine.render(tpt1, { locals: { p: MozuProduct } })).to.equal('Seismic Audio');
            var tpt2 = '{{ p|get_product_attribute_value("tenant~product-crosssell") }}';
            expect(Hypr.engine.render(tpt2, { locals: { p: MozuProduct } })).to.equal('Speaker Stand');
            var tpt3 = '{{ p|get_product_attribute_value("tenant~additional-handling") }}';
            expect(Hypr.engine.render(tpt3, { locals: { p: MozuProduct } })).to.equal('false');
            var tpt4 = '{% if p|get_product_attribute_value("tenant~additional-handling") %}Has Handling{% endif %}';
            expect(Hypr.engine.render(tpt4, { locals: { p: MozuProduct } })).to.equal('');
            var tpt4 = '{% if p|get_product_attribute_value("tenant~true-thing") %}Has True Thing{% endif %}';
            expect(Hypr.engine.render(tpt4, { locals: { p: MozuProduct } })).to.equal('Has True Thing');
        });

        describe('has a dictsort filter that', function() {

            var gang = [
                {
                    name: 'Scooby',
                    age: 3
                },
                {
                    name: 'Shaggy',
                    age: 20
                },
                {
                    name: 'Fred',
                    age: 17
                },
                {
                    name: 'Daphne',
                    age: 18
                },
                {
                    name: 'Velma',
                    age: 15
                }
            ];

            describe('sorts (ascending) a dictionary of values based on', function() {
                it('a numeric key', function() {
                    var tpt = '{% with gang|dictsort("age") as g %}{% for member in g %}{{member.name}}:{{member.age}},{% endfor %}{% endwith %}';
                    expect(Hypr.engine.render(tpt, { locals: { gang: gang } })).to.equal('Scooby:3,Velma:15,Fred:17,Daphne:18,Shaggy:20,');
                });
                it('a string key', function() {
                    var tpt2 = '{% with gang|dictsort("name") as g %}{% for member in g %}{{member.name}}:{{member.age}},{% endfor %}{% endwith %}';
                    expect(Hypr.engine.render(tpt2, { locals: { gang: gang } })).to.equal('Daphne:18,Fred:17,Scooby:3,Shaggy:20,Velma:15,');
                });
                it('can be case insensitive string keys', function() {
                    var tpt2 = '{% with gang|dictsort("nAmE") as g %}{% for member in g %}{{member.name}}:{{member.age}},{% endfor %}{% endwith %}';
                    expect(Hypr.engine.render(tpt2, { locals: { gang: gang } })).to.equal('Daphne:18,Fred:17,Scooby:3,Shaggy:20,Velma:15,');
                });
            });

            describe('has a dictsortreversed variant which sorts (descending) a dictionary of values based on', function() {
                it('a numeric key', function() {
                    var tpt = '{% with gang|dictsortreversed("age") as g %}{% for member in g %}{{member.name}}:{{member.age}},{% endfor %}{% endwith %}';
                    expect(Hypr.engine.render(tpt, { locals: { gang: gang } })).to.equal('Shaggy:20,Daphne:18,Fred:17,Velma:15,Scooby:3,');
                });
                it('a string key', function() {
                    var tpt2 = '{% with gang|dictsortreversed("name") as g %}{% for member in g %}{{member.name}}:{{member.age}},{% endfor %}{% endwith %}';
                    expect(Hypr.engine.render(tpt2, { locals: { gang: gang } })).to.equal('Velma:15,Shaggy:20,Scooby:3,Fred:17,Daphne:18,');
                });
                it('can be case insensitive string keys', function() {
                    var tpt2 = '{% with gang|dictsortreversed("nAmE") as g %}{% for member in g %}{{member.name}}:{{member.age}},{% endfor %}{% endwith %}';
                    expect(Hypr.engine.render(tpt2, { locals: { gang: gang } })).to.equal('Velma:15,Shaggy:20,Scooby:3,Fred:17,Daphne:18,');
                });
            });

            describe('has a split filter that splits a string on a given character to make a list', function() {
                it('splits on space by default', function() {
                    var tpt = '{% for word in value|split %}"{{word}}" {% endfor %}';
                    expect(Hypr.engine.render(tpt, { locals: { value: "three little words" } })).to.equal('"three" "little" "words" ');
                });
                function splitWith(value, char) {
                    var tpt = '{% for word in value|split(char) %}"{{word}}"{% endfor %}'
                    return Hypr.engine.render(tpt, { locals: { value: value, char: char } });
                }
                it('splits on other characters', function() {
                    expect(splitWith('three,little,words', ",")).to.equal('"three""little""words"');
                    expect(splitWith('three,little,words', 'l')).to.equal('"three,""itt""e,words"');
                    expect(splitWith('102030405', 0)).to.equal('"1""2""3""4""5"');
                });
                it('fails on splitting things that cannot be split', function() {
                    expect(function() { return splitWith({ an: "object" }, ","); }).to.throw(/Must supply a string/);
                    expect(function() { return splitWith("something", { an: "object" }); }).to.throw(/Must supply a string/);
                });
            });

            describe('has a replace filter that replaces all substrings within a string with a replacement string', function() {
                it('fails informatively if called with no arguments', function() {
                    expect(function() {
                        Hypr.engine.render(" {{ value|replace }} ", { locals: { value: "hi" } });
                    }).to.throw(/at least one argument/);
                });
                function tryReplace(str, r) {
                    var tpt = arguments.length === 2 ? "{{ value|replace(str, r) }}" : "{{ value|replace(str) }}";
                    return Hypr.engine.render(tpt, {
                        locals: {
                            value: "The quick brown fox jumps over the lazy dog",
                            str: str,
                            r: r
                        }
                    });
                }
                it('fails informatively if called on a non-string', function() {
                    expect(function() {
                        Hypr.engine.render("{{ value|replace(str) }}", {
                            locals: {
                                value: { an: "object" },
                                str: "str"
                            }
                        });
                    }).to.throw(/Must supply a string or number as the value/);
                });
                it('fails informatively if called with a non-string to replace', function() {
                    expect(function() {
                        return tryReplace({ an: "object" });
                    }).to.throw(/Must supply a string or number as the string to replace argument/);
                });
                it('fails informatively if called with a non-string to replace with', function() {
                    expect(function() {
                        return tryReplace("quick", { an: "object" });
                    }).to.throw(/Must supply a string or number as the second argument/);
                });
                it("deletes all instances of the string if you don't supply a replacement string", function() {
                    expect(tryReplace("quick ")).to.equal("The brown fox jumps over the lazy dog");
                });
                it("replaces all instances of the string if you supply a replacement string", function() {
                    expect(tryReplace("quick", "questionable")).to.equal("The questionable brown fox jumps over the lazy dog");
                });
            })


        });

        
    });
})