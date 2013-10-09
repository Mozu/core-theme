//using System.Collections.Generic;
//using System.Text.RegularExpressions;
//using System.Linq;
//using System.IO;

//using Mozu.SiteBuilder.Mvc;
//using Mozu.SiteBuilder.UX.Controllers;
//using Mozu.SiteBuilder.Mvc.ViewEngine;
//using Newtonsoft.Json;

//namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
//{
//    public class LiveTemplateController : BaseApiController
//    {
//        ISiteBuilderContext _sbContext;
//        private readonly MozuVirtualPathProvider _pathProvider;
//        private DjangoMozuViewEngine _viewEngine;
//        private const string INCLUDE_TAG_RE_STR = @"\{%\s*include(_live)?\s+[""'](?<tptpath>[^""']+)[""']\s*%\}";
//        private const string TEMPLATE_EXT = ".vol";
//        private Regex IncludeTagRE;
//        public LiveTemplateController(ISiteBuilderContext sbContext, DjangoMozuViewEngine viewEngine)
//        {
//            _sbContext = sbContext;
         
//            _viewEngine = viewEngine;
//            IncludeTagRE = new Regex(INCLUDE_TAG_RE_STR, RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Multiline);
//        }
//           [System.Web.Http.HttpGet]
//        public ActionResult Add(string templateName)
//        {
//            var livetemplates = (List<string>)SiteBuilderContext.Current["livetemplates"];
//            if (livetemplates == null)
//            {
//                SiteContext["livetemplates"] = livetemplates = new List<string>();
//            }
//            livetemplates.Add(templateName);
//            return null;
//        }


//           [System.Web.Http.HttpGet]
//        public ActionResult RenderLiveTemplates()
//        {
//            return new ContentResult()
//                       {
//                           Content = ""
//                       };


//        }

//        class LiveTemplate
//        {
//            public LiveTemplate(string name, DjangoMozuViewEngine viewEngine)
//            {
//                this.Name = name;
//                this.ViewEngine = viewEngine;
//            }
//            DjangoMozuViewEngine ViewEngine;
//            public string Id
//            {
//                get
//                {
//                    return this.Name.Replace('/', '_').ToLowerInvariant();
//                }
//            }
//            public string Name
//            {
//                get;
//                set;
//            }
//            private string _body;
//            public string Body
//            {
//                get
//                {
//                    if (string.IsNullOrEmpty(_body))
//                    {
//                        MozuVirtualFile tptFile = ViewEngine.PathProvider.GetFile(this.Name + TEMPLATE_EXT) as MozuVirtualFile;
//                        if (!tptFile.Exists)
//                            throw new FileNotFoundException("Live template not found.");
//                        _body = new StreamReader(tptFile.Open()).ReadToEnd();
//                    }
//                    return _body;
//                }
//            }
//        }

//        private List<LiveTemplate> DetectIncludes(LiveTemplate template, List<LiveTemplate> allFound)
//        {
//            allFound.Add(template);
//            MatchCollection matches = IncludeTagRE.Matches(template.Body);
//            if (matches.Count > 0)
//            {
//                foreach (Match match in matches)
//                {
//                    if (!allFound.Any(x => x.Name.ToLowerInvariant() == match.Groups["tptpath"].Value.ToLowerInvariant()))
//                    {
//                        DetectIncludes(new LiveTemplate(match.Groups["tptpath"].Value, _viewEngine), allFound);
//                    }
//                }
//            }
//            return allFound;

//        }

//    }
//}