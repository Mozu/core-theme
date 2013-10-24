using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Web;
using Autofac;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Cms;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Themes.Exceptions;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.ModelMetaData;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteSettings.General.Contracts.Clients;
using Newtonsoft.Json.Linq;
using APIConstants = Mozu.Core.Api.Contracts.Constants;

namespace Mozu.SiteBuilder.Mvc
{
    /// <summary>
    ///     TODO: Update summary.
    /// </summary>
    [DataContract]
    public class SiteBuilderContext :ISiteBuilderContext
    {
        
        internal const string COOKIENAME = "SBCONTEXT";

       
        public static void Save(int? site, int? sitegroup, int tenant, bool isEditMode, ICookieProvider cookieProvider)
        {
            var cookie = new HttpCookie("") {Expires = DateTime.MaxValue};

            cookie["site"] = site.HasValue ? site.ToString() : null;
            cookie["sitegroup"] = sitegroup.HasValue ? sitegroup.ToString() : null;
            cookie["tenant"] = tenant.ToString();
            cookie["editmode"] = isEditMode.ToString();

            cookieProvider.SaveResponseCookie(COOKIENAME, cookie);
        }
    }
}