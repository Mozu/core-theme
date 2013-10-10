using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Autofac;
using Mozu.Core.Api.Client;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteSettings.General.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Filters
{
    public class InitSettingsAttribute: Attribute , System.Web.Http.Filters.IActionFilter
    {
        public System.Threading.Tasks.Task<System.Net.Http.HttpResponseMessage> ExecuteActionFilterAsync(System.Web.Http.Controllers.HttpActionContext actionContext, System.Threading.CancellationToken cancellationToken, Func<System.Threading.Tasks.Task<System.Net.Http.HttpResponseMessage>> continuation)
        {

            var controller = (BaseApiController)actionContext.ControllerContext.Controller;
           
      
            
            if (controller != null || controller.SiteContext.PageContext != null)
            {
                var settings = actionContext.Request.Resolve<ISettingsRepository>();
                return settings.GetGeneralSettings().ContinueWith(x => continuation().Result);

            }
            else
            {
                return continuation();
            }

        }

        public bool AllowMultiple
        {
            get { return false; }
        }
    }
}