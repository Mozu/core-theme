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
using System.Threading.Tasks;
using System.Web.Http.Routing;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.MZDB.Contracts;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Category = Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category;

namespace Mozu.SiteBuilder.Mvc.SEO.Constraints
{
    public class ConstraintFactory : ICustomRouteConstraintFactory
    {
        readonly IAttributeWebApiClient _attributeClient;
        readonly IApiContext _context;
        readonly IEntityListsWebApiClient _entityListClient;

        public ConstraintFactory(IEntityListsWebApiClient entityListClient, IAttributeWebApiClient attributeClient, IApiContext context)
        {
            _entityListClient = entityListClient;
            _attributeClient = attributeClient;
            _context = context;
        }

        public ICustomRouteConstraint BuildConstraint(Validator validator)
        {
            switch (validator.type)
            {
                case Validator.TypeConst.attribute:
                    return new ProductAttributeRouteConstraint(_attributeClient, _context, validator.attributeCode);
                case Validator.TypeConst.categoryCode:
                case Validator.TypeConst.categorySlug:
                case Validator.TypeConst.categorySlugPath:
                case Validator.TypeConst.categoryId:
                case Validator.TypeConst.categoryCodePath:
                    return new CategoryContraint(validator);
                case Validator.TypeConst.list:
                    return new StringListRouteConstraint(validator.values);
                case Validator.TypeConst.mzdb:
                    return new MzdbRouteConstraint(_entityListClient, validator.listId, validator.fieldId);
            }
            throw new ArgumentException(string.Format("mapping type {0} not known", validator.type));
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
    
   
    public class CategoryContraint : ConstraintBase
    {
        private Validator validator;

        public CategoryContraint(Validator validator)
        {
            // TODO: Complete member initialization
            this.validator = validator;
        }

        public override Task<bool> Initialize()
        {
            return Task.FromResult(true);
        }

        static List<string> SlugAncestoryNames = new List<string>{
                        "categorySlug",
                        "parent-categorySlug",
                        "grandParent-categorySlug",
                        "great-grandParent-categorySlug",
                        "great-great-grandParent-categorySlug",
                        "great-great-great-grandParent-categorySlug",
                        "great-great-great-great-grandParent-categorySlug",
                    };
        static List<string> CodeAncestoryNames = new List<string>{
                        "categoryCode",
                        "parent-categoryCode",
                        "grandParent-categoryCode",
                        "great-grandParent-categoryCode",
                        "great-great-grandParent-categoryCode",
                        "great-great-great-grandParent-categoryCode",
                        "great-great-great-great-grandParent-categoryCode",
                    };

        public override bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            if (routeDirection == HttpRouteDirection.UriGeneration)
            {
                return true;
            }
            Category cat = null;
            switch (validator.type)
            {
                case Validator.TypeConst.categoryId:
                    {
                        cat = MatchId(request, route, parameterName, values, routeDirection);
                        break;
                    }
                case Validator.TypeConst.categoryCode:
                    {
                        cat = MatchCode(request, route, parameterName, values, routeDirection);
                        break;
                    }
                case Validator.TypeConst.categorySlug:
                    {
                        cat = MatchSlug(request, route, parameterName, values, routeDirection);
                        break;
                    }
                case Validator.TypeConst.categorySlugPath:
                    {
                        cat = MatchSlugPath(request, route, parameterName, values, routeDirection);
                        break;
                    }
                case Validator.TypeConst.categoryCodePath:
                    {
                        cat = MatchCategoryCodePath(request, route, parameterName, values, routeDirection);
                        break;
                    }
            }
            if (cat == null)
            {
                return false;
            }

            values[parameterName + "-object"] = cat;

            return true;

        }
        Category MatchId(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
         
            object tmp;
            int id;
            if (!values.TryGetValue(parameterName, out tmp))
            {
                return null;
            }
            tmp = Convert.ToString(tmp);
            if (!int.TryParse((string)tmp, out id))
            {
                return null;
            }

            var catTreeProvider = request.Resolve<ICategoryTreeProvider>();
            var catTree = catTreeProvider.GetAllCategories().Result;

            return catTree.FindById(id);
        
        }
        Category MatchCode(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {

            object tmp;
           
            if (!values.TryGetValue(parameterName, out tmp)|| tmp == null)
            {
                return null;
            }
            var code = Convert.ToString(tmp);
            

            var catTreeProvider = request.Resolve<ICategoryTreeProvider>();
            var catTree = catTreeProvider.GetAllCategories().Result;

            return catTree.FindByCode(code);

        }
        Category MatchSlug(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {

            object tmp;
            
            if (!values.TryGetValue(parameterName, out tmp) || tmp == null)
            {
                return null;
            }
            var code = Convert.ToString(tmp);


            var catTreeProvider = request.Resolve<ICategoryTreeProvider>();
            var catTree = catTreeProvider.GetAllCategories().Result;

            return catTree.FindBySlug(code).FirstOrDefault();

        }
        Category MatchSlugPath(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {

            object tmp;

            if (!values.TryGetValue(parameterName, out tmp) || tmp == null)
            {
                return null;
            }
            var slug = Convert.ToString(tmp);


            var catTreeProvider = request.Resolve<ICategoryTreeProvider>();
            var catTree = catTreeProvider.GetAllCategories().Result;
            var cats = catTree.FindBySlug(slug).ToList();
            if (!cats.Any())
            {
                return null ;
            }
            if (cats.Count() == 1)
            {
               // return cats[0];
            }



            var index = SlugAncestoryNames.FindIndex(x => string.Equals(parameterName, x, StringComparison.OrdinalIgnoreCase));
            if (index < 0 || index >= SlugAncestoryNames.Count - 1)
            {
                return null;
            }
            Category matchedCat = null;
            foreach (var cat in cats)
            {
                matchedCat = cat;
                var parent = cat.ParentCategory;
                for (var i = index + 1; parent != null && parent.IsDisplayed && parent.Content != null && i < SlugAncestoryNames.Count; i++)
                {
                    object obj;
                    parameterName = SlugAncestoryNames[i];
                    if (values.TryGetValue(parameterName, out obj))
                    {
                        slug = obj as string;
                        if (!string.Equals(slug, parent.Content.Slug, StringComparison.OrdinalIgnoreCase))
                        {
                            matchedCat = null;
                            break;
                        }
                    }
                    else
                    {
                        break;
                    }
                    parent = cat.ParentCategory;
                }
                if (matchedCat != null)
                {
                    break;
                }
            }
            return matchedCat;
            

        }
        Category MatchCategoryCodePath(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {

            object tmp;

            if (!values.TryGetValue(parameterName, out tmp) || tmp == null)
            {
                return null;
            }
            var code = Convert.ToString(tmp);


            var catTreeProvider = request.Resolve<ICategoryTreeProvider>();
            var catTree = catTreeProvider.GetAllCategories().Result;
            var cat = catTree.FindByCode(code);
            if (cat == null)
            {
                return null;
            }




            var index = CodeAncestoryNames.FindIndex(x => string.Equals(parameterName, x, StringComparison.OrdinalIgnoreCase));
            if (index < 0 || index >= CodeAncestoryNames.Count - 1)
            {
                return null;
            }


            var parent = cat.ParentCategory;
            for (var i = index + 1; parent != null && parent.IsDisplayed && parent.Content != null && i < CodeAncestoryNames.Count; i++)
            {
                object obj;
                parameterName = CodeAncestoryNames[i];
                if (values.TryGetValue(parameterName, out obj))
                {
                    code = obj as string;
                    if (!string.Equals(code, parent.CategoryCode, StringComparison.OrdinalIgnoreCase))
                    {
                        return null;

                    }
                }
                else
                {
                    break;
                }
                parent = cat.ParentCategory;
            }

            return cat;


        }
    }

    public class ProductAttributeRouteConstraint : ConstraintBase
    {
        readonly Func<Task<ServiceClientResponse<List<AttributeVocabularyValue>>>> dataFunc;
        private string _localeCode;
        IDictionary<string, AttributeVocabularyValue> _values { get; set; }

        public ProductAttributeRouteConstraint(IAttributeWebApiClient attributeClient, IApiContext context, string attributeCode)
        {
            if (attributeCode.IsNullOrEmpty()) throw new ArgumentException("attributeCode");

            dataFunc = () => attributeClient.CloneWithoutUserClaims().GetAttributeVocabularyValues(attributeCode);
            _localeCode = context.LocaleCode;
        }

        public override async Task<bool> Initialize()
        {
            var res = await dataFunc().ConfigureAwait(false);
            if (res.HasException)
            {
                throw res.ReadException();
            }
            var val = res.ReadAsSync();
            var dict = new Dictionary<string, AttributeVocabularyValue>(StringComparer.OrdinalIgnoreCase);
            foreach (var entry in val)
            {
                dict[entry.Content.StringValue] = entry;
                dict[entry.Value.ToString()] = entry;
            }

            _values = dict;
            return true;
        }

        public override bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            AttributeVocabularyValue attr;
            object routeValue;
            if (!values.TryGetValue(parameterName, out routeValue))
            {
                return false;
            }

            var curRouteValue = routeValue.ToString();
            if (!_values.TryGetValue(curRouteValue, out attr))
            {
                return false;
            }

            //TODO: put the right locale in here?
            values[parameterName] = GetAttributeValue(attr, "en-US");
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
        readonly Func<JObject, string> _fieldGetter;
        IList<string> _values;

        public MzdbRouteConstraint(IEntityListsWebApiClient mzdbClient, string listId, string fieldId)
        {
            if (listId.IsNullOrEmpty()) throw new ArgumentException("listId");
            if (fieldId.IsNullOrEmpty()) throw new ArgumentException("fieldId");

            _getDocsFunc = async (start, size) => await mzdbClient.CloneWithoutUserClaims().GetEntities(listId, startIndex: start, pageSize: size).ConfigureAwait(false);
            _fieldGetter = o => o.Value<string>(fieldId);
        }

        public override async Task<bool> Initialize()
        {
            var mzdbDocResponse = await _getDocsFunc(0, 50).ConfigureAwait(false);
            if (mzdbDocResponse.HasException) throw mzdbDocResponse.ReadException();

            var mzdbDocs = mzdbDocResponse.ReadAsSync();
            var otherItems = await Unroll<JObject>(async (start, size) => (await _getDocsFunc(start, size).ConfigureAwait(false)).ReadAsSync(), mzdbDocs.TotalCount, 50);

            _values = mzdbDocs.Items.Concat(otherItems).Select(_fieldGetter).ToList();
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
