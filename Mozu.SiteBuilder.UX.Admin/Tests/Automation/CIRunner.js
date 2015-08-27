var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[3] || Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152,
    webRoot = process.argv[2] || process.cwd(),
    phantomBat = "phantomjs.bat",
    phantomArgs = ["http://localhost:" + port + "/admin/tests/index.html", "--exclude", "integration", "--report-format", "JUnit", "--report-file", "jUnit.xml"],
    testRootDir = webRoot + "\\Tests\\Automation\\",
    spawner = require('child_process').spawn,
    siestaProcess,
    exec = require('child_process').exec,
    skipLogFilter = ["- no changes", " - sucess", "- success", "tasks - execute", "AJAX Exception", "ajaxproxy-exception", "final callback"],
    server = http.createServer(function (request, response) {

            var uri = url.parse(request.url).pathname.substring('/admin'.length),
                filename = path.join(webRoot, uri);
            fs.exists(filename, function (exists) {
                    if (!exists) {
                        response.writeHead(404, {
                            "Content-Type": "text/plain"
                        });
                        response.write("404 Not Found\n");
                        response.end();
                        return;
                    }

                    if (fs.statSync(filename).isDirectory()) {
                        filename += '/index.html';
                    }
                        fs.readFile(filename, "binary", function (err, file) {
                            if (err) {
                                response.writeHead(500, {
                                    "Content-Type": "text/plain"
                                });
                                response.write(err + "\n");
                                response.end();
                                return;
                            }

                            var ct = null;
                            switch (filename.toLowerCase().split('.').pop()) {
                            case "css":
                                ct = "text/css";
                                break;
                            case "js":
                                ct = "text/javascript";
                                break;
                            case "html":
                            case "cshtml":
                                ct = "text/html";
                                break;
                            }

                            if (ct) {
                                response.setHeader("Content-Type", ct);
                            }

                            response.write(file, "binary");
                            response.end();
                        });
                    });
            }).listen(parseInt(port, 10));


        console.log('web server set up @ port ' + port + ' for /admin -' + testRootDir);



        if (!fs.existsSync(testRootDir + "\\" + phantomBat)) {
            console.log('cant find phantom.bat in directory' + testRootDir + "\\" + phantomBat);
            process.exit(5);
        }



        siestaProcess = spawner(phantomBat, phantomArgs, {
            cwd: testRootDir
        });

        siestaProcess.stdout.on('data', function (data) {

            var cnt = data.toString().trim();
            if (skipLogFilter.some(function (filter) {
                return cnt.indexOf(filter) != -1;
            })) {
                return;
            }
            if (cnt.toLowerCase().indexOf("fail") != -1) {
                console.error(cnt);
            } else {
                console.log(cnt);
            }


        });

        siestaProcess.stderr.on('data', function (data) {
            console.error(data.toString().trim());
        });

        siestaProcess.on('close', function (code) {
            code = code > 0 ? code : 0;


            exec('xslt.exe junit.xml junitToTrx.xslt junit.trx', {
                cwd: testRootDir
            }, function (error, stout, sterr) {
                process.exit(code);
            });


            
        });