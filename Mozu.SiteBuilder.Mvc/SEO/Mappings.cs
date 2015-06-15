using Mozu.Core.Api.Client;
using Mozu.MZDB.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        public IDictionary<string, object> Map(IDictionary<string, object> values)
        {
            if (values.ContainsKey(_mapFrom))
            {
                values[_mapTo] = UnFacetify(values[_mapFrom].ToString());
            }
            return values;
        }

        //TODO check with Britt/Kevin that this is correct.
        private string UnFacetify(string v)
        {
            return string.Format("{0}_{1}", _facetId, v);
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

        public IDictionary<string, object> Map(IDictionary<string, object> values)
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

        public IDictionary<string, object> Map(IDictionary<string, object> values)
        {
            return _docValues.ApplyMapping(values);
        }
    }
}
