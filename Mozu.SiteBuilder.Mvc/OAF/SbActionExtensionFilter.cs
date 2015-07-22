using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using Autofac;
using Microsoft.ClearScript;
using Mozu.Core.Actions;
using Mozu.Core.Actions.Contracts;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.Mvc.OAF
{
    public class SbActionExtensionFilterAttribute : ActionExtensionFilterAttribute
    {
        public SbActionExtensionFilterAttribute(string actionId, ActionExtensionExecutionTypes executionType, Type actionFilterType = null, Type resourceProviderType = null):
            base(actionId, executionType,typeof(ISbActionExtensionFilter), resourceProviderType)
        {
            this.FunctionActionFilterType = typeof(ISbActionExtensionFilter);
        }
        public SbActionExtensionFilterAttribute()
        {
            this.FunctionActionFilterType = typeof(ISbActionExtensionFilter);
        }
    }
    public interface ISbActionExtensionFilter: IActionExtensionFilter
    { }

    public class SbActionExtensionFilter : ApiActionExtensionFilter, ISbActionExtensionFilter
    {
        protected override ApiActionExtensionFilterContext CreateFunctionContext(HttpActionContext actionContext)
        {
            AddToActionContext<SiteContext>(actionContext.Request, "siteContext");
            AddToActionContext<PageContext>(actionContext.Request, "pageContext");
            AddToActionContext<NavigationContext>(actionContext.Request,"navigation");
            AddToActionContext<UrlHelper>(actionContext.Request, "urlHelper");

             
            var catTreeProvider = actionContext.Request.Resolve<ICategoryTreeProvider>();

            if ( catTreeProvider.HasCompleted)
            {
                AddToActionContext<ICategoryTree>(actionContext.Request, "categoryHelper", catTreeProvider.GetAllCategories().Result);
            }else
            {
                AddToActionContext<ICategoryTree>(actionContext.Request, "categoryHelper", new CategoryHelper(catTreeProvider));
            }
            


            return base.CreateFunctionContext(actionContext);
        }

        

        public static void AddToActionContext<T>(HttpRequestMessage httpRequestMessage, string name , T obj = null) where T : class
        {
            obj = obj ?? httpRequestMessage.Resolve<T>();
            
            
            IPropertyBag bag = null;
            object tmp;
            if (httpRequestMessage.Properties.TryGetValue(Mozu.Core.Actions.Contracts.ApiActionExtensionFilterContext.ItemsKey, out tmp))
            {
                bag = (IPropertyBag)tmp;
            }
            else
            {
                bag = new PropertyBag();
                httpRequestMessage.Properties[Mozu.Core.Actions.Contracts.ApiActionExtensionFilterContext.ItemsKey] = bag;
            }
            bag[name] = obj;

        }

        class CategoryHelper : ICategoryTree
        {
            private readonly ICategoryTreeProvider _provider;
            Lazy<Task<CategoryTree>> _catTask;
            public CategoryHelper(ICategoryTreeProvider provider)
            {
                _provider = provider;
                _catTask = new Lazy<Task<CategoryTree>>(() => _provider.GetAllCategories());
            }

            public string ETag
            {
                get
                {
                    return _catTask.Value.Result.ETag;
                }
                set {; }
            }
            public List<Category> RootCategories
            {
                get
                {
                    return _catTask.Value.Result.RootCategories;
                }
            }
            public List<Category> AllCategories
            {
                get
                {
                    return _catTask.Value.Result.AllCategories;
                }
                set { }
            }

            [Microsoft.ClearScript.ScriptMember("findById")]
            public Category FindById(int? categoryId)
            {
                return _catTask.Value.Result.FindById(categoryId);
            }
            [Microsoft.ClearScript.ScriptMember("findByCode")]
            public Category FindByCode(string categoryCode)
            {
                return _catTask.Value.Result.FindByCode(categoryCode);
            }
            [Microsoft.ClearScript.ScriptMember("findBySlug")]
            public IEnumerable<Category> FindBySlug(string categorySlug)
            {
                return _catTask.Value.Result.FindBySlug(categorySlug);
            }
        }
    }
}
