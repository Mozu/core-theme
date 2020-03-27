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
using Microsoft.AspNetCore.Http;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteBuilder.Mvc.Context;

namespace Mozu.SiteBuilder.Mvc.SEO.Mappings
{
    public class RouteMappingFactory : IRouteDataMappingFactory
    {
        readonly ISiteBuilderContextProvider _contextProvider;

        public RouteMappingFactory(ISiteBuilderContextProvider contextProvider)
        {
            _contextProvider = contextProvider;
        }
        public IRouteDataMapping BuildMapping(string key , Mapping mapping)
        {
            return mapping.type.ToLowerInvariant() switch
            {
                Mapping.TypeConst.direct => (new DirectMapping(mapping) as IRouteDataMapping),
                Mapping.TypeConst.facet => new FacetValueFilterMapping(mapping),
                Mapping.TypeConst.mzdb => new MZDBMap(key, mapping, _contextProvider),
                Mapping.TypeConst.category => new CategoryMapping(mapping),
                Mapping.TypeConst.regex => new RegexMapping(mapping),
                _ => throw new ArgumentException($"mapping type {mapping.type} not known")
            };
        }
    }

    public class FacetValueFilterMapping : IRouteDataMapping
    {
        readonly string _facetId;

        public FacetValueFilterMapping(Mapping settings)
        {
            Settings = settings;
            if (settings.facetId.IsNullOrEmpty()) throw new ArgumentException("facetId");
           
            _facetId = settings.facetId;
        }

        public bool Initialize() { return true; }

        public IDictionary<string, object> Map(HttpContext context, IDictionary<string, object> values, string parameterName)
        {
            if (!values.TryGetValue(parameterName, out var tmp))
            {
                return values;
            }
            var value = Convert.ToString(tmp);
            
            var col = SearchContext.Get(context.Request);

            col.Facets.Add(_facetId, value);

            return values;
        }

        public Mapping Settings
        {
            get;
            set;
        }
    }

    public class RegexMapping : IRouteDataMapping
    {
        Regex _regex;
        Exception _ex;
        public Mapping Settings
        {
            get;
            set;
        }

        public RegexMapping(Mapping settings)
        {
            Settings = settings;
            try
            {
                _regex = new Regex(Settings.pattern, RegexOptions.IgnoreCase, matchTimeout:TimeSpan.FromSeconds(2));
            }
            catch( Exception ex)
            {
                _ex = new Exception($"bad pattern: { settings.pattern} ", ex);
            }
        }


        public IDictionary<string, object> Map(HttpContext context, IDictionary<string, object> values, string parameterName)
        {
            object obj;
            if (values.TryGetValue(parameterName, out obj) && obj!= null)
            {
                if (_ex!= null)
                {
                    throw _ex;
                }
                var parameterValue = Convert.ToString(obj);
                var key = string.IsNullOrWhiteSpace(Settings.mapTo) ? parameterName : Settings.mapTo;
                values[key] = _regex.Replace(parameterValue, Settings.replacement??string.Empty);
            }
            return values;
        }

        public bool Initialize()
        {
            return true;
        }
    }
    //todo:depricate
    public class CategoryMapping : IRouteDataMapping
    {
        
        public Mapping Settings
        {
            get;
            set;
        }

        public CategoryMapping(Mapping settings)
        {
            // TODO: Complete member initialization
            this.Settings = settings;
        }

        public IDictionary<string, object> Map(HttpContext context, IDictionary<string, object> values, string parameterName)
        {
            //var slug = parameterName + "Slug";
            //var id = parameterName + "Id";
            //var code = parameterName + "Code";
            //string val;
            //if(values.try )

            return values;
        }

        public bool Initialize()
        {
            return true;
        }
    }
    public class QueryStringMapping : IRouteDataMapping
    {
        List<Tuple<string, string>> Pairs = new List<Tuple<string, string>>();

        public QueryStringMapping ()
        {
            Settings = new Mapping();
        }

        public bool Initialize()
        {
            return true;
        }

        public Mapping Settings { get; set; }
        public IDictionary<string, object> Map(HttpContext context, IDictionary<string, object> values, string parameterName)
        {
            var qs = context.Request.Query;
            foreach ( var (pairItem1, pairItem2) in Pairs)
            {
                var val = qs.Where(x => x.Key == pairItem1).Select(x => x.Value).FirstOrDefault();
                if (!string.IsNullOrEmpty(val))
                {
                    values[pairItem2] = val;
                }
            }
            return values;
        }
    }
    public class RouteDataFixup : IRouteDataMapping
    {
        public Mapping Settings
        {
            get;
            set;
        }

        public RouteDataFixup()
        {
            Settings = new Mapping();
        }

        public static readonly RouteDataFixup DefaultMapping = new RouteDataFixup();


        public IDictionary<string, object> Map(HttpContext context, IDictionary<string, object> values, string parameterName)
        {
            var qs = context.Request.Query;
            
            SetValue(values, qs,"pageSize", true);
            SetValue(values, qs, "startIndex", true);
            SetValue(values, qs, "categoryId", true);
            SetValue(values, qs, "sortBy", false);
            SetValue(values, qs, "query", false);
            SetValue(values, qs, "categoryCode", false);
            SetValue(values, qs, "facetValueFilter", false);

            foreach ( var (key, value) in values.Where(x=> x.Value is Category  && x.Key.EndsWith("-categoryObject")).ToList())
            {
                var cat = (Category)value;

                var subCode = key == "-categoryObject" ? "" : key.Replace("-categoryObject", "")+"-";
               
                values[subCode+"categoryCode"] = cat.CategoryCode;
                values[subCode+"categoryId"] = cat.CategoryId;
                values[subCode+"categorySlug"] = cat.Content?.Slug;
            }

            var catFound = false; 

            if (values.TryGetValue("categoryId", out var tmp) && tmp != null && (tmp is int || tmp is string))
            {
                if (int.TryParse(tmp.ToString(), out var id))
                {
                    var catTreeProvider = context.RequestServices.Resolve<ICategoryTreeProvider>();
                    var cat = catTreeProvider.GetAllCategories().FindById(id);
                    if (cat != null)
                    {
                        values["categoryCode"] = cat.CategoryCode;
                        catFound = true;
                    }
                }
            }

            if (!catFound && values.TryGetValue("categoryCode", out tmp) && !string.IsNullOrWhiteSpace(tmp as string))
            {
                var catTreeProvider = context.RequestServices.Resolve<ICategoryTreeProvider>();
                var cat = catTreeProvider.GetAllCategories().FindByCode((string)tmp);
                if (cat != null)
                {
                    values["categoryId"] = cat.Id;
                }
            }

            SearchContext.Get(context.Request).InitRouteData(values);
            return values;
        }

        private static void SetValue(IDictionary<string, object> values, IQueryCollection qs, string key, bool asInt)
        {
            if (values.TryGetValue(key, out var obj) && obj != null && !(obj is string s && string.IsNullOrWhiteSpace(s)))
            {
                return;
            }

            var temp = qs[key];
            if (asInt)
            {
                if (int.TryParse(temp, out var tempInt))
                {
                    values[key] = tempInt;
                }
            }
            else
            {
                values[key] = temp;
            }
        }

        public bool Initialize()
        {
            return true; 
        }
    }

    public abstract class DictionaryMappingBase 
    {
        public  DictionaryMappingBase( Mapping settings)
        {
            Settings = settings;
        }
        public Mapping Settings { get; set; }
        public Dictionary<string, object> Mappings { get; set; }
        public IDictionary<string, object> Map(HttpContext context, IDictionary<string, object> values, string parameterName)
        {
            object obj;
            if (values.TryGetValue(parameterName, out obj) && obj != null)
            {
                var parameterValue = Convert.ToString(obj);

                object replacement;
                if (Mappings.TryGetValue(parameterValue, out replacement))
                {
                    var key = string.IsNullOrWhiteSpace(Settings.mapTo) ? parameterName : Settings.mapTo;
                    values[key] = replacement;
                }

            }
            return values;
        }
    }
    public class DirectMapping : DictionaryMappingBase, IRouteDataMapping
    {
       

        public DirectMapping(Mapping settings):base(settings)
        {
            
            if (settings.mappings == null ) throw new ArgumentException("mappings");

            this.Mappings = new Dictionary<string, object>(settings.mappings, StringComparer.OrdinalIgnoreCase);
        }
        public bool Initialize() { return true; }

        
    }

    public class MZDBMap : DictionaryMappingBase, IRouteDataMapping
    {
        private string key;
        
        private ISiteBuilderContextProvider contextRepo;

      

        public MZDBMap(string key, Mapping mapping, ISiteBuilderContextProvider contextRepo):base(mapping)
        {
            this.key = key;
           
            this.contextRepo = contextRepo;
        }

        public static async Task<Dictionary<string, object>> BuildContextData(IEntityListsWebApiClient client, Mapping settings)
        {
            IEntityListsWebApiClient _client;
            string _entityList;
            string _docId;
            _client = client;
            _entityList = settings.listFqn;
            _docId = settings.docId;


            var entityResponse = await _client.CloneWithoutUserClaims().GetEntity(_entityList, _docId).ConfigureAwait(false);
            if (entityResponse.HasException) throw entityResponse.ReadException();

            var entity = entityResponse.ReadAsSync();


            var Mappings = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

            foreach (var prop in entity.Properties().Where(x => x.Value is JValue))
            {
                var val = ((JValue)prop.Value).Value;
                Mappings[prop.Name] = val;
            }

            return Mappings;
        }

        public  bool Initialize()
        {
            if (contextRepo != null)
            {
                var data =  contextRepo.GetContextData();
                this.Mappings = data.RouteMapperData.ContainsKey(this.key) ?
                    data.RouteMapperData[this.key] :
                    new Dictionary<string, object>();
                return true;
            }
            throw new NotImplementedException();
            //var entityResponse = await _client.CloneWithoutUserClaims().GetEntity(_entityList, _docId).ConfigureAwait(false);
            //if (entityResponse.HasException) throw entityResponse.ReadException();

            //var entity = entityResponse.ReadAsSync();
        
                
            //this.Mappings = new Dictionary<string,object>( StringComparer.OrdinalIgnoreCase );

            //foreach( var prop in entity.Properties().Where(x=> x.Value is JValue))
            //{
            //    var val = ((JValue)prop.Value).Value;
            //    this.Mappings[prop.Name] = val;
            //}
               
            //return true;
        }

        
    }
}
