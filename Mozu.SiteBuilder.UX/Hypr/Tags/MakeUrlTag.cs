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
using System.Web.Http;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using NDjango.Interfaces;
using NDjango.FiltersCS.Compatibility;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteSettings.General.Contracts.General.Routing;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    /// <summary>
    ///Creates a url for a specific object and resouce type
    ///   <img src="{% make_url "image" image with max=500 as_parameter />
    ///   <a href="{% make_url "facet" facet />
    /// </summary>
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("make_url")]
    public class MakeUrlTag : SimpleTagBase
    {
        static JsonCleaningCaseInsensitiveMemberResolver _resolver = new JsonCleaningCaseInsensitiveMemberResolver();
        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var type = (arguments[0].Value as string ?? "").ToLowerInvariant();
            var obj = arguments[1].Value as dynamic;
            Mozu.ProductRuntime.Contracts.FacetValue sf = null;

            var url = "#";
           
            switch (type)
            {
                case "facet":
                {
                        url=GetFacetUrl(context, obj);
                     break;
                }
                case "image":
                    {
                        url =GetImagetUrl(context, obj, arguments);
                        break;
                    }
                case "category":
                    {
                        url = GetCategoryUrl(context, obj);
                        break;
                    }
                case "product":
                    {
                        url = GetProductUrl (context, obj);
                        break;
                    }
                default:
                    {
                        throw new RenderingError(string.Format("unknonw type [{0}]", type), null);
                    }
            }

            return new[] { WalkResultHelpers.Buffer(url) };
        }

        private static string GetProductUrl(IContext context, dynamic obj)
        {

            Product product = obj as Product;
            //Product p;
            if (product == null)
            {
                string productCode = null;
                string url = "#";
                if (obj is string)
                {
                    productCode = (string)obj;
                    url = "/p/" + productCode;
                }
                if (productCode == null)
                {
                    url = _resolver.ResolveMemberOrDefault<string>(obj, "url", "#");
                }
                return url;
            }

            var reouteHandler = context.Resolve<ICustomRouteHandler>();
            
            return reouteHandler.GetCannonicalUrl(FancyRoute.ProductDetails , () => Mapper.Map<IDictionary<string, object>>(product), false ).Result ?? "#";

        }
        private static string GetCategoryUrl(IContext context, dynamic obj)
        {
            
            bool isFacet = false;
            int categoryId = -1;
            string categoryCode = null;
            if (obj is int )
            {
                categoryId = obj;
            }
            if ( categoryId == -1)
            {
                categoryId = _resolver.ResolveMemberOrDefault<int>(obj, "categoryId", -1);
            }
            
            if ( categoryId == -1)
            {
                var facetValue = _resolver.ResolveMemberOrDefault<string>(obj, "filterValue");
                if (!string.IsNullOrEmpty(facetValue))
                {
                    isFacet = true;
                    var parts = facetValue.Split(":");
                    if(parts.Length < 2 || !int.TryParse(parts[1], out categoryId)){
                        categoryId = -1;
                    }
                   
                }
            }
            if ( categoryId ==-1 && ( string.IsNullOrWhiteSpace( obj as string )))
            {
                categoryCode = (string)obj;
            }
            else if( categoryId ==-1)
            {
                return "#";
            }

            
            var tree = context.Resolve<ICategoryTreeProvider>().GetAllCategories().Result;
            var cat = categoryId != -1 ? tree.FindById(categoryId) : tree.FindByCode(categoryCode);
            if ( cat ==null)
            {
                return "#";
            }
            var reouteHandler = context.Resolve<ICustomRouteHandler>();
           
            //maybe remove existing context?
            return reouteHandler.GetCannonicalUrl( FancyRoute.Category, () => Mapper.Map<IDictionary<string, object>>(cat), isFacet).Result ?? "#";
        }

      


        private static string GetImagetUrl(IContext context, dynamic obj, ArgumentCollection arguments)
        {
            string url = null;
            if ( obj is string)
            {
                url = obj as string;
                if ( string.IsNullOrEmpty(url))
                {
                    return "#";
                }
            }
            if (url == null )
            {
                url = _resolver.ResolveMemberOrDefault<string>(obj, "imageUrl")();
            }
            //todo cmsid stuff..

            if (string.IsNullOrEmpty(url))
            {
                return "#";
            }

            //cdnify
            if (url.Length >2 && url[0] == '/' && url[0] != '/'   )
            {
                url = context.SiteContext().CdnPrefix + url;
            }
            
            foreach( var args in arguments.Where(x=>x.ArgumentType == TagArgument.ArgumentTypes.NamedArgument))
            {
                if (url.IndexOf('?') == -1)
                {
                    url += "?";
                }
                else
                {
                    url += "&";
                }

                url += args.Name + "=" + args.Value;
            }
            return url;
        }
        private static string GetFacetUrl(IContext context, dynamic obj)
        {
            var facetValue = _resolver.ResolveMemberOrDefault<string>(obj, "filterValue");
            if (string.IsNullOrEmpty(facetValue))
            {
                return "#";
            }

            var parts = facetValue.Split(":");
            var searchContext = context.PageContext().Search;
            var existing = searchContext.Facets[parts[0]];
            searchContext.Facets.Add(parts[0], parts[1]);
            var url = searchContext.ToFacetValueFilter();
            if (existing == null)
            {
                searchContext.Facets.Remove(parts[0]);
            }
            else
            {
                searchContext.Facets[parts[0]] = existing;
            }
            return url;
        }
    }

}
       
      

        
        
    


   
