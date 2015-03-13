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
        })
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
    });
    describe('custom filters', function() {
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
            expect(Hypr.engine.render(tpt2, { locals: { p: MozuProduct } })).to.equal(' Speaker-Stand  Enforcer-II  FL-155P  FL-15P  TW12S35  TW12S75 ');
            var tpt3 = '{% with p|get_product_attribute("tenant~additional-handling") as addlh %}{{ addlh.values|first|prop("value") }}{% endwith %}';
            expect(Hypr.engine.render(tpt3, { locals: { p: MozuProduct } })).to.equal('false');
        });
        it('has a get_product_attribute_value filter that gets the first value of an attribute on a mozu runtime product', function() {
            var tpt1 = '{{ p|get_product_attribute_value("tenant~manufacturer") }}';
            expect(Hypr.engine.render(tpt1, { locals: { p: MozuProduct } })).to.equal('Seismic Audio');
            var tpt2 = '{{ p|get_product_attribute_value("tenant~product-crosssell") }}';
            expect(Hypr.engine.render(tpt2, { locals: { p: MozuProduct } })).to.equal('Speaker-Stand');
            var tpt3 = '{{ p|get_product_attribute_value("tenant~additional-handling") }}';
            expect(Hypr.engine.render(tpt3, { locals: { p: MozuProduct } })).to.equal('false');
            var tpt4 = '{% if p|get_product_attribute_value("tenant~additional-handling") %}Has Handling{% endif %}';
            expect(Hypr.engine.render(tpt4, { locals: { p: MozuProduct } })).to.equal('');
            var tpt4 = '{% if p|get_product_attribute_value("tenant~true-thing") %}Has True Thing{% endif %}';
            expect(Hypr.engine.render(tpt4, { locals: { p: MozuProduct } })).to.equal('Has True Thing');
        });

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

        it('has a dictsort filter that sorts a dictionary of values based on a numeric or string key', function() {
            var tpt = '{% with gang|dictsort("age") as g %}{% for member in g %}{{member.name}}:{{member.age}},{% endfor %}{% endwith %}';
            expect(Hypr.engine.render(tpt, { locals: { gang: gang } })).to.equal('Scooby:3,Velma:15,Fred:17,Daphne:18,Shaggy:20,');
            var tpt2 = '{% with gang|dictsort("name") as g %}{% for member in g %}{{member.name}}:{{member.age}},{% endfor %}{% endwith %}';
            expect(Hypr.engine.render(tpt2, { locals: { gang: gang } })).to.equal('Daphne:18,Fred:17,Scooby:3,Shaggy:20,Velma:15,');
        });

        it('has a dictsortreversed filter that sorts (reversed) a dictionary of values based on a numeric or string key', function() {
            var tpt = '{% with gang|dictsortreversed("age") as g %}{% for member in g %}{{member.name}}:{{member.age}},{% endfor %}{% endwith %}';
            expect(Hypr.engine.render(tpt, { locals: { gang: gang } })).to.equal('Shaggy:20,Daphne:18,Fred:17,Velma:15,Scooby:3,');
            var tpt2 = '{% with gang|dictsortreversed("name") as g %}{% for member in g %}{{member.name}}:{{member.age}},{% endfor %}{% endwith %}';
            expect(Hypr.engine.render(tpt2, { locals: { gang: gang } })).to.equal('Velma:15,Shaggy:20,Scooby:3,Fred:17,Daphne:18,');
        });
    });
})