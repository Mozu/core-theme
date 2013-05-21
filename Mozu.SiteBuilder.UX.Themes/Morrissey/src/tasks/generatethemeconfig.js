var grunt = require('grunt'),
    async = require('async'),
    xmlbuilder = require('xmlbuilder'),
    Lyrically = require('../lyrically'),

    THEME_CONFIG_FILENAME = "theme.xml";

module.exports = function () {

    var self = require('../optimizer').current,
        done = this.async();

    var xmlDoc = xmlbuilder.create('theme', { 'version': '1.0', 'encoding': 'utf-8' })
        .att('xmlns:xsd', 'http://www.w3.org/2001/XMLSchema')
        .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
        .att('xsi:noNamespaceSchemaLocation', '..\\..\\Tools\\Theme.xsd'),

        name = xmlDoc.ele('name'),
        author = xmlDoc.ele('author'),
        base = xmlDoc.ele('extends'),
        isDesktop = xmlDoc.ele('isDesktop'),
        isMobile = xmlDoc.ele('isMobile');
    // add corevariants flag with comment
    //xmlDoc.comment('Only true for Core themes. DO NOT MODIFY.');
    //xmlDoc.ele('enableCoreVariants').txt('false');

    if (grunt.file.exists(THEME_CONFIG_FILENAME)) {
        self.program.confirm("Theme configuration file already exists. Overwrite? ", function (yes) {
            if (!yes) return done();
            return createIt();
        });
    } else {
        createIt();
    }

    function createIt() {
        async.series([
            function(cb) {
                self.program.prompt("Theme name: ", function(t) {
                    name.txt(t);
                    cb(null)
                });
            },
            function(cb) {
                self.program.prompt("Theme author: ", function(t) {
                    author.txt(t);
                    cb(null);
                })
            },
            function(cb) {
                self.program.confirm("Are mobile browsers supported? ", function (mobile) {
                    isMobile.txt(mobile.toString());
                    if (mobile) {
                        self.program.confirm("Is this theme for mobile browsers ONLY? ", function (noDesktop) {
                            isDesktop.txt((!noDesktop).toString());
                            cb(null);
                        });
                    } else {
                        isDesktop.txt('true');
                        cb(null);
                    }
                });
            },
            function(cb) {
                self.program.confirm("Does this theme extend another theme (usually the base theme)?", function (isExtended) {
                    if (!isExtended) {
                        base.remove();
                        cb(null);
                    } else {
                        self.program.prompt("Base theme name: ", function (themeName) {
                            base.txt(themeName);
                            cb(null);
                        });
                    }
                });
            },
            function (cb) {
                grunt.file.write('theme.xml', xmlDoc.end({ pretty: true }));
                cb(null);
            }
        ],
        function(){
                Lyrically.admit("Theme configuration file created successfully.");
                done();
            });
    }
};