using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;

using Microsoft.Win32;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using dotless.Core;
using dotless.Core.Exceptions;
using dotless.Core.Importers;
using dotless.Core.Input;
using dotless.Core.Loggers;
using dotless.Core.Parser;
using dotless.Core.Parser.Infrastructure;
using dotless.Core.Parser.Infrastructure.Nodes;
using dotless.Core.Parser.Tree;
using dotless.Core.Plugins;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class ResourceController : BaseApiController
    {
        private static readonly Lazy<Dictionary<string, string>> g_mimeTypeDic = new Lazy<Dictionary<string, string>>(BuildMimeTypeDictionary, true);

        private static readonly Dictionary<string, string> g_hardCodedMimeTypes = new Dictionary<string, string>
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
                                                                                          {"woff", "APPLICATION/X-WOFF"},
                                                                                          {"xyz", "chemical/x-xyz"},
                                                                                          {"zip", "application/zip"}
                                                                                      };

        private readonly MozuVirtualPathProvider _pathProvider;
        private readonly ISiteBuilderContext _sbContext;
        private readonly IThemeSettingsRepository _themeSettingsRepository;


        public ResourceController(ISiteBuilderContext sbContext, IThemeSettingsRepository themeSettingsRepository,   MozuVirtualPathProvider pathProvider)
        {
            _themeSettingsRepository = themeSettingsRepository;
            _sbContext = sbContext;
            
            _pathProvider = pathProvider;
        }

        //
        // GET: /Resource/
        [ClientCacheHeaders(ConfigKey = "stylesheets")]
        [System.Web.Http.HttpGet]
        public HttpResponseMessage  Stylesheets(string pathinfo)
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
        [System.Web.Http.HttpGet]
        public HttpResponseMessage  Less(string pathinfo, bool debug = false)
        {
            var res = Content("stylesheets/" + pathinfo, "text/css");
            var oc = res.Content as ObjectContent<MozuVirtualFileResult>;
            if (oc!= null)
            {

                ((MozuVirtualFileResult)oc.Value).Transform = new LessTransFormer(pathinfo, debug, this, _themeSettingsRepository, _pathProvider).Transform;
            }

            return res;
        }


        [ClientCacheHeaders(ConfigKey = "livetemplates")]
        [System.Web.Http.HttpGet]
        public JObject LiveTemplates(bool? debug = false)
        {
            JObject jobj = new JObject();
            foreach (var template in _pathProvider.GetLveTemplates())
            {
                jobj.Add(new JProperty(
                                           template.VirtualPathNoExt.Replace('\\', '/').Replace("templates/", ""),
                                           System.IO.File.ReadAllText(template.FullPath)
                                           ));

            }
          

            return jobj;


            ;
        }


        [ClientCacheHeaders(ConfigKey = "scripts")]
        [System.Web.Http.HttpGet]
        public HttpResponseMessage  ScriptsBuilt(string pathinfo)
        {
            return Content("scripts-built/" + pathinfo, "text/javascript");
        }

        [ClientCacheHeaders(ConfigKey = "scripts")]
        [System.Web.Http.HttpGet]
        public HttpResponseMessage  Scripts(string pathinfo)
        {
            return Content("scripts/" + pathinfo, "text/javascript");
        }

        //[ClientCacheHeaders(ConfigKey = "images")]
        //[System.Web.Http.HttpGet]
        //public ActionResult Images(string pathinfo)
        //{
        //    return Content("images/" + pathinfo);
        //}

        [ClientCacheHeaders(ConfigKey = "images")]
        [System.Web.Http.HttpGet]
        public HttpResponseMessage Widget(string pathinfo)
        {
            int pos = pathinfo.IndexOf('/');
            if (pos > -1)
            {
                string widgetId = pathinfo.Substring(0, pos);
                string path = pathinfo.Substring(pos);
                WidgetDefinition widget = SiteContext.Theme.Widgets.FirstOrDefault(x => x.Id == widgetId);
                if (widget != null)
                {
                    var fullPath = new FileInfo(widget.FullPath + path);
                    if (fullPath.Exists)
                    {
                        
                        return this.Request.CreateResponse( HttpStatusCode.OK , new FilePathResult(fullPath.FullName, GetMimeType(pathinfo)));
                    }
                }
            }
            return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "not found");


            
        }

        [ClientCacheHeaders(ConfigKey = "templates")]
        [System.Web.Http.HttpGet]
        public HttpResponseMessage  Templates(string pathinfo)
        {
            return Content("templates/" + pathinfo, "text/javascript");
        }

        //[ClientCacheHeaders(ConfigKey = "fonts")]
        //[System.Web.Http.HttpGet]
        //public ActionResult Fonts(string pathinfo)
        //{
        //    return Content("fonts/" + pathinfo);
        //}

        [ClientCacheHeaders(ConfigKey = "content")]
        [System.Web.Http.HttpGet]
        public HttpResponseMessage  Misc(string pathinfo, string contentType = null)
        {
            string stem = "/resources/" + pathinfo;
            if (contentType == null)
        {
                contentType = GetMimeType(stem);
            }

            return GetFileResult(stem, contentType);
        }


        [ClientCacheHeaders(ConfigKey = "content")]
        [System.Web.Http.HttpGet]
        public HttpResponseMessage SiteThumbnail()
        {
            var stem  = "/"+ this.SiteContext.Theme.Thumbnail.Name;
            var contentType = GetMimeType(stem);
            

            return GetFileResult(stem, contentType);
        }

        [ClientCacheHeaders(ConfigKey = "content")]
        [System.Web.Http.HttpGet]
        public new HttpResponseMessage  Content(string pathinfo, string contentType = null)
        {
            if (contentType == null)
            {
                contentType = GetMimeType(pathinfo);
            }

            return GetFileResult(pathinfo, contentType);
        }

        private HttpResponseMessage  GetFileResult(string pathinfo, string contentType)
        {
            // foreach (var theme in _sbContext.ThemeInfo.Stack)
            {
                var file = _pathProvider.GetThemeFileInfo( pathinfo) ;
                if (file != null)
                {
                    return this.Request.CreateResponse(HttpStatusCode.OK, new MozuVirtualFileResult(pathinfo, contentType, file));
                }
            }

            return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "file not found");
}

        private static string GetMimeType(string path)
        {
            string mimeType;

            string ext = Path.GetExtension(path);
            if (!g_mimeTypeDic.Value.TryGetValue(ext, out mimeType))
            {
                mimeType = "application/unknown";
            }
            return mimeType;
        }

        private static Dictionary<string, string> BuildMimeTypeDictionary()
        {
            var dic = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            foreach (var mimeMatch in g_hardCodedMimeTypes)
            {
                dic["." + mimeMatch.Key] = mimeMatch.Value;
            }

            foreach (string keyName in Registry.ClassesRoot.GetSubKeyNames())
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

        private class LessLogger : ILogger
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

            public void Log(LogLevel level, string msg)
            {
                System.Diagnostics.Debug.WriteLine(String.Format(LogTemplate, level.ToString(), msg));
            }

            public void Warn(string msg)
            {
                System.Diagnostics.Debug.WriteLine(String.Format(WarnTemplate, msg));
            }


            public void Debug(string message, params object[] args)
            {
                System.Diagnostics.Debug.WriteLine(String.Format(DebugTemplate, string.Join(" -- ", args)));
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

        private class LessTransFormer
        {
            private static readonly Regex g_regex = new Regex(@"\{\{[\s]*(?<col>[\w]+)\.(?<var>[\w-]+)(?<filters>(?:\|\w+(?:\:[^\|\}]+)?)*)[\s]*\}\}",
                                                              RegexOptions.IgnoreCase |
                                                              RegexOptions.Compiled |
                                                              RegexOptions.Singleline |
                                                              RegexOptions.IgnorePatternWhitespace);

            private readonly bool _debug;
            private readonly string _path;

     
         
            private IThemeSettingsRepository _themeSettingsRepository;

            public LessTransFormer(string path, bool debug, ResourceController resourceController , IThemeSettingsRepository themeSettingsRepository, MozuVirtualPathProvider virtualPathProvider)
            {
                Controller = resourceController;
                _debug = debug;
                _path = path;
                _themeSettingsRepository = themeSettingsRepository;
                PathProvider = virtualPathProvider;
            }


            public ResourceController Controller { get; set; }
            public MozuVirtualPathProvider PathProvider { get; set; }

            public Stream Transform(Stream str, string stem)
            {
                var sr = new StreamReader(str);
                string template = sr.ReadToEnd();



                template = ProcessSettingsVariables(template, stem);
                var factory = new EngineFactory();

                factory.Configuration.Logger = typeof (LessLogger);
                factory.Configuration.MinifyOutput = !_debug;
                factory.Configuration.LessSource = typeof (MyLessFileReader);

                var reader = new MyLessFileReader(this);


                var parser = new Parser
                                 {
                                     Importer =
                                         new Importer(reader)
                                 };

                Ruleset tree = null;
                try
                {
                    tree = parser.Parse(template, _path);
                }
                catch (System.IO.FileNotFoundException exception)
                {
                    throw new FileNotFoundException(exception.Message + "[" + exception.FileName + "]", exception.InnerException);
                
                }
               

                var env = new Env {Compress = !_debug};
                //env.AddPlugin(new MyLessPlugin() { Env = env });
                // var rs = new dotless.Core.Parser.Tree.Ruleset()
                // env.Frames.Push( new dotless.Core.Parser.Tree.Ruleset);

                env.Output.Push().Append(tree);
                StringBuilder sb = env.Output.Pop();
                var ms = new MemoryStream(Encoding.UTF8.GetBytes(sb.ToString()));
                ms.Position = 0;
                return ms;
            }

            public string ProcessSettingsVariables(string template , string fileName )
            {
                if (template.IndexOf("{{") > -0)
                {
                    try
                    {
                        return g_regex.Replace(template, Evaluator);
                    }
                    catch (ParsingException par)
                    {
                        par.Location.FileName = fileName;
                        par.Location.Source = template;
                        throw;
                    }
                }
            
                return template;
            }

            private string Evaluator(Match match)
            {
                string varName = match.Groups["var"].Value;
                var obj = Controller.SiteContext.ThemeSettings[varName];
                if (obj == null)
                {
                    throw new ParsingException("missing template setting '" + varName + "'", new NodeLocation(match.Index, "", ""));
                }
                var str = obj.ToString();
                if (string.IsNullOrEmpty(str))
                {
                    throw new ParsingException("empty template setting '" + varName + "'", new NodeLocation(match.Index, "", ""));
                }
                return str;

            }
        }

        public class MozuVirtualFileResult : FileResult
        {
            private readonly ThemeFileSystemInfo _file;

            public MozuVirtualFileResult(string path, string contentType, ThemeFileSystemInfo file)
                : base(contentType)
            {
                _file = file;
            }

            public Func<Stream,string, Stream> Transform { get; set; }

            protected override void WriteFile(HttpResponseBase response)
            {
                using (Stream stream = _file.OpenRead() )
                {
                    Stream source = stream;
                    if (Transform != null)
                    {
                        source = Transform(stream, _file.VirtualPath );
                    }
                    source.CopyTo(response.OutputStream);
                }
            }

            protected async override  System.Threading.Tasks.Task WriteFileAsync(HttpResponseBase response)
            {
                using (Stream stream = _file.OpenRead() )
                {
                    Stream source = stream;
                    if (Transform != null)
                    {
                        source = Transform(stream, _file.VirtualPath);
                    }
                    await  source.CopyToAsync( response.OutputStream);
                }
            }
        }

        private class MyLessFileReader : IFileReader
        {
      
            private readonly LessTransFormer lessTransFormer;

            public MyLessFileReader(LessTransFormer lessTransFormer)
            {
                Controller = lessTransFormer.Controller;
                this.lessTransFormer = lessTransFormer;
                
            }

            private ResourceController  Controller { get; set; }
            // public ResourceController Controller { get; set; }
            public string GetFileContents(string fileName)
            {
                // foreach (var theme in SiteContext.ThemeInfo.Stack )
                {
                    string stem = fileName;
                    var file = lessTransFormer.PathProvider.GetThemeFileInfo(stem);
                    if (file != null )
                    {
                        using (var sr = file.OpenText())
                        {
                            string ret = sr.ReadToEnd();
                            return lessTransFormer.ProcessSettingsVariables(ret, file.VirtualPath );
                        }
                    }
                }

                return string.Empty;
            }

            public bool DoesFileExist(string fileName)
            {
                string stem = fileName;
                var file = lessTransFormer.PathProvider.GetThemeFileInfo(stem);
                return file != null;
            }


            public byte[] GetBinaryFileContents(string fileName)
            {
                // foreach (var theme in SiteContext.ThemeInfo.Stack)
                {
                    string stem = fileName;
                    var file = this.lessTransFormer.PathProvider.GetThemeFileInfo(  stem) ;
                    if (file != null)
                    {
                        using (Stream stream = file.OpenRead() )
                        {
                            var data = new byte[stream.Length];
                            stream.Read(data, 0, data.Length);
                            return data;
                        }
                    }
                }

                return null;
            }


            public bool UseCacheDependencies
            {
                get { return false; }
            }
        }

        private class MyLessPlugin : VisitorPlugin
        {
            public override VisitorPluginType AppliesTo
            {
                get { return VisitorPluginType.BeforeEvaluation; }
            }

            public Env Env { get; set; }

            public override Node Execute(Node node, out bool visitDeeper)
            {
                visitDeeper = true;
                if (node is Value)
                {
                    // do nothing
                }
                if (node is Variable)
                {
                    var inNode = (Variable) node;
                    if (inNode.Name == "@headingsColor")
                    {
                        Rule rule = Env.FindVariable(inNode.Name);
                        var parser = new Parser();
                        //  var resRs = parser.Parse("lighten(@orange, 15%)", "xxx");
                    }
                    node = new MyVariable(inNode.Name);
                }
                return node;
            }
        }

        private class MyVariable : Variable
        {
            public MyVariable(string name)
                : base(name)
            {
            }

            public override Node Evaluate(Env env)
            {
                string name = Name;
                if (name.StartsWith("@@"))
                {
                    Node node = new MyVariable(name.Substring(1)).Evaluate(env);
                    name = '@' + ((node is TextNode) ? (node as TextNode).Value : node.ToCSS(env));
                }

                Rule rule = env.FindVariable(name);
                if (Name == "headingsColor" || Name == "@headingsColor")
                {
                    // do nothing
                }

                if (rule == null)
                {
                    throw new ParsingException("variable " + name + " is undefined", base.Location);
                }
                return rule.Value.Evaluate(env);
            }
                }


    }
}