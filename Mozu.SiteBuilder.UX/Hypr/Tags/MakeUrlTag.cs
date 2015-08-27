using System;
using System.Collections;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using System.Collections.Generic;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using NDjango.Interfaces;
using NDjango.FiltersCS.Compatibility;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteSettings.General.Contracts.General.Routing;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    /// <summary>
    ///Creates a url for a specific object and resource type
    ///   <img src="{% make_url "image" image with max=500 as_parameter />
    ///   <a href="{% make_url "facet" facet %}">{{ facet.name }}</a>
    /// </summary>
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("make_url")]
    public class MakeUrlTag : SimpleTagBase
    {
        static JsonCleaningCaseInsensitiveMemberResolver _resolver = new JsonCleaningCaseInsensitiveMemberResolver();
        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var type = (arguments[0].Value as string ?? "").ToLowerInvariant();
            var obj = arguments[1].Value ;
            var includeContext = arguments.GetValueOrDefault<bool>("includeContext", false);
               
            var props = arguments.Where(x => x.ArgumentType == TagArgument.ArgumentTypes.NamedArgument).ToDictionary(x => x.Name, y => y.Value, StringComparer.OrdinalIgnoreCase);

            var urlHelper = context.Resolve<UrlHelper>();
            var url = urlHelper.MakeUrl(type, obj, props, includeContext);

            return new[] { WalkResultHelpers.Buffer(url) };
        }


    }

}
       
      

        
        
    


   
