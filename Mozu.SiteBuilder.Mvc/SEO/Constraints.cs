using Mozu.Core.Api.Contracts;
using Mozu.MZDB.Contracts.Clients;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
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
                    return AttributeConstraint(_attributeClient, _context, validator);
                case Validator.TypeConst.categoryCode:
                    return CategoryCodeContraint(validator);
                case Validator.TypeConst.categorySlug:
                    return CategorySlugContraint(validator);
                case Validator.TypeConst.categoryId:
                    return CategorySlugContraint(validator);
                case Validator.TypeConst.list:
                    return ListMapping(validator);
                case Validator.TypeConst.mzdb:
                    return MZDBMapping(_entityListClient, validator);
            }
            throw new ArgumentException(string.Format("mapping type {0} not known", validator.type));
        }

        static ICustomRouteConstraint AttributeConstraint(IAttributeWebApiClient client, IApiContext context, Validator validator)
        {
            return new ProductAttributeRouteConstraint(client, context, validator.attributeCode);
        }

        static ICustomRouteConstraint CategoryCodeContraint(Validator validator)
        {
           return new CategoryCodeContraint(validator);
        }
        static ICustomRouteConstraint CategorySlugContraint(Validator validator)
        {
            return new CategorySlugContraint(validator);
        }
        static ICustomRouteConstraint CategoryIdContraint(Validator validator)
        {
            return new CategoryIdContraint(validator);
        }

        static ICustomRouteConstraint ListMapping(Validator validator)
        {
            return new StringListRouteConstraint(validator.values);
        }

        static ICustomRouteConstraint MZDBMapping(IEntityListsWebApiClient client, Validator validator)
        {
            return new MzdbRouteConstraint(client, validator.listId, validator.fieldId);
        }
    }

    public abstract class ConstraintBase : ICustomRouteConstraint
    {
        public abstract Task<bool> Initialize();
        public abstract bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection);

        public bool Match(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            return DoMatch(request, route, parameterName, values, routeDirection);
        }
    }
    public class CategorySlugContraint : ConstraintBase
    {
        private Validator validator;

        public CategorySlugContraint(Validator validator)
        {
            // TODO: Complete member initialization
            this.validator = validator;
        }

        public override Task<bool> Initialize()
        {
            return Task.FromResult(true);
        }



        public override bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            object tmp;
            string slug = null;
            if (!values.TryGetValue(parameterName, out tmp))
            {
                return false;
            }
            slug = Convert.ToString(tmp);
            if (string.IsNullOrWhiteSpace(slug))
            {
                return false;
            }
            var catTreeProvider = request.Resolve<ICategoryTreeProvider>();
            var catTree = catTreeProvider.GetAllCategories().Result;

            return catTree.Items.Any (x=>x.Content != null &&  string.Equals(slug, x.Content.Slug , StringComparison.OrdinalIgnoreCase));
        }
    }
    public class CategoryIdContraint : ConstraintBase
    {
        private Validator validator;

        public CategoryIdContraint(Validator validator)
        {
            // TODO: Complete member initialization
            this.validator = validator;
        }

        public override Task<bool> Initialize()
        {
            return Task.FromResult(true);
        }



        public override bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            object tmp;
            int id;
            if (!values.TryGetValue(parameterName, out tmp))
            {
                return false;
            }
            tmp = Convert.ToString(tmp);
            if ( !int.TryParse((string)tmp, out id))
            {
                return false;
            }
           
            var catTreeProvider = request.Resolve<ICategoryTreeProvider>();
            var catTree = catTreeProvider.GetAllCategories().Result;

            return catTree.Items.Any(x => x.Id == id);
        }
    }
    public class CategoryCodeContraint : ConstraintBase
    {
        private Validator validator;
       
        public CategoryCodeContraint(Validator validator)
        {
            // TODO: Complete member initialization
            this.validator = validator;
        }

        public override Task<bool> Initialize()
        {
            return Task.FromResult(true); 
        }

        

        public override bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            object tmp;
            string code = null;
            if ( !values.TryGetValue(parameterName,out tmp) )
            {
                return false;
            }
            code = Convert.ToString(tmp);
            if (string.IsNullOrWhiteSpace(code))
            {
                return false;
            }
            var catTreeProvider = request.Resolve<ICategoryTreeProvider>();
            var catTree = catTreeProvider.GetAllCategories().Result;

            return  catTree.Items.Any(x => string.Equals(code, x.CategoryCode, StringComparison.OrdinalIgnoreCase));
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

            _getDocsFunc = async (start, size) => await mzdbClient.CloneWithoutUserClaims().GetEntities(listId, startIndex: start, pageSize: size);
            _fieldGetter = o => o.Value<string>(fieldId);
        }

        public override async Task<bool> Initialize()
        {
            var mzdbDocResponse = await _getDocsFunc(0, 50).ConfigureAwait(false);
            if (mzdbDocResponse.HasException) throw mzdbDocResponse.ReadException();

            var mzdbDocs = mzdbDocResponse.ReadAsSync();
            var otherItems = await Unroll<JObject>(async (start, size) => (await _getDocsFunc(start, size)).ReadAsSync(), mzdbDocs.TotalCount, 50);

            _values = mzdbDocs.Items.Concat(otherItems).Select(_fieldGetter).ToList();
            return true;
        }

        private static async Task<IEnumerable<T>> Unroll<T>(Func<int, int, Task<PagedCollectionBase<T>>> getter, int totalCount, int pageSize)
        {
            var tasks = Enumerable.Range(0, totalCount / pageSize).Select(async i => await getter(i * pageSize, pageSize));
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
