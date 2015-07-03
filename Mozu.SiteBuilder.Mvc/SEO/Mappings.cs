using Mozu.Core.Api.Client;
using Mozu.MZDB.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteSettings.General.Contracts.General.Routing;

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
                case Mapping.TypeConst.categorySlug:
                    return new CategorySlugMapping(mapping);
            }
            throw new ArgumentException(string.Format("mapping type {0} not known", mapping.type));
        }

        private IRouteDataMapping MZDBMapping(IEntityListsWebApiClient client, Mapping mapping)
        {
            return new MZDBMap(client, mapping.listName, mapping.docId);
        }

        private IRouteDataMapping FacetMapping(Mapping mapping)
        {
            return new FacetValueFilterMapping(mapping.mapFrom, mapping.mapTo, mapping.facetId);
        }

        private static IRouteDataMapping DirectMapping(Mapping mapping)
        {
            return new DirectMapping(mapping.mappings);
        }
    }

    public class FacetValueFilterMapping : IRouteDataMapping
    {
        readonly string _facetId;
        readonly string _mapFrom;
        readonly string _mapTo;

        public FacetValueFilterMapping(string mapFrom, string mapTo, string facetId)
        {
            if (mapFrom.IsNullOrEmpty()) throw new ArgumentException("mapFrom");
            if (mapTo.IsNullOrEmpty()) throw new ArgumentException("mapTo");
            if (facetId.IsNullOrEmpty()) throw new ArgumentException("facetId");

            _mapFrom = mapFrom;
            _mapTo = mapTo;
            _facetId = facetId;
        }

        public Task<bool> Initialize() { return Task.FromResult(true); }

        public IDictionary<string, object> Map(HttpRequestMessage requestMessage,   IDictionary<string, object> values)
        {
            object tmp;
            if (!values.TryGetValue(_mapFrom, out tmp))
            {
                return values;
            }
            var value = Convert.ToString(tmp);
            
            if (!values.TryGetValue(FacetValueFilterCollection.RouteDataKey , out tmp))
            {
                //todo: throw error?
                return values;
            }
            var col = (FacetValueFilterCollection)tmp;

            col.Add(_facetId, value);

            return values;
        }
        
    }
    public class CategorySlugMapping : IRouteDataMapping
    {
        private Mapping mapping;

        public CategorySlugMapping(Mapping mapping)
        {
            // TODO: Complete member initialization
            this.mapping = mapping;
        }

        public IDictionary<string, object> Map(HttpRequestMessage requestMessage, IDictionary<string, object> values)
        {
            object tmp;
            string slug = null;
            if (!values.TryGetValue(mapping.mapFrom, out tmp))
            {
                return values;
            }
            slug = Convert.ToString(tmp);
            if (string.IsNullOrWhiteSpace(slug))
            {
                return values;
            }
            var catTreeProvider = requestMessage.Resolve<ICategoryTreeProvider>();
            var catTree = catTreeProvider.GetAllCategories().Result;
            var cat = catTree.Items.FirstOrDefault(x => x.Content != null && string.Equals(slug, x.Content.Slug, StringComparison.OrdinalIgnoreCase));
            if (cat != null)
            {
                values[mapping.mapTo] = cat.CategoryCode;
            }
            return values;
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

        public IDictionary<string, object> Map(HttpRequestMessage requestMessage, IDictionary<string, object> values)
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

        public IDictionary<string, object> Map(HttpRequestMessage requestMessage, IDictionary<string, object> values)
        {
            return _docValues.ApplyMapping(values);
        }
    }
}
