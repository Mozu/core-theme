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
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;

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

            return base.CreateFunctionContext(actionContext);
        }
        public static void AddToActionContext<T>(HttpRequestMessage httpRequestMessage, string name )
        {
           var obj = httpRequestMessage.Resolve<T>();
            
            
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
    }
}
