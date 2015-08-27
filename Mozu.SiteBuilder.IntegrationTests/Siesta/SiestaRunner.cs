using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using Microsoft.Owin;
using Microsoft.Owin.FileSystems;
using Microsoft.Owin.Hosting;
using Microsoft.Owin.StaticFiles;
using Microsoft.Owin.StaticFiles.ContentTypes;
using Mozu.Core.Extensions;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Owin;

namespace Mozu.SiteBuilder.IntegrationTests.Siesta
{

    [Category("Siesta")]
    internal class SiestaRunner
    {
        private readonly AutoResetEvent _autoResetEvent = new AutoResetEvent(true);

        private readonly HashSet<string> _notFounds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        private readonly Regex _phantomJsRegex = new Regex(@"^__PHANTOMJS__:([\s\S]*)",
            RegexOptions.Compiled);

        private string __baseDir;
        private JsonTestReport _currentReport;

        private string _jsRunnerPath;
        private Process _phantomJs;
        private string _phantomJsPath;
        private int _port;
        private IDisposable _webServer;

    

        private static List<string> badTests = new List<string> ()

        {
            //"order/widget/paymentpanel.t.js"
        };


        private string BaseDirectory
        {
            get
            {
                InitDirs();
                return __baseDir;
            }
        }

        private string PhantomJsPath
        {
            get
            {
                InitDirs();
                return _phantomJsPath;
            }
        }

        private string JsRunnerPath
        {
            get
            {
                InitDirs();
                return _jsRunnerPath;
            }
        }


        private void InitDirs()
        {
            if (__baseDir == null)
            {
                var solDir = new DirectoryInfo(AppDomain.CurrentDomain.BaseDirectory); //new FileInfo(typeof (SiestaRunner).Assembly.Location).Directory;//new System.IO.DirectoryInfo(TestContext.CurrentContext.WorkDirectory);

                bool checkedSourceDir = false;
                while (true)
                {
                    if (solDir.GetFiles("Mozu.SiteBuilder.sln").Any())
                    {
                        __baseDir = solDir.FullName + @"\Mozu.SiteBuilder.UX.Admin";
                        _jsRunnerPath = solDir.FullName + @"\Mozu.SiteBuilder.IntegrationTests\Siesta\SiestaRunner.js";
                        _phantomJsPath = solDir.FullName + @"\Mozu.SiteBuilder.UX.Admin\Tests\Automation\binary\phantomjs-1.9.7-windows\phantomjs.exe";
                        break;
                    }
                    if (!checkedSourceDir && solDir.GetDirectories("Binaries").Any() && solDir.GetDirectories("Sources").Any())
                    {
                        checkedSourceDir = true;
                        solDir = solDir.GetDirectories("Sources").First();
                    }
                    else
                    {
                        solDir = solDir.Parent;
                    }
                }
            }
        }


        [TestFixtureSetUp]
        public void FixtureSetup()
        {
            string jsRunnerPath;

            
            _port = new Random().Next(49152, 65535);
            // var baseDir = "C:\\projects\\mzt\\UI\\Dev\\Dev-branch\\Mozu.SiteBuilder\\Mozu.SiteBuilder.UX.Admin";

            string url = "http://localhost:" + _port;
            //  var root = args.Length > 0 ? args[0] : ".";
            var fileSystem = new PhysicalFileSystem(BaseDirectory);

            var options = new FileServerOptions
                          {
                              EnableDirectoryBrowsing = true,
                              FileSystem = fileSystem,
                              RequestPath = new PathString("/admin"),
                           
                              
                          };
            options.StaticFileOptions.ServeUnknownFileTypes = true;
            ((FileExtensionContentTypeProvider) options.StaticFileOptions.ContentTypeProvider).Mappings.Add(".cshtml", "text/html");
            options.StaticFileOptions.OnPrepareResponse = context =>
            {
                context.OwinContext.Response.Headers["Cache-Control"] = "max-age=630720000,public";
            };
            _webServer = WebApp.Start(url, builder => builder.UseFileServer(options));


            _phantomJs = new Process();


            _phantomJs.StartInfo = new ProcessStartInfo(PhantomJsPath)
                                   {
                                       Arguments = string.Format("\"{0}\" \"{1}\" {2}", JsRunnerPath, BaseDirectory, _port),
                                       RedirectStandardInput = true,
                                       RedirectStandardOutput = true,
                                       RedirectStandardError = true,
                                       CreateNoWindow = true,
                                       UseShellExecute = false
                                   };

            

            _phantomJs.Start();
            _autoResetEvent.Reset();
            _phantomJs.OutputDataReceived += OnLineRead;
            _phantomJs.BeginOutputReadLine();
            _autoResetEvent.WaitOne(20*1000);
        }


        

        [TestFixtureTearDown]
        public void FixtureTearDown()
        {
            //_p.Kill();
            _webServer.Dispose();

            _phantomJs.StandardInput.WriteLine("exit");
            _phantomJs.WaitForExit(10000);
            if (!_phantomJs.HasExited)
            {
                _phantomJs.Kill();
            }
        }

        private void OnLineRead(object sender, DataReceivedEventArgs e)
        {
            string line = e.Data;
            if (line == null)
            {
                return;
            }
            Match match = _phantomJsRegex.Match(line);
            if (!match.Success)
            {
                Debug.WriteLine(line);
                return;
            }

            string command = match.Groups[1].Value;
           
            //if (command.StartsWith("exit:"))
            //{
            //    int code = int.Parse(command.Substring("exit:".Length));
            //    if (code != 4)
            //    {
                   
            //    }
            //}
            if (command.StartsWith("pageReport:"))
            {
                _currentReport = JObject.Parse(command.Substring("pageReport:".Length)).ToObject<JsonTestReport>();
            }
            if (command.StartsWith("testReady"))
            {
                _autoResetEvent.Set();
            }
            else if (command.StartsWith("errorFindingTest:"))
            {
                string test = command.Substring("errorFindingTest:".Length);
                Debug.WriteLine(command);
                _notFounds.Add(test);
            }
        }

        private void WalkAssertions(JsonTestAssertion ass)
        {
           
            if (ass.assertions != null)
            {
                ass.assertions.Each(WalkAssertions);
            }
            if (ass.passed.HasValue && ass.passed.Value)
            {
                Assert.IsTrue(true, ass.description);
            }
            else if (ass.passed.HasValue && !ass.passed.Value)
            {
                Assert.Fail("{0} [{1}]", ass.description, ass.annotation);
            }
        }

        [Test, TestCaseSource("GetCustomUnitTests")]
        public void SiestaCustomUnitTests(TestDescriptor test)
        {
            RunTest(test);
        }

        [Test, TestCaseSource("GetUnitTests")]
        public void SiestaUnitTests(TestDescriptor test)
        {
            RunTest(test);
        }

        [Test, TestCaseSource("GetFunctionalTests")]
        public void SiestaFunctionalTests(TestDescriptor test)
        {
            RunTest(test);
        }

        private void RunTest(TestDescriptor test)
        {
            _currentReport = null;

            var normalizedName = test.Name.ToLowerInvariant().Replace("\\", "/");
            if (badTests.Any(x => normalizedName.IndexOf(x) != -1))
            {
                Assert.Inconclusive("skipping problematic build test:  " + test.Name);
                return;
            }



            _phantomJs.StandardInput.WriteLine(test.Name);

            _autoResetEvent.Reset();

            _autoResetEvent.WaitOne(60*1000);


            if (_currentReport != null)
            {
                _currentReport.testCases[0].assertions.Each(WalkAssertions);
            }
            else
            {
                if (_notFounds.Contains(test.Name))
                {
                    Assert.Fail("test not found:" + test.Name);
                }
                else
                {
                    Assert.Fail("unknown");
                }
            }
        }


        public IList<TestDescriptor> GetCustomUnitTests()
        {
            string path = BaseDirectory + @"\Tests\customunit\";

            return Directory.GetFiles(path, "*.js", SearchOption.AllDirectories).Select(x => new TestDescriptor {Name = "customunit/" + x.Substring(path.Length).Replace("\\", "/")}).ToList();
        }

        public IList<TestDescriptor> GetUnitTests()
        {
            string path = BaseDirectory + @"\Tests\unit\";

            return Directory.GetFiles(path, "*.js", SearchOption.AllDirectories).Select(x => new TestDescriptor {Name = "unit/" + x.Substring(path.Length).Replace("\\", "/")}).ToList();
        }

        public IList<TestDescriptor> GetFunctionalTests()
        {
            string path = BaseDirectory + @"\Tests\Functional\";

            return Directory.GetFiles(path, "*.js", SearchOption.AllDirectories).Select(x => new TestDescriptor {Name = "functional/" + x.Substring(path.Length).Replace("\\", "/")}).ToList();
        }
    }

    public class JsonTestReport
    {
        //  public DateTime endDate { get; set; }
        public bool passed { get; set; }
        public List<JsonTestCase> testCases { get; set; }
    }

    public class JsonTestCase
    {
        public string type { get; set; }
        public string url { get; set; }
        public List<JsonTestAssertion> assertions { get; set; }
    }

    public class JsonTestAssertion
    {
        public string description { get; set; }
        public bool? passed { get; set; }
        public string type { get; set; }
        public string annotation { get; set; }
        public List<JsonTestAssertion> assertions { get; set; }
    }


    public class TestDescriptor
    {
        public string Name { get; set; }

        public override string ToString()
        {
            return Name;
        }
    }
}