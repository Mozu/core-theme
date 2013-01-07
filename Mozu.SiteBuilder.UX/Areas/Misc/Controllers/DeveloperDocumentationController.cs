using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.SiteBuilder.Mvc.Tags;
using System.Text;
using System.Web.Routing;
using Mozu.SiteBuilder.UX.ActionFilters;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Areas.Misc.Models;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
      [MediaTypeProcessor()]
    public class DeveloperDocumentationController : BaseController
      {
          private DjangoMozuViewEngine _viewEngine;
          public DeveloperDocumentationController(DjangoMozuViewEngine viewEngine )
          {
              _viewEngine = viewEngine;
          }
        //
        // GET: /Misc/DeveloperDocumentation/
       
        public ActionResult Index()
        {
            List<TagInfo> tagInfos = BuildTagInfos();
            return View(tagInfos);
        }

        private  List<TagInfo> BuildTagInfos()
        {
            var ve = _viewEngine;
            
            List<TagInfo> tagInfos = new List<TagInfo>();
            var baseDynamicTagType = typeof(DynamicTagBase);
            var attType = typeof(NDjango.Interfaces.NameAttribute);
            var dtags = baseDynamicTagType.Assembly.GetTypes().Where(x => !x.IsAbstract && baseDynamicTagType.IsAssignableFrom(x)).ToList();
            

           

            foreach (var installedTag in ve.InstalledTags)
            {
                var tt =installedTag.Value.GetType();
                var att = (NDjango.Interfaces.NameAttribute)tt.GetCustomAttributes(attType, false).FirstOrDefault();
                if (baseDynamicTagType.IsAssignableFrom(tt))
                {

                    var info = BuildDynamicTagInfo(tt, att);
                    if (info != null)
                        tagInfos.Add(info);
                }
                else
                {
                    if (!tt.Assembly.FullName.Contains("Volusion"))
                    {
                        tagInfos.Add(new TagInfo()
                            {
                                TagName = installedTag.Key,
                                DocUrl = "https://docs.djangoproject.com/en/1.3/ref/templates/builtins/#" + installedTag.Key
                            });
                    }
                }
            }
            return tagInfos.OrderBy(x => x.TagName).ToList();
        }

        private static TagInfo BuildDynamicTagInfo(Type tagType , NDjango.Interfaces.NameAttribute att)
        {
            var meths = tagType.GetMethods().Where(x => x.Name == "Process").OrderBy(x => x.GetParameters().Length).ToList();
            TagInfo ti = new TagInfo()
            {
                TagName = att.Name,
                Examples = new List<string>()
            };
           
            foreach (var meth in meths)
            {
                var sb = new StringBuilder("{% ");
                sb.Append(att.Name);
                var parameters = meth.GetParameters();
                foreach (var param in parameters)
                {
                    sb.Append(" ");
                    if (param.ParameterType.IsPrimitive || param.ParameterType == typeof(string))
                    {
                        sb.AppendFormat("[{0}]", param.Name);
                    }
                    else
                    {
                        if (param.ParameterType == typeof(object) ||
                            param.ParameterType == typeof(RouteValueDictionary))
                        {
                            sb.AppendFormat("with param1=[param1] and param2=[param2] as_parameter");
                        }
                        else
                        {
                            sb.AppendFormat("[{0}]", param.Name);
                        }
                    }
                }
                sb.Append(" %}");
                ti.Examples.Add(sb.ToString());
            }
            return ti;
        }

    }

}
