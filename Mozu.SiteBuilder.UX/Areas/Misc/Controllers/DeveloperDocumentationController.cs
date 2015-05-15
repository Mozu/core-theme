using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Xml;
using System.Xml.Linq;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Tags;
using System.Text;
using NDjango.Interfaces;
using Mozu.SiteBuilder.Mvc.Controllers;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{

    public class DeveloperDocumentationController : ApiControllerBase
    {

        private readonly ITemplateManagerProvider _templateManagerProvider;

        public DeveloperDocumentationController(ITemplateManagerProvider templateManagerProvider)
        {
            _templateManagerProvider = templateManagerProvider;
        }

        //
        // GET: /Misc/DeveloperDocumentation/
        [System.Web.Http.HttpGet]
        public ActionResult Tags()
        {
            List<DjangoItemInfo> itemInfos = BuildTagInfos();

            ViewData.Model = itemInfos;
            ViewData["itemtype"] = "Filters";
            return new Mozu.SiteBuilder.Mvc.ActionResults.RazorViewResult()
            {
                Model = itemInfos,
                ViewData = ViewData,

                ViewName = "list"
            };



        }
        public class DjangoItemInfo
        {
            public string TagName
            {
                get;
                set;
            }
            public String DocUrl { get; set; }
            public List<string> Examples
            {
                get;
                set;
            }


            public string Description { get; set; }

            public string Summary { get; set; }
            public override string ToString()
            {
                return TagName;
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <
        /// <returns></returns>
        [System.Web.Http.HttpGet]
        public ActionResult Filters()
        {

            var summaries = GetSummeries(this.HttpContext);
            List<DjangoItemInfo> itemInfos = new List<DjangoItemInfo>();
            var nameAttType = typeof(NDjango.Interfaces.NameAttribute);
            var descAttType = typeof(NDjango.ParserNodes.DescriptionAttribute);

            foreach (var installedFilter in _templateManagerProvider.Filters)
            {

                var tt = installedFilter.Value.GetType();
                var att = (NDjango.Interfaces.NameAttribute)tt.GetCustomAttributes(nameAttType, false).FirstOrDefault();
                var descriptionAttribute = (NDjango.ParserNodes.DescriptionAttribute)tt.GetCustomAttributes(descAttType, false).FirstOrDefault();
                var typeLookup = tt.FullName.Replace("+", ".");
                itemInfos.Add(new DjangoItemInfo()
                {
                    TagName = installedFilter.Key,
                    Description = descriptionAttribute == null ? null : descriptionAttribute.Description,

                    Summary = summaries.ContainsKey(typeLookup) ? summaries[typeLookup] : null,
                    DocUrl = tt.FullName.IndexOf("Mozu") == -1 ? "https://docs.djangoproject.com/en/1.3/ref/templates/builtins/#" + installedFilter.Key : null

                });


            }
            ViewData.Model = itemInfos;
            ViewData["itemtype"] = "Filters";
            return new Mozu.SiteBuilder.Mvc.ActionResults.RazorViewResult()
            {
                Model = itemInfos,
                ViewData = ViewData,

                ViewName = "list"
            };
            //("documentation/tags", tagInfos);
        }

        private static Dictionary<string, string> _assumblyTypeSummeries = null;
        /// <summary>
        /// 
        /// </summary>
        /// <example>abc</example>
        /// <code>i like fudge</code>
        /// <param name="context"></param>
        /// <returns></returns>
        static Dictionary<string, string> GetSummeries(System.Web.HttpContextBase context)
        {
            if (_assumblyTypeSummeries != null)
            {
                return _assumblyTypeSummeries;
            }
            var xmlFiles = new string[] { "NDjangoFilters.NDjangoExtension40.xml", "NDjango.Core40.xml", "Mozu.SiteBuilder.UX.xml", "Mozu.SiteBuilder.Mvc.xml" };
            var dic = new Dictionary<string, string>();
            foreach (var xmlFile in xmlFiles)
            {
                var fullPath = context.Request.MapPath("~/bin/" + xmlFile);
                if (!System.IO.File.Exists(fullPath))
                {
                    throw new FileNotFoundException("documentation file missing " + xmlFile, xmlFile);
                }
                XDocument xdoc = XDocument.Load(fullPath);

                var kvps = xdoc.Root.Element("members").Elements("member").Where(mem => ((string)mem.Attribute("name")).StartsWith("T:")).Select(
                    mem => new KeyValuePair<string, string>(
                        mem.Attribute("name").Value.Substring(2),
                        ToHtmlString(mem.Element("summary")
                        )
                        ));
                var items = kvps.Where(x => dic.ContainsKey(x.Key)).ToList();
                if (items.Any())
                {
                    throw new Exception(String.Join(" ", items));
                }
                dic.AddRange(kvps);

            }
            return _assumblyTypeSummeries = dic;


        }


        static string ToHtmlString(XElement elm)
        {
            if (elm == null)
            {
                return null;
            }
            StringBuilder sb = new StringBuilder();
            foreach (var node in elm.Nodes())
            {
                if (node.NodeType == XmlNodeType.Element)
                {
                    var subEl = (XElement)node;
                    if (subEl.Name == "code")
                    {
                        sb.Append("<div class=\"code\">");
                        sb.Append(HttpUtility.HtmlEncode(ToHtmlString(subEl)));
                        sb.Append("</div>");
                    }
                    else
                    {
                        sb.Append(subEl.ToString());
                    }
                }
                if (node.NodeType == XmlNodeType.Text)
                {

                    sb.Append(((XText)node).Value);
                }


            }
            return sb.ToString();

        }

        private List<DjangoItemInfo> BuildTagInfos()
        {


            var summaries = GetSummeries(this.HttpContext);
            var tagInfos = new List<DjangoItemInfo>();
            var baseDynamicTagType = typeof(DynamicTagBase);
            var nameAttType = typeof(NDjango.Interfaces.NameAttribute);
            var descAttType = typeof(NDjango.ParserNodes.DescriptionAttribute);
            var dtags = baseDynamicTagType.Assembly.GetTypes().Where(x => !x.IsAbstract && baseDynamicTagType.IsAssignableFrom(x)).ToList();




            foreach (var installedTag in _templateManagerProvider.Tags)
            {
                var tt = installedTag.Value.GetType();
                if (tt.GetCustomAttributes(typeof(ObsoleteAttribute), true).FirstOrDefault() != null)
                {
                    continue;
                }
                var att = (NDjango.Interfaces.NameAttribute)tt.GetCustomAttributes(nameAttType, false).FirstOrDefault();
                var descriptionAttribute = (NDjango.ParserNodes.DescriptionAttribute)tt.GetCustomAttributes(descAttType, false).FirstOrDefault();


                var typeLookup = tt.FullName.Replace("+", ".");

                var item = new DjangoItemInfo()
                {
                    Description = descriptionAttribute != null ? descriptionAttribute.Description : null,
                    TagName = installedTag.Key,
                    Summary = summaries.ContainsKey(typeLookup) ? summaries[typeLookup] : null,
                    DocUrl = "https://docs.djangoproject.com/en/1.3/ref/templates/builtins/#" + installedTag.Key
                };



                tagInfos.Add(item);
            }
            return tagInfos.OrderBy(x => x.TagName).ToList();
        }



    }
}
