using Mozu.Core.Api.Client;
using Mozu.MZDB.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.Mvc.SEO.Mappings
{
    public class RouteMappingFactory : IRouteDataMappingFactory
    {
        readonly IEntityListsWebApiClient _entityListClient;

        public RouteMappingFactory(IEntityListsWebApiClient entityListClient)
        {
            _entityListClient = entityListClient;
        }
        public IRouteDataMapping BuildMapping(Mapping mapping)
        {
            switch (mapping.type)
            {
                case Mapping.TypeConst.direct:
                    return DirectMapping(mapping);
                case Mapping.TypeConst.facet:
                    return FacetMapping(mapping);
                case Mapping.TypeConst.mzdb:
                    return MZDBMapping(_entityListClient, mapping);
                case Mapping.TypeConst.category:
                    return new CategoryMapping(mapping);
            }
            throw new ArgumentException(string.Format("mapping type {0} not known", mapping.type));
        }

        private IRouteDataMapping MZDBMapping(IEntityListsWebApiClient client, Mapping mapping)
        {
            return new MZDBMap(client, mapping.listName, mapping.docId);
        }

        private IRouteDataMapping FacetMapping(Mapping mapping)
        {
            return new FacetValueFilterMapping( mapping.mapTo, mapping.facetId);
        }

        private static IRouteDataMapping DirectMapping(Mapping mapping)
        {
            return new DirectMapping(mapping.mappings);
        }
    }

    public class FacetValueFilterMapping : IRouteDataMapping
    {
        readonly string _facetId;
  
        readonly string _mapTo;

        public FacetValueFilterMapping(string mapTo, string facetId)
        {
          
            if (mapTo.IsNullOrEmpty()) throw new ArgumentException("mapTo");
            if (facetId.IsNullOrEmpty()) throw new ArgumentException("facetId");

       
            _mapTo = mapTo;
            _facetId = facetId;
        }

        public Task<bool> Initialize() { return Task.FromResult(true); }

        public IDictionary<string, object> Map(HttpRequestMessage requestMessage, IDictionary<string, object> values, string parameterName)
        {
            object tmp;
            if (!values.TryGetValue(parameterName, out tmp))
            {
                return values;
            }
            var value = Convert.ToString(tmp);
            
            
            var col = SearchContext.Get(requestMessage);

            col.Facets.Add(_facetId, value);

            return values;
        }
        
    }

    //todo:depricate
    public class CategoryMapping : IRouteDataMapping
    {
        private Mapping mapping;

        public CategoryMapping(Mapping mapping)
        {
            // TODO: Complete member initialization
            this.mapping = mapping;
        }

        public IDictionary<string, object> Map(HttpRequestMessage requestMessage, IDictionary<string, object> values, string parameterName)
        {
            
           return values;
        }

        public Task<bool> Initialize()
        {
            return Task.FromResult(true); 
        }
    }

    public class RouteDataFixup : IRouteDataMapping
    {


        public readonly static RouteDataFixup DefaultMapping = new RouteDataFixup();


        public IDictionary<string, object> Map(HttpRequestMessage requestMessage, IDictionary<string, object> values, string parameterName)
        {
            object tmp;
            int id;

            var qs = requestMessage.RequestUri.ParseQueryString();
            
            SetValue(values, qs,"pageSize", true);
            SetValue(values, qs, "startIndex", true);
            SetValue(values, qs, "categoryId", true);
            SetValue(values, qs, "sortBy", false);
            SetValue(values, qs, "query", false);
            SetValue(values, qs, "categoryCode", false);
            SetValue(values, qs, "facetValueFilter", false);


            foreach ( var val in values.Where(x=> x.Value is Category  && x.Key.EndsWith("-categoryObject")).ToList())
            {
                var cat = (Category)val.Value;

                var subCode = val.Key == "-categoryObject" ? "" : val.Key.Replace("-categoryObject", "")+"-";
               
                values[subCode+"categoryCode"] = cat.CategoryCode;
                values[subCode+"categoryId"] = cat.CategoryId;
                values[subCode+"categorySlug"] = cat.Content!= null? cat.Content.Slug: null;
                
            }
            

            bool catFound = false; 

            if (values.TryGetValue("categoryId", out tmp) && tmp != null && (tmp is int || tmp is string))
            {
                if (int.TryParse(tmp.ToString(), out id))
                {
                    var catTreeProvider = requestMessage.Resolve<ICategoryTreeProvider>();
                    var cat = catTreeProvider.GetAllCategories().Result.FindById(id);
                    if (cat != null)
                    {
                        values["categoryCode"] = cat.CategoryCode;
                        catFound = true;
                    }
                }

            }

            if (!catFound && values.TryGetValue("categoryCode", out tmp) && !string.IsNullOrWhiteSpace(tmp as string))
            {
                var catTreeProvider = requestMessage.Resolve<ICategoryTreeProvider>();
                var cat = catTreeProvider.GetAllCategories().Result.FindByCode((string)tmp);
                if (cat != null)
                {
                    values["categoryId"] = cat.Id;
                  
                }
            }

            SearchContext.Get(requestMessage).InitRouteData(values);
            return values;
        }

        private static void SetValue(IDictionary<string, object> values, NameValueCollection qs, string key, bool asInt)
        {
            object obj;
            if (values.TryGetValue(key, out obj) && obj != null && !(obj is string && string.IsNullOrWhiteSpace(obj as string)))
            {
                return;
            }

            var temp = qs[key];
            if (asInt)
            {
                int tempInt;

                if (int.TryParse(temp, out tempInt))
                {
                    values[key] = tempInt;
                }
            }
            else
            {
                values[key] = temp;
            }

        }

        public Task<bool> Initialize()
        {
            return Task.FromResult(true);
        }
    }

    public class DirectMapping : IRouteDataMapping
    {
        readonly IDictionary<string, string> _maps;

        public DirectMapping(IDictionary<string, string> mappings)
        {
            if (mappings == null || mappings.Count == 0) throw new ArgumentException("mappings");

            _maps = mappings;
        }
        public Task<bool> Initialize() { return Task.FromResult(true); }

        public IDictionary<string, object> Map(HttpRequestMessage requestMessage, IDictionary<string, object> values, string parameterName)
        {
            return _maps.ApplyMapping(values);
        }
    }

    public class MZDBMap : IRouteDataMapping
    {
        readonly IEntityListsWebApiClient _client;
        readonly string _entityList;
        readonly string _docId;
        IDictionary<string, string> _docValues;
        static readonly JTokenType AllowedJTokens = JTokenType.Boolean | JTokenType.Bytes | JTokenType.Date | JTokenType.Float | JTokenType.Guid | JTokenType.Integer | JTokenType.String | JTokenType.Uri;

        public MZDBMap(IEntityListsWebApiClient client, string entityList, string docId)
        {
            if (entityList.IsNullOrEmpty()) throw new ArgumentException("entityList");
            if (docId.IsNullOrEmpty()) throw new ArgumentException("docId");

            _client = client;
            _entityList = entityList;
            _docId = docId;
        }

        public async Task<bool> Initialize()
        {
            var entityResponse = await _client.CloneWithoutUserClaims().GetEntity(_entityList, _docId).ConfigureAwait(false);
            if (entityResponse.HasException) throw entityResponse.ReadException();

            var entity = entityResponse.ReadAsSync();
            _docValues = 
                entity.Values()
                .Where(x => x.Type == JTokenType.Property && AllowedJTokens.HasFlag((x as JProperty).Value.Type))
                .Cast<JProperty>()
                .ToDictionary(x => x.Name, x => x.Value.ToString());
            return true;
        }

        public IDictionary<string, object> Map(HttpRequestMessage requestMessage, IDictionary<string, object> values, string parameterName)
        {
            return _docValues.ApplyMapping(values);
        }
    }
}
