// -----------------------------------------------------------------------
// <copyright file="SbAuthenticationModule.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Web.Mvc;
using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Settings;

namespace Mozu.SiteBuilder.Mvc.Security
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Web;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class SbAuthenticationModule : IHttpModule
    {
        public void Dispose()
        {
        }

        public void Init(HttpApplication context )
        {
            context.AuthenticateRequest += new EventHandler(this.OnAuthenticate);
        }

        private static object _isAdmin = null;
        public static bool IsAdmin
        {
            get
            {
                if (_isAdmin == null)
                {
                    _isAdmin = string.Equals(HttpRuntime.AppDomainAppVirtualPath, "/admin", StringComparison.OrdinalIgnoreCase);
                }
                return (bool) _isAdmin;
            }
            set { _isAdmin = value; }
        }

        


        void OnAuthenticate(object sender, EventArgs e)
        {
           

             


            
           
            var apiContext = DependencyResolver.Current.GetService<ISiteBuilderApiContext>();
            var authHelper = DependencyResolver.Current.GetService<IAuthenticationHelper >();
            var settnigs = DependencyResolver.Current.GetService<ISettings>();

          

            if (apiContext.UserClaims != null)
            {
                 
                string tmp;
                int tenantId;
                int siteId;
                if (apiContext.UserClaims.Bag.TryGetValue("TenantId", out tmp) && int.TryParse(  tmp, out tenantId  ))
                {
                    tmp = null;
                    if (tenantId != apiContext.TenantId)
                    {
                        apiContext.SetUser(null);
                    }
                    else if (apiContext.SiteId.HasValue && apiContext.UserClaims.Bag.TryGetValue("SiteId", out tmp) && int.TryParse( tmp, out siteId ) && apiContext.SiteId.Value != siteId  )
                    {
                        apiContext.SetUser(null);
                    }
                }
            }


            if (apiContext.UserClaims == null)
            {
                
                var user = LightweightUserClaims.CreateForAnonymousShopper(apiContext.TenantId, apiContext.SiteId ?? -1);
                apiContext.SetUser(user);
                authHelper.SaveAccessToken(  user.ToAccessToken());
            }

          
        }
    }
}
