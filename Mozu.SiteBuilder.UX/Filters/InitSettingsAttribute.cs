using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using Mozu.Core.Api.Client;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteSettings.General.Contracts.Clients;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core.Configuration;

namespace Mozu.SiteBuilder.UX.Filters
{
    public class InitSettingsAttribute: Attribute , IAsyncActionFilter
    {
        public Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var controller = (BaseApiController)context.Controller;

            if (controller?.PageContext == null) return next();

            var siteContext = context.HttpContext.RequestServices.Resolve<SiteContext>();
            return siteContext.Init().ContinueWith(x => next()).Unwrap();
        }
    }
}