using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Mozu.SiteBuilder.UX.Admin.Filters;


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public class AllowAnonymousAttribute : Attribute
    {
        
    }

    [AttributeUsage(AttributeTargets.Method)]
    public class ApiAuthorizeAttribute : Attribute
    {
        public string Roles { get; set; }
    }



}