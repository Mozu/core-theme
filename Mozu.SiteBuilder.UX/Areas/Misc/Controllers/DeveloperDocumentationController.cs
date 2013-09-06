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
using NDjango;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    [MediaTypeProcessor()]
    public class DeveloperDocumentationController : BaseController
    {
        private DjangoMozuViewEngine _viewEngine;
        private readonly ITemplateManagerProvider _templateManagerProvider;

        public DeveloperDocumentationController(DjangoMozuViewEngine viewEngine, ITemplateManagerProvider templateManagerProvider)
        {
            _viewEngine = viewEngine;
            _templateManagerProvider = templateManagerProvider;
        }

        //
        // GET: /Misc/DeveloperDocumentation/

        public ActionResult Tags()
        {
            List<DjangoItemInfo> tagInfos = BuildTagInfos();

            return View("documentation/tags", tagInfos);
        }

        public ActionResult Filters()
        {
          

            List<DjangoItemInfo> tagInfos = new List<DjangoItemInfo>();
            var nameAttType = typeof(NDjango.Interfaces.NameAttribute);
            var descAttType = typeof(NDjango.ParserNodes.DescriptionAttribute);

            foreach (var installedFilter in _templateManagerProvider.Filters)
            {

                var tt = installedFilter.Value.GetType();
                var att = (NDjango.Interfaces.NameAttribute)tt.GetCustomAttributes(nameAttType, false).FirstOrDefault();
                var descriptionAttribute = (NDjango.ParserNodes.DescriptionAttribute)tt.GetCustomAttributes(descAttType, false).FirstOrDefault();
                tagInfos.Add(new DjangoItemInfo()
                                 {
                                     TagName = installedFilter.Key ,
                                     Description = descriptionAttribute == null ? null : descriptionAttribute.Description ,
                                     DocUrl = tt.FullName.IndexOf("Mozu" ) == -1 ? "https://docs.djangoproject.com/en/1.3/ref/templates/builtins/#" + installedFilter.Key : null

                                 });


            }

            return View("documentation/tags", tagInfos);
        }

       
        private List<DjangoItemInfo> BuildTagInfos()
        {
            var ve = _viewEngine;


            List<DjangoItemInfo> tagInfos = new List<DjangoItemInfo>();
            var baseDynamicTagType = typeof(DynamicTagBase);
            var nameAttType = typeof(NDjango.Interfaces.NameAttribute);
            var descAttType=typeof (NDjango.ParserNodes.DescriptionAttribute);
            var dtags = baseDynamicTagType.Assembly.GetTypes().Where(x => !x.IsAbstract && baseDynamicTagType.IsAssignableFrom(x)).ToList();




            foreach (var installedTag in _templateManagerProvider.Tags)
            {
                var tt = installedTag.Value.GetType();
                var att = (NDjango.Interfaces.NameAttribute)tt.GetCustomAttributes(nameAttType, false).FirstOrDefault();
                var descriptionAttribute = (NDjango.ParserNodes.DescriptionAttribute)tt.GetCustomAttributes(descAttType, false).FirstOrDefault();

                if (baseDynamicTagType.IsAssignableFrom(tt))
                {

                    var info = BuildDynamicTagInfo(tt, att, descriptionAttribute);
                    if (info != null)
                        tagInfos.Add(info);
                }
                else
                {
                    if (!tt.Assembly.FullName.Contains("Mozu"))
                    {
                        tagInfos.Add(new DjangoItemInfo()
                        {
                            Description = descriptionAttribute != null ? descriptionAttribute.Description : null ,
                            TagName = installedTag.Key,
                            DocUrl = "https://docs.djangoproject.com/en/1.3/ref/templates/builtins/#" + installedTag.Key
                        });
                    }
                }
            }
            return tagInfos.OrderBy(x => x.TagName).ToList();
        }

        private static DjangoItemInfo BuildDynamicTagInfo(Type tagType, NDjango.Interfaces.NameAttribute att, NDjango.ParserNodes.DescriptionAttribute descriptionAttribute )
        {
            var meths = tagType.GetMethods().Where(x => x.Name == "Process").OrderBy(x => x.GetParameters().Length).ToList();
            DjangoItemInfo ti = new DjangoItemInfo()
            {
                TagName = att.Name,
                Examples = new List<string>(),
                Description = descriptionAttribute != null ? descriptionAttribute.Description : null 
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
