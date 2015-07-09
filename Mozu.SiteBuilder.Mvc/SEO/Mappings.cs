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
                    return new DirectMapping(mapping);
                case Mapping.TypeConst.facet:
                    return new FacetValueFilterMapping(mapping);
                case Mapping.TypeConst.mzdb:
                    return new MZDBMap(_entityListClient, mapping);
                case Mapping.TypeConst.category:
                    return new CategoryMapping(mapping);
                case Mapping.TypeConst.regex:
                    return new RegexMapping(mapping);
            }
            throw new ArgumentException(string.Format("mapping type {0} not known", mapping.type));
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


        public Mapping Settings
        {
            get;
            set;
        }
    }

    public class RegexMapping : IRouteDataMapping
    {
        public Mapping Settings
        {
            get;
            set;
        }

        public RegexMapping(Mapping settings)
        {
            Settings = settings;
        }


        public IDictionary<string, object> Map(HttpRequestMessage requestMessage, IDictionary<string, object> values, string parameterName)
        {
            object obj;
            if (values.TryGetValue(parameterName, out obj) && obj!= null)
            {
                var parameterValue = Convert.ToString(obj);
                var key = string.IsNullOrWhiteSpace(Settings.mapTo) ? parameterName : Settings.mapTo;
                values[key] = Regex.Replace(parameterValue, Settings.pattern, Settings.replacement, RegexOptions.IgnoreCase);
            }
            return values;
        }

        public Task<bool> Initialize()
        {
            return Task.FromResult(true); 
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


        public Mapping Settings
        {
            get;
            set;
        }

        public RouteDataFixup()
        {
            Settings = new Mapping();
        }

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

    public abstract class DictionaryMappingBase 
    {
        public  DictionaryMappingBase( Mapping settings)
        {
            Settings = settings;
        }
        public Mapping Settings { get; set; }
        public Dictionary<string, string> Mappings { get; set; }
        public IDictionary<string, object> Map(HttpRequestMessage requestMessage, IDictionary<string, object> values, string parameterName)
        {
            object obj;
            if (values.TryGetValue(parameterName, out obj) && obj != null)
            {
                var parameterValue = Convert.ToString(obj);

                string replacement;
                if (Mappings.TryGetValue(parameterValue, out replacement))
                {
                    var key = string.IsNullOrWhiteSpace(Settings.mapTo) ? parameterName : Settings.mapTo;
                    values[key] = replacement;
                }

            }
            return values;
        }
    }
    public class DirectMapping : DictionaryMappingBase,IRouteDataMapping
    {
       

        public DirectMapping(Mapping settings):base(settings)
        {
            
            if (settings.mappings == null ) throw new ArgumentException("mappings");

            this.Mappings = new Dictionary<string, string>(settings.mappings, StringComparer.OrdinalIgnoreCase);
        }
        public Task<bool> Initialize() { return Task.FromResult(true); }

        
    }

    public class MZDBMap : DictionaryMappingBase, IRouteDataMapping
    {
        readonly IEntityListsWebApiClient _client;
        readonly string _entityList;
        readonly string _docId;
        
        
        public MZDBMap(IEntityListsWebApiClient client, Mapping settings):base(settings)
        {
            if (settings.listName.IsNullOrEmpty()) throw new ArgumentException("entityList");
            if (settings.docId.IsNullOrEmpty()) throw new ArgumentException("docId");

            _client = client;
            _entityList = settings.listName;
            _docId = settings.docId;
        }

        public async Task<bool> Initialize()
        {
            var entityResponse = await _client.CloneWithoutUserClaims().GetEntity(_entityList, _docId).ConfigureAwait(false);
            if (entityResponse.HasException) throw entityResponse.ReadException();

            var entity = entityResponse.ReadAsSync();
            var entries = 
                entity.Values()
                .Where(x => x.Type == JTokenType.Property &&  (( JProperty)x).Value is JValue  )
                .Cast<JProperty>();
            this.Mappings = new Dictionary<string,string>( StringComparer.OrdinalIgnoreCase );

            foreach( var prop in entries)
            {
                var val = ((JValue)prop.Value).Value;
                this.Mappings[prop.Name ]= val== null ? null : val.ToString();
            }
               
            return true;
        }

        
    }
}
