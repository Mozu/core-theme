using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.Mvc;
using System.IO;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;
using dotless.Core;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Microsoft.Win32;
using dotless.Core.Parser.Infrastructure.Nodes;
using dotless.Core.Parser.Infrastructure;
using dotless.Core.Parser.Tree;
using dotless.Core.Exceptions;
using System.Text.RegularExpressions;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class ResourceController : BaseController
    {
        ISiteBuilderContext _sbContext;
        private DjangoMozuViewEngine _viewEngine;
        private IThemeSettingsRepository _themeSettingsRepository;
        public ResourceController ( ISiteBuilderContext sbContext , IThemeSettingsRepository themeSettingsRepository , DjangoMozuViewEngine viewEngine )
        {
            _themeSettingsRepository = themeSettingsRepository;
            _sbContext = sbContext;
            _viewEngine = viewEngine;
        }
       
        //
        // GET: /Resource/
        [ClientCacheHeaders( ConfigKey = "stylesheets")]
        public ActionResult Stylesheets(string pathinfo)
        {

          
            if (Path.GetExtension(pathinfo) == ".less")
            {
                return Less(pathinfo, true); // TODO: set debug to false later
            }
            else
            {
                return Content("stylesheets/" + pathinfo);
            }
            //return Content("stylesheets/" + pathinfo);
        }

        [ClientCacheHeaders(ConfigKey = "stylesheets")]
        public ActionResult Less(string pathinfo, bool debug = false)
        {

            var res = Content("stylesheets/" + pathinfo, "text/css");
            if (res is MozuVirtualFileResult)
            {
                ((MozuVirtualFileResult)res).Transform = new LessTransFormer(pathinfo, debug, this._sbContext, this._themeSettingsRepository, _viewEngine  ).Transform;
            }

            return res;
        }

        class LessLogger : dotless.Core.Loggers.ILogger
        {
            private static string DebugTemplate = "DEBUG: {0}";
            private static string ErrorTemplate = "ERROR: {0}";
            private static string InfoTemplate = "INFO: {0}";
            private static string LogTemplate = "LOG LEVEL {0}: {1}";
            private static string WarnTemplate = "WARNING: {0}";

            public void Debug(string msg)
            {
                System.Diagnostics.Debug.WriteLine(String.Format(DebugTemplate, msg));
            }

            public void Error(string msg)
            {
                System.Diagnostics.Debug.WriteLine(String.Format(ErrorTemplate, msg));
            }

            public void Info(string msg)
            {
                System.Diagnostics.Debug.WriteLine(String.Format(InfoTemplate, msg));
            }

            public void Log(dotless.Core.Loggers.LogLevel level, string msg)
            {
                System.Diagnostics.Debug.WriteLine(String.Format(LogTemplate, level.ToString(), msg));
            }

            public void Warn(string msg)
            {
                System.Diagnostics.Debug.WriteLine(String.Format(WarnTemplate, msg));
            }




            public void Debug(string message, params object[] args)
            {
                System.Diagnostics.Debug.WriteLine(String.Format(DebugTemplate, string.Join ( " -- ", args)));
            }

            public void Error(string message, params object[] args)
            {
                System.Diagnostics.Debug.WriteLine(String.Format(ErrorTemplate, string.Join(" -- ", args)));
            }

            public void Info(string message, params object[] args)
            {
                System.Diagnostics.Debug.WriteLine(String.Format(InfoTemplate, string.Join(" -- ", args)));
            }

            public void Warn(string message, params object[] args)
            {
                System.Diagnostics.Debug.WriteLine(String.Format(WarnTemplate, string.Join(" -- ", args)));
            }
        }
        class MyLessPlugin: dotless.Core.Plugins.VisitorPlugin
        {

            public override dotless.Core.Plugins.VisitorPluginType AppliesTo
            {
                get { return dotless.Core.Plugins.VisitorPluginType.BeforeEvaluation; }
            }

            public override dotless.Core.Parser.Infrastructure.Nodes.Node Execute(dotless.Core.Parser.Infrastructure.Nodes.Node node, out bool visitDeeper)
            {
                visitDeeper = true;
                if (node is dotless.Core.Parser.Tree.Value)
                {
                }
                if (node is dotless.Core.Parser.Tree.Variable)
                {
                    var inNode = (Variable)node;
                    if (inNode.Name == "@headingsColor")
                    {
                    var rule = Env.FindVariable(inNode.Name);
                        var parser = new dotless.Core.Parser.Parser();
                      //  var resRs = parser.Parse("lighten(@orange, 15%)", "xxx");
                        
                    }
                    node = new MyVariable( inNode.Name );
                }
                return node;
                
            }

            public Env Env { get; set; }
        }
        class MyVariable:dotless.Core.Parser.Tree.Variable
        {
            public MyVariable(string name):base(name)
            {}
            public override Node Evaluate(Env env)
            {
                string name = this.Name;
                if (name.StartsWith("@@"))
                {
                    Node node = new MyVariable (name.Substring(1)).Evaluate(env) ;
                    name = '@' + ((node is TextNode) ? (node as TextNode).Value : node.ToCSS(env));
                }
                
                Rule rule = env.FindVariable(name);
                if (Name == "headingsColor" || Name == "@headingsColor")
                {
                }

                if (rule == null)
                {
                    throw new ParsingException("variable " + name + " is undefined", base.Location);
                }
                return rule.Value.Evaluate(env);
            }

            
        }
       
        class LessTransFormer
        {
            bool _debug;
            string _path;

            static Regex g_regex = new Regex(@"\{\{[\s]*(?<col>[\w]+)\.(?<var>[\w-]+)(?<filters>(?:\|\w+(?:\:[^\|\}]+)?)*)[\s]*\}\}",
                RegexOptions.IgnoreCase |
                RegexOptions.Compiled |
                RegexOptions.Singleline |
                RegexOptions.IgnorePatternWhitespace);
            //private static ConcurrentDictionary<string, Regex> g_regexDic =
            //    new ConcurrentDictionary<string, Regex>();
            private IThemeSettingsRepository _themeSettingsRepository;
            private ISiteBuilderContext _siteContext;
            private DjangoMozuViewEngine _viewEngine;
           
            public LessTransFormer(string path, bool debug, ISiteBuilderContext siteContext, IThemeSettingsRepository themeSettingsRepository,DjangoMozuViewEngine viewEngine)
            {
                _siteContext = siteContext;
                _debug = debug;
                _path = path;
                _themeSettingsRepository = themeSettingsRepository;
                _viewEngine = viewEngine;

            }

            class ConfigurationFieldComparer : IEqualityComparer<ConfigurationField>
            {

                public bool Equals(ConfigurationField x, ConfigurationField y)
                {
                    return x.Id == y.Id;
                }

                public int GetHashCode(ConfigurationField obj)
                {
                    return obj.Id.GetHashCode();
                }
            }

          
          
            public ISiteBuilderContext SiteContext
            {
                get { return _siteContext; }
                set { _siteContext = value; }
            }

            public Stream Transform(Stream str)
            {
                var sr = new StreamReader(str);
                var template = sr.ReadToEnd();

                
                template = this.ProcessSettingsVariables(template);
                var factory = new EngineFactory();

                factory.Configuration.Logger = typeof (LessLogger);
                factory.Configuration.MinifyOutput = !_debug;
                factory.Configuration.LessSource = typeof (MyLessFileReader);

                var reader = new MyLessFileReader(this,_viewEngine);


                var parser = new dotless.Core.Parser.Parser()
                                 {
                                     Importer =
                                         new dotless.Core.Importers.Importer(reader)
                                 };

                var tree = parser.Parse(template, _path);

                var env = new dotless.Core.Parser.Infrastructure.Env {Compress = !_debug};
                //env.AddPlugin(new MyLessPlugin() { Env = env });
                // var rs = new dotless.Core.Parser.Tree.Ruleset()
                // env.Frames.Push( new dotless.Core.Parser.Tree.Ruleset);

                env.Output.Push().Append(tree);
                var sb = env.Output.Pop();
                MemoryStream ms = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(sb.ToString()));
                ms.Position = 0;
                return ms;




            }

            public  string ProcessSettingsVariables(string template)
            {
                if ( template.IndexOf( "{{") > -0 )
                {
                    return g_regex.Replace(template, Evaluator);
                }
                return template;
            }

            private string Evaluator(Match match)
            {
                var varName = match.Groups["var"].Value;
                return _siteContext.ThemeSettings[varName] as string;

            }

            //private Regex RegexFactory(string s)
            //{
            //    return new Regex(@"(?=[^(])@(?<var>(" + s + "))[/s]*:(?<val>[^;]+);", 
            //    RegexOptions.Multiline | 
            //    RegexOptions.ExplicitCapture | 
            //    RegexOptions.IgnorePatternWhitespace);

            //}

            //internal string ProcessSettingsVariables(string ret)
            //{
            //    if (_regex == null)
            //    {
            //        var settings  = _themeSettingsRepository.GetRuntimeValues();
            //        _variableDictionary  = new  Dictionary<string, string>();
                    
            //        foreach (var item in settings.Items)
            //        {
            //            foreach (var field in item.Fields.Where( x=> x.Usage == "style"))
            //            {
            //                _variableDictionary[item.Id +"-"+ field.Id] = field.GetValueOrDefault();
            //            }
            //        }

            //        var selector = string.Join("|", _variableDictionary.Keys );

            //        _regex = g_regexDic.GetOrAdd(selector, RegexFactory);
            //    }


            //    return _regex.Replace(ret,Evaluator);
                
            //}
        }
        class MyLessFileReader : dotless.Core.Input.IFileReader
        {
            private LessTransFormer lessTransFormer;
            private DjangoMozuViewEngine _viewEngine;
            public MyLessFileReader(LessTransFormer lessTransFormer , DjangoMozuViewEngine viewEngine)
            {
                this.SiteContext = lessTransFormer.SiteContext;
                this.lessTransFormer = lessTransFormer;
                _viewEngine = viewEngine;
            }
            ISiteBuilderContext SiteContext
            {
                get;
                set;
            }
            // public ResourceController Controller { get; set; }
            public string GetFileContents(string fileName)
            {
                
                foreach (var theme in SiteContext.Theme.Stack )
                {
                    string stem = fileName;
                    var file = _viewEngine.PathProvider.GetFile(stem) as MozuVirtualFile;
                    if (file != null && file.Exists)
                    {
                        using (var stream = file.Open())
                        {
                            var ret =  new StreamReader(stream).ReadToEnd();
                            return  this.lessTransFormer.ProcessSettingsVariables(ret);
                        }

                    }
                }

                return string.Empty;

            }

            public bool DoesFileExist(string fileName)
            {
                //todo: implement
                return true;
                //throw new NotImplementedException();
            }


            public byte[] GetBinaryFileContents(string fileName)
            {
                foreach (var theme in SiteContext.Theme.Stack)
                {
                    string stem =  fileName;
                    var file = ViewEngines.Engines.OfType<DjangoMozuViewEngine>().First().PathProvider.GetFile(stem) as MozuVirtualFile;
                    if (file != null && file.Exists)
                    {
                        using (var stream = file.Open())
                        {
                            byte[] data = new byte[ stream.Length];
                            stream.Read(data, 0 , data.Length );
                            return data;

                            
                        }

                    }
                }

                return null;
            }
        }

        [ClientCacheHeaders(ConfigKey = "scripts")]
        public ActionResult ScriptsBuilt(string pathinfo)
        {
            return Content("scripts-built/" + pathinfo, "text/javascript");
        }
        [ClientCacheHeaders(ConfigKey = "scripts")]
        public ActionResult Scripts(string pathinfo)
        {
            return Content("scripts/" + pathinfo, "text/javascript");
        }
        [ClientCacheHeaders(ConfigKey = "images")]
        public ActionResult Images(string pathinfo)
        {
            return Content("images/" + pathinfo);
        }
        [ClientCacheHeaders(ConfigKey = "templates")]
        public ActionResult Templates(string pathinfo)
        {
            return Content("templates/" + pathinfo, "text/javascript");
        }
        [ClientCacheHeaders(ConfigKey = "fonts")]
        public ActionResult Fonts(string pathinfo)
        {
            return Content("fonts/" + pathinfo);
        }
        [ClientCacheHeaders(ConfigKey = "content")]
        public new ActionResult Content(string pathinfo, string contentType = null)
        {
            if (contentType == null)
            {
                contentType = GetMimeType(pathinfo);
            }

            return GetFileResult(pathinfo, contentType);


        }

        ActionResult GetFileResult(string pathinfo, string contentType)
        {
            foreach (var theme in _sbContext.Theme.Stack)
            {
                string stem = "resources/" + pathinfo;
                
                // var file = ViewEngines.Engines.OfType<DjangoMozuViewEngine>().First().PathProvider.GetFile(stem) as MozuVirtualFile;
                var file = (new DjangoMozuViewEngine()).PathProvider.GetFile(stem) as MozuVirtualFile;
                if (file != null && file.Exists)
                {
                    return new MozuVirtualFileResult(stem, contentType, file);
                }
            }


            return new HttpNotFoundResult();
        }

        public class MozuVirtualFileResult : FileResult
        {
            MozuVirtualFile _file;

            public MozuVirtualFileResult(string path, string contentType, MozuVirtualFile file)
                : base(contentType)
            {
                _file = file;
            }

            public Func<Stream, Stream> Transform
            {
                get;
                set;
            }

            protected override void WriteFile(HttpResponseBase response)
            {
                using (var stream = _file.Open())
                {
                    Stream source = stream;
                    if (Transform != null)
                    {
                        source = Transform(stream);
                    }
                    source.CopyTo(response.OutputStream);
                }
            }
        }

        static Lazy<Dictionary<string, string>> g_mimeTypeDic = new Lazy<Dictionary<string, string>>(BuildMimeTypeDictionary, true);

        static string GetMimeType(string path)
        {
            string mimeType;

            var ext = Path.GetExtension(path);
            if (!g_mimeTypeDic.Value.TryGetValue(ext, out mimeType))
            {
                mimeType = "application/unknown";
            }
            return mimeType;
        }

        static Dictionary<string, string> BuildMimeTypeDictionary()
        {
            Dictionary<string, string> dic = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            foreach (var mimeMatch in g_hardCodedMimeTypes)
            {
                dic["." + mimeMatch.Key] = mimeMatch.Value;
            }
           
            foreach (var keyName in Registry.ClassesRoot.GetSubKeyNames())
            {
                RegistryKey regKey = Registry.ClassesRoot.OpenSubKey(keyName, false);
                object contentType = regKey.GetValue("Content Type");
                if (contentType != null)
                {
                    dic[keyName] = contentType.ToString();
                }
            }

            return dic;
        }

        static readonly Dictionary<string, string> g_hardCodedMimeTypes = new Dictionary<string, string>
        {
            {"ai", "application/postscript"},
            {"aif", "audio/x-aiff"},
            {"aifc", "audio/x-aiff"},
            {"aiff", "audio/x-aiff"},
            {"asc", "text/plain"},
            {"atom", "application/atom+xml"},
            {"au", "audio/basic"},
            {"avi", "video/x-msvideo"},
            {"bcpio", "application/x-bcpio"},
            {"bin", "application/octet-stream"},
            {"bmp", "image/bmp"},
            {"cdf", "application/x-netcdf"},
            {"cgm", "image/cgm"},
            {"class", "application/octet-stream"},
            {"cpio", "application/x-cpio"},
            {"cpt", "application/mac-compactpro"},
            {"csh", "application/x-csh"},
            {"css", "text/css"},
            {"dcr", "application/x-director"},
            {"dif", "video/x-dv"},
            {"dir", "application/x-director"},
            {"djv", "image/vnd.djvu"},
            {"djvu", "image/vnd.djvu"},
            {"dll", "application/octet-stream"},
            {"dmg", "application/octet-stream"},
            {"dms", "application/octet-stream"},
            {"doc", "application/msword"},
            {"dtd", "application/xml-dtd"},
            {"dv", "video/x-dv"},
            {"dvi", "application/x-dvi"},
            {"dxr", "application/x-director"},
            {"eps", "application/postscript"},
            {"etx", "text/x-setext"},
            {"exe", "application/octet-stream"},
            {"ez", "application/andrew-inset"},
            {"gif", "image/gif"},
            {"gram", "application/srgs"},
            {"grxml", "application/srgs+xml"},
            {"gtar", "application/x-gtar"},
            {"hdf", "application/x-hdf"},
            {"hqx", "application/mac-binhex40"},
            {"htm", "text/html"},
            {"html", "text/html"},
            {"ice", "x-conference/x-cooltalk"},
            {"ico", "image/x-icon"},
            {"ics", "text/calendar"},
            {"ief", "image/ief"},
            {"ifb", "text/calendar"},
            {"iges", "model/iges"},
            {"igs", "model/iges"},
            {"jnlp", "application/x-java-jnlp-file"},
            {"jp2", "image/jp2"},
            {"jpe", "image/jpeg"},
            {"jpeg", "image/jpeg"},
            {"jpg", "image/jpeg"},
            {"js", "application/x-javascript"},
            {"kar", "audio/midi"},
            {"latex", "application/x-latex"},
            {"lha", "application/octet-stream"},
            {"lzh", "application/octet-stream"},
            {"m3u", "audio/x-mpegurl"},
            {"m4a", "audio/mp4a-latm"},
            {"m4b", "audio/mp4a-latm"},
            {"m4p", "audio/mp4a-latm"},
            {"m4u", "video/vnd.mpegurl"},
            {"m4v", "video/x-m4v"},
            {"mac", "image/x-macpaint"},
            {"man", "application/x-troff-man"},
            {"mathml", "application/mathml+xml"},
            {"me", "application/x-troff-me"},
            {"mesh", "model/mesh"},
            {"mid", "audio/midi"},
            {"midi", "audio/midi"},
            {"mif", "application/vnd.mif"},
            {"mov", "video/quicktime"},
            {"movie", "video/x-sgi-movie"},
            {"mp2", "audio/mpeg"},
            {"mp3", "audio/mpeg"},
            {"mp4", "video/mp4"},
            {"mpe", "video/mpeg"},
            {"mpeg", "video/mpeg"},
            {"mpg", "video/mpeg"},
            {"mpga", "audio/mpeg"},
            {"ms", "application/x-troff-ms"},
            {"msh", "model/mesh"},
            {"mxu", "video/vnd.mpegurl"},
            {"nc", "application/x-netcdf"},
            {"oda", "application/oda"},
            {"ogg", "application/ogg"},
            {"pbm", "image/x-portable-bitmap"},
            {"pct", "image/pict"},
            {"pdb", "chemical/x-pdb"},
            {"pdf", "application/pdf"},
            {"pgm", "image/x-portable-graymap"},
            {"pgn", "application/x-chess-pgn"},
            {"pic", "image/pict"},
            {"pict", "image/pict"},
            {"png", "image/png"}, 
            {"pnm", "image/x-portable-anymap"},
            {"pnt", "image/x-macpaint"},
            {"pntg", "image/x-macpaint"},
            {"ppm", "image/x-portable-pixmap"},
            {"ppt", "application/vnd.ms-powerpoint"},
            {"ps", "application/postscript"},
            {"qt", "video/quicktime"},
            {"qti", "image/x-quicktime"},
            {"qtif", "image/x-quicktime"},
            {"ra", "audio/x-pn-realaudio"},
            {"ram", "audio/x-pn-realaudio"},
            {"ras", "image/x-cmu-raster"},
            {"rdf", "application/rdf+xml"},
            {"rgb", "image/x-rgb"},
            {"rm", "application/vnd.rn-realmedia"},
            {"roff", "application/x-troff"},
            {"rtf", "text/rtf"},
            {"rtx", "text/richtext"},
            {"sgm", "text/sgml"},
            {"sgml", "text/sgml"},
            {"sh", "application/x-sh"},
            {"shar", "application/x-shar"},
            {"silo", "model/mesh"},
            {"sit", "application/x-stuffit"},
            {"skd", "application/x-koan"},
            {"skm", "application/x-koan"},
            {"skp", "application/x-koan"},
            {"skt", "application/x-koan"},
            {"smi", "application/smil"},
            {"smil", "application/smil"},
            {"snd", "audio/basic"},
            {"so", "application/octet-stream"},
            {"spl", "application/x-futuresplash"},
            {"src", "application/x-wais-source"},
            {"sv4cpio", "application/x-sv4cpio"},
            {"sv4crc", "application/x-sv4crc"},
            {"svg", "image/svg+xml"},
            {"swf", "application/x-shockwave-flash"},
            {"t", "application/x-troff"},
            {"tar", "application/x-tar"},
            {"tcl", "application/x-tcl"},
            {"tex", "application/x-tex"},
            {"texi", "application/x-texinfo"},
            {"texinfo", "application/x-texinfo"},
            {"tif", "image/tiff"},
            {"tiff", "image/tiff"},
            {"tr", "application/x-troff"},
            {"tsv", "text/tab-separated-values"},
            {"txt", "text/plain"},
            {"ustar", "application/x-ustar"},
            {"vcd", "application/x-cdlink"},
            {"vrml", "model/vrml"},
            {"vxml", "application/voicexml+xml"},
            {"wav", "audio/x-wav"},
            {"wbmp", "image/vnd.wap.wbmp"},
            {"wbmxl", "application/vnd.wap.wbxml"},
            {"wml", "text/vnd.wap.wml"},
            {"wmlc", "application/vnd.wap.wmlc"},
            {"wmls", "text/vnd.wap.wmlscript"},
            {"wmlsc", "application/vnd.wap.wmlscriptc"},
            {"wrl", "model/vrml"},
            {"xbm", "image/x-xbitmap"},
            {"xht", "application/xhtml+xml"},
            {"xhtml", "application/xhtml+xml"},
            {"xls", "application/vnd.ms-excel"},
            {"xml", "application/xml"},
            {"xpm", "image/x-xpixmap"},
            {"xsl", "application/xml"},
            {"xslt", "application/xslt+xml"},
            {"xul", "application/vnd.mozilla.xul+xml"},
            {"xwd", "image/x-xwindowdump"},
            {"woff","APPLICATION/X-WOFF"},
            {"xyz", "chemical/x-xyz"},
            {"zip", "application/zip"}
        };
    }
}
