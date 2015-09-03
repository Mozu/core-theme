using Mozu.Core.Api.Contracts;
using Mozu.MZDB.Contracts.Clients;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http.Routing;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.MZDB.Contracts;
using Mozu.ProductRuntime.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Category = Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category;
using ProductSearchResult = Mozu.ProductRuntime.Contracts.ProductSearchResult;

namespace Mozu.SiteBuilder.Mvc.SEO.Constraints
{
    public class ConstraintFactory : ICustomRouteConstraintFactory
    {
        readonly IAttributeWebApiClient _attributeClient;
        private readonly IProductSearchWebApiClient _productSearchWebApiClient;
        readonly IApiContext _context;
        readonly IEntityListsWebApiClient _entityListClient;

        public ConstraintFactory(IEntityListsWebApiClient entityListClient, 
            IAttributeWebApiClient attributeClient,
            ProductRuntime.Contracts.Clients.IProductSearchWebApiClient productSearchWebApiClient,
            IApiContext context)
        {
            _entityListClient = entityListClient;
            _attributeClient = attributeClient;
            _productSearchWebApiClient = productSearchWebApiClient;
            _context = context;
        }
        
        public ICustomRouteConstraint BuildConstraint(Validator validator)
        {
         
            switch (validator.type.ToLowerInvariant())
            {
                case Validator.TypeConst.attribute:
                    return new ProductAttributeRouteConstraint(_attributeClient, _productSearchWebApiClient, _context, validator.attributeFQN);
                case Validator.TypeConst.categoryCode:
                case Validator.TypeConst.categorySlug:
                case Validator.TypeConst.categorySlugPath:
                case Validator.TypeConst.categoryId:
                case Validator.TypeConst.categoryCodePath:
                    return new CategoryContraint(validator);
                case Validator.TypeConst.list:
                    return new StringListRouteConstraint(validator.values);
                case Validator.TypeConst.mzdb:
                    return new MzdbRouteConstraint(_entityListClient, validator.listFqn,validator.docId, validator.field);
                case QueryStringConstraint.TypeName:
                    return new QueryStringConstraint(validator);

            }
            throw new ArgumentException(string.Format("validator type [{0}] not known", validator.type));
        }

      
    }

    public abstract class ConstraintBase : ICustomRouteConstraint
    {
        public abstract Task<bool> Initialize();
        public abstract bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection);

        public bool Match(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            if ( routeDirection == HttpRouteDirection.UriGeneration)
            {
                return true;
            }
            return DoMatch(request, route, parameterName, values, routeDirection);
        }
    }
    
    public class CategoryToken
    {
        public enum CategoryIdentifierType
        {
            Id,
            Code,
            Slug
        };

        public CategoryToken (CategoryIdentifierType type, int depth, string subCode)
        {
            this.Depth = depth;
            this.SubCode = subCode;
            this.IdType = type;
            
        }
        public  CategoryToken(string token)
        {
           
            var m = pattern.Match(token);
            IsMatch = m.Success;
            if ( !IsMatch )
            {
                return;
            }
            CategoryIdentifierType type;
            if ( Enum.TryParse<CategoryIdentifierType>(m.Groups["t"].Value,true,out type))
            {
                IdType = type;
            }
            else
            {
                IsMatch = false;
                return;
            }
            SubCode = m.Groups["s"].Value;

            var p   = m.Groups["p"].Captures.Count;
            var gp  = 2*m.Groups["gp"].Captures.Count;
               
            var grtCount = m.Groups["g"].Captures.Count;
            Depth  = p+gp+grtCount;


        }

        public  string GetRawValue()
        {

            StringBuilder sb = new StringBuilder();
            int d = Depth;
            while (d > 2)
            {
                d = d - 1;
                sb.Append("great-");
            }
            if (d == 2)
            {
                sb.Append("grandParent-");

            }
            else if (d == 1)
            {
                sb.Append("parent-");
            }
            if (!string.IsNullOrEmpty(SubCode))
            {
                sb.Append(SubCode).Append("-");
            }
            sb.Append("category");
            sb.Append(IdType);
            return sb.ToString();
        }
        public CategoryToken GetParent()
        {
            return new CategoryToken(IdType, Depth + 1, SubCode);
        }
        public CategoryToken GetChild()
        {
            if ( Depth == 0)
            {
                return null;
            }
            return new CategoryToken(IdType, Depth - 1, SubCode);
        }
        //"g-g-gp-sdf"
        //"parent"
        //"grandP"


        public string Raw { get { return GetRawValue(); } }
        public bool IsMatch { get; set; }
        public int Depth { get; set; }
        public string SubCode { get; set; }

        public CategoryIdentifierType IdType { get; set; }


        static Regex pattern = new Regex(@"^((?<g>great)\-){0,7}((?<gp>grandParent)\-){0,1}((?<p>parent)\-){0,1}((?<s>[a-z0-9]+)\-){0,1}category(?<t>(Code|Id|Slug))$",
                RegexOptions.IgnoreCase |
                RegexOptions.ExplicitCapture |
                RegexOptions.IgnorePatternWhitespace);
    }
   public class QueryStringConstraint: ConstraintBase
    {
        public const string TypeName = "_querystring_";
        public  ValidatorSettings Settings { get; set; }
        public QueryStringConstraint ( Validator validator)
        {
            Settings = (ValidatorSettings)validator;
        }

        public class ValidatorSettings : Validator
        {
            public string QsKey { get; set; }
            public string ValueKey { get; set; }
            public string Value { get; set; }
            public bool IsLiteral { get; set; }
        }

       public override Task<bool> Initialize()
       {
            return Task.FromResult(true);
       }

       public override bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values,
           HttpRouteDirection routeDirection)
       {
            var qs = request.GetQueryNameValuePairs();
            object tmp;
            string foundVal;
            var found = false;
            if ( values.TryGetValue(Settings.ValueKey, out tmp))
            {
                foundVal = Convert.ToString(tmp);
                found = true;
            }
            else
            {
                foundVal = qs.Where(x => string.Equals(x.Key, Settings.QsKey, StringComparison.OrdinalIgnoreCase)).Select(x=> x.Value).FirstOrDefault();
                found = foundVal != null;
            }
            if (!found)
            {
                return false;
            }
            if ( Settings.IsLiteral )
            {
                if ( string.Equals(foundVal, Settings.Value ))
                {
                    values[Settings.ValueKey] = Settings.Value;
                    return true;
                }
                return false;
            }
            values[Settings.ValueKey] = foundVal;
            return true;
        }
    }
    public class CategoryContraint : ConstraintBase
    {
        public Validator Settings { get; set; }

        public CategoryContraint(Validator settings)
        {
            // TODO: Complete member initialization
            this.Settings = settings;
        }

        public override Task<bool> Initialize()
        {
            return Task.FromResult(true);
        }

        
        //public Validator Settings
        //{
        //    get;set;
        //}



        public override bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            if (routeDirection == HttpRouteDirection.UriGeneration)
            {
                return true;
            }
            object tmp;
            if ( !values.TryGetValue(parameterName,out tmp) || tmp == null)
            {
                return false;
            }
        
            var tree = new Lazy<CategoryTree>(()=>request.Resolve<ICategoryTreeProvider>().GetAllCategories().Result);
            Category cat = null;

            var token = new CategoryToken(parameterName);
            if ( !token.IsMatch)
            {
                return false;
            }
            switch (Settings.type)
            {
                case Validator.TypeConst.categoryId:
                    {
                        cat = MatchId( tree, token, values);
                        break;
                    }
                case Validator.TypeConst.categoryCode:
                    {
                        cat = MatchCode(tree, token, values);
                        break;
                    }
                case Validator.TypeConst.categorySlug:
                    {
                        cat = MatchSlug(tree, token, values);
                        break;
                    }
                case Validator.TypeConst.categorySlugPath:
                    {
                        cat = MatchSlugPath(tree, token, values);
                        break;
                    }
                case Validator.TypeConst.categoryCodePath:
                    {
                        cat = MatchCategoryCodePath(tree,token, values);
                        break;
                    }
            }
            if (cat == null)
            {
                return false;
            }
            if (token.Depth == 0)
            {
                values[token.SubCode + "-categoryObject"] = cat;
            }

            return true;

        }
        Category MatchId(Lazy<CategoryTree> catTree, CategoryToken token, IDictionary<string, object> values)
        {
         
            object tmp;
            int id;
            if (!values.TryGetValue(token.Raw , out tmp))
            {
                return null;
            }
            tmp = Convert.ToString(tmp);
            if (!int.TryParse((string)tmp, out id))
            {
                return null;
            }

           
            return catTree.Value.FindById(id);
        
        }
        Category MatchCode(Lazy<CategoryTree> catTree, CategoryToken token, IDictionary<string, object> values)
        {

            object tmp;

            if (!values.TryGetValue(token.Raw , out tmp) || string.IsNullOrEmpty(tmp as string))
            {
                return null;
            }
            var code = Convert.ToString(tmp);
            

            
            return catTree.Value.FindByCode(code);

        }
        Category MatchSlug(Lazy<CategoryTree> catTree, CategoryToken token, IDictionary<string, object> values)
        {

            object tmp;

            if (!values.TryGetValue(token.Raw, out tmp) || string.IsNullOrEmpty(tmp as string))
            {
                return null;
            }
            var code = Convert.ToString(tmp);


         
            return catTree.Value.FindBySlug(code).FirstOrDefault();

        }
        Category MatchSlugPath(Lazy<CategoryTree> catTree, CategoryToken token, IDictionary<string, object> values)
        {

            object tmp;

            if (!values.TryGetValue(token.Raw, out tmp) || tmp == null)
            {
                return null;
            }
            var slug = Convert.ToString(tmp);
           
            var cats = catTree.Value.FindBySlug(slug).ToList();
            if (!cats.Any())
            {
                return null ;
            }

           

            Category matchedCat = null;
            foreach (var cat in cats)
            {
                matchedCat = cat;
                var parentCat = cat.ParentCategory;
                var parentToken = token.GetParent();
                while(true)
                {
                    
                    if (!values.TryGetValue( parentToken.Raw , out tmp) || string.IsNullOrEmpty(tmp as string))
                    {
                        //parent not in route no need to look up. winner...
                        break;
                    }
                    
                    if ( parentCat == null || parentCat.Content == null)
                    {
                        //current ancenstor doesnt have a parent :(  loozer
                        matchedCat = null;
                        break;
                    }
                    slug = Convert.ToString(tmp);


                    if (! string.Equals(slug, parentCat.Content.Slug , StringComparison.OrdinalIgnoreCase))
                    {
                        //current ancenstor doesnt match ancesotor route. loozer
                        matchedCat = null;
                        break;
                    }

                    parentCat = parentCat.ParentCategory;
                    parentToken = parentToken.GetParent();
                }
                if ( matchedCat != null)
                {
                    break;
                }
            }

            return matchedCat;
            

        }
        Category MatchCategoryCodePath(Lazy<CategoryTree> catTree, CategoryToken token, IDictionary<string, object> values)
        {

            object tmp;

            if (!values.TryGetValue(token.Raw, out tmp) || string.IsNullOrEmpty(tmp as string))
            {
                return null;
            }
            var code = Convert.ToString(tmp);


           
            var cat = catTree.Value.FindByCode(code);
            if (cat == null)
            {
                return null;
            }


            

            Category matchedCat = null;

            matchedCat = cat;
            var parentCat = cat.ParentCategory;
            var parentToken = token.GetParent();
            while (true)
            {

                if (!values.TryGetValue(parentToken.Raw, out tmp) || string.IsNullOrEmpty(tmp as string))
                {
                    //parent not in route no need to look up. winner...
                    break;
                }

                if (parentCat == null)
                {
                    //current ancenstor doesnt have a parent :(  loozer
                    matchedCat = null;
                    break;
                }
                code = Convert.ToString(tmp);


                if (!string.Equals(code, parentCat.CategoryCode, StringComparison.OrdinalIgnoreCase))
                {
                    //current ancenstor doesnt match ancesotor route. loozer
                    matchedCat = null;
                    break;
                }

                parentCat = parentCat.ParentCategory;
                parentToken = parentToken.GetParent();
            }


            return matchedCat;

        }
    }

    public class ProductAttributeRouteConstraint : ConstraintBase
    {
        readonly Func<Task<ServiceClientResponse<List<AttributeVocabularyValue>>>> attFn;
        Func<Task<ServiceClientResponse<ProductSearchResult>>> searchFn;
        private string _localeCode;
        IDictionary<string, AttributeVocabularyValue> _attributeValues { get; set; }
        IDictionary<string, FacetValue> _facetValues { get; set; }

        public ProductAttributeRouteConstraint(IAttributeWebApiClient attributeClient, IProductSearchWebApiClient _productSearchWebApiClient,  IApiContext context, string attributeCode)
        {
            AttributeCode = attributeCode;
            if (attributeCode.IsNullOrEmpty()) throw new ArgumentException("attributeCode");

            searchFn = () => _productSearchWebApiClient.CloneWithoutUserClaims().Search(
                query: "*:*",
                pageSize: 0,
                facet: attributeCode);
            attFn = () => attributeClient.CloneWithoutUserClaims().GetAttributeVocabularyValues(attributeCode);
            _localeCode = context.LocaleCode;
        }
        public string AttributeCode { get; set; }
        public override async Task<bool> Initialize()
        {
            var attTask = attFn();
            var searchTask = searchFn();
            await Task.WhenAll(attTask, searchTask).ConfigureAwait(false);
            var attRes = attTask.Result;
            if (attRes.HasException)
            {
                throw attRes.ReadException();
            }
            var val = attRes.ReadAsSync();
            var dict = new Dictionary<string, AttributeVocabularyValue>(StringComparer.OrdinalIgnoreCase);
            foreach (var entry in val)
            {
                dict[entry.Content.StringValue] = entry;
                dict[entry.Value.ToString()] = entry;
            }
            var searchRes = searchTask.Result;

            if (searchRes.HasException)
            {
                throw searchRes.ReadException();
            }
            var val2 = searchRes.ReadAsSync();
            var dict2 = new Dictionary<string, FacetValue>(StringComparer.OrdinalIgnoreCase);
            foreach (var entry in val2.Facets.SelectMany(x=> x.Values))
            {
                dict2[entry.Value] = entry;
                
            }


            _facetValues = dict2;
            _attributeValues = dict;
            return true;
        }

        public override bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            
           
            object routeValue;
            if (!values.TryGetValue(parameterName, out routeValue))
            {
                return false;
            }

            if (routeValue is string && routeDirection == HttpRouteDirection.UriGeneration)
            {
                return true;
            }

           
            var curRouteValue = routeValue.ToString();

            if (!_attributeValues.ContainsKey(curRouteValue) && !_facetValues.ContainsKey(curRouteValue))
            {
                return false;
            }
           



            //TODO: put the right locale in here?
            //AttributeVocabularyValue attr;
            //values[parameterName] = GetAttributeValue(attr, "en-US");
            return true;
        }

        /// <summary>
        /// TODO: what value should we be setting in this route? I'm assuming the localized content? But then where do we get the locale from?
        /// </summary>
        /// <param name="attr"></param>
        /// <returns></returns>
        private string GetAttributeValue(AttributeVocabularyValue attr, string localeCode)
        {
            var content = attr.LocalizedContent == null ? attr.Content : attr.LocalizedContent.FirstOrDefault(lc => lc.LocaleCode.EqualsIgnoreCase(localeCode)) ?? attr.Content;
            return content.StringValue;
        }
    }

    public class MzdbRouteConstraint : ConstraintBase
    {
        readonly Func<int, int, Task<ServiceClientResponse<EntityCollection>>> _getDocsFunc;
        readonly Func<Task<ServiceClientResponse<JObject>>> _getDosFunc;
        readonly Func<JObject, IEnumerable<string>> _fieldGetter;
        IList<string> _values;

        public MzdbRouteConstraint(IEntityListsWebApiClient mzdbClient, string listId, string docId, string fieldId)
        {
            if (listId.IsNullOrEmpty()) throw new ArgumentException("listId");
            if (fieldId.IsNullOrEmpty()) throw new ArgumentException("fieldId");

            var client = mzdbClient.CloneWithoutUserClaims();
            if ( string.IsNullOrEmpty(docId))
            {
                _getDocsFunc = async (start, size) => await client.GetEntities(listId, startIndex: start, pageSize: size).ConfigureAwait(false);
            }
            else
            {
                _getDosFunc = async () => await client.GetEntity(listId, docId).ConfigureAwait(false);
            }
            
            _fieldGetter = o => FlattenFieldValues(o, fieldId);
        }

        static IEnumerable<string> FlattenFieldValues(JObject o, string field)
        {
            JToken t;
            if (!o.TryGetValue(field, out t)) return Enumerable.Empty<string>();

            if (t is JArray) return ((JArray)t).Values().Where(x => x is JValue).Select(x => x.Value<string>());
            if (t is JValue) return new[] { ((JValue)t).Value<string>() };
            return Enumerable.Empty<string>();
        }

        public override async Task<bool> Initialize()
        {
            if (_getDocsFunc != null)
            {
                var mzdbDocResponse = await _getDocsFunc(0, 50).ConfigureAwait(false);
                if (mzdbDocResponse.HasException) throw mzdbDocResponse.ReadException();

                var mzdbDocs = mzdbDocResponse.ReadAsSync();
                var otherItems = await Unroll<JObject>(async (start, size) => (await _getDocsFunc(start, size).ConfigureAwait(false)).ReadAsSync(), mzdbDocs.TotalCount, 50);

                _values = mzdbDocs.Items.Concat(otherItems).SelectMany(_fieldGetter).ToList();
            }
            else
            {
                _values = _fieldGetter((await _getDosFunc()).ReadAsSync()).ToList();
            }
            return true;
        }

        private static async Task<IEnumerable<T>> Unroll<T>(Func<int, int, Task<PagedCollectionBase<T>>> getter, int totalCount, int pageSize)
        {
            var tasks = Enumerable.Range(0, totalCount / pageSize).Select(async i => await getter(i * pageSize, pageSize).ConfigureAwait(false));
            var results = await Task.WhenAll(tasks);
            return results.SelectMany(x => x.Items);
        }

        public override bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            //todo:validate this.
            if (routeDirection == HttpRouteDirection.UriGeneration)
            {
                return true;
            }
            object temp;
            if (!values.TryGetValue(parameterName, out temp))
            {
                return false;
            }

            var curRouteValue = temp.ToString();
            return _values.Any(x => x.ToString().Equals(curRouteValue, StringComparison.OrdinalIgnoreCase));
        }
    }

    public class StringListRouteConstraint : ConstraintBase
    {
        readonly IEnumerable<string> _values;

        public StringListRouteConstraint(IEnumerable<string> values)
        {
            if (values == null || values.Count() == 0) throw new ArgumentException("values");

            _values = values;
        }

        public override Task<bool> Initialize()
        {
            return Task.FromResult(true);
        }

        public override bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            object temp;
            if (!values.TryGetValue(parameterName, out temp))
            {
                return false;
            }
            var curRouteValue = temp.ToString();

            return _values.Any(x => x.Equals(curRouteValue, StringComparison.OrdinalIgnoreCase));
        }
    }
}
