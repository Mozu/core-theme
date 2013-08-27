using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.AdminUser.Contracts;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.User.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Filters
{
    public class SiteBuilderWebApiAuthorizeAttribute : System.Web.Http.AuthorizeAttribute
    {
        private SiteBuilderAuthorizeAttribute _inner;

        public SiteBuilderWebApiAuthorizeAttribute()
        {
            _inner = new SiteBuilderAuthorizeAttribute();
        }

        protected override bool IsAuthorized(System.Web.Http.Controllers.HttpActionContext actionContext)
        {

            return _inner.InternalIsAuthorized();
      
        }

    
    }


public class SiteBuilderAuthorizeAttribute : AuthorizeAttribute
    {
        private IAuthTicketWebApiClient _authTicketWebApiClient;
        private IPublicAdminAuthTicketWebApiClient _adminUserWebApiClient;

 

        public IPublicAdminAuthTicketWebApiClient AdminUserWebApiClient
        {
            get
            {
                return _adminUserWebApiClient ?? (_adminUserWebApiClient = DependencyResolver.Current.GetService<IPublicAdminAuthTicketWebApiClient>());
            }
            set
            {
                _adminUserWebApiClient = value;
            }
        }


        private IAuthTicketWebApiClient _ticketAPi;
        public short[] RequiredBehaviors { get; set; }

        public Mozu.User.Contracts.Clients.IAuthTicketWebApiClient TicketAPI
        {
            get
            {
                if (_ticketAPi == null)
                {
                    return (IAuthTicketWebApiClient)System.Web.Mvc.DependencyResolver.Current.GetService(typeof(IAuthTicketWebApiClient));
                }
                return _ticketAPi;
            }
            set { _ticketAPi = value; }

        }

    private ISettings _settings;
        
        public ISettings Settings
        {
            get
            {
                if (_settings == null)
                {
                    return (ISettings)System.Web.Mvc.DependencyResolver.Current.GetService(typeof(ISettings));
                }
                return _settings;
            }
            set { _settings = value; }

        }

    private static string _environment;
    public string Environment
    {
        get
        {
            if (_environment == null)
            {
                _environment = Settings.AppSettings("Environment");
            }
            return _environment;
        }
        set { _environment = value; }

        
    }

        public ISiteBuilderApiContext ApiContext
        {
            get
            {
                return (ISiteBuilderApiContext)System.Web.Mvc.DependencyResolver.Current.GetService(typeof(ISiteBuilderApiContext));

            }


        }

        public IAuthenticationHelper AuthenticationHelper
        {
            get
            {
                return (IAuthenticationHelper)System.Web.Mvc.DependencyResolver.Current.GetService(typeof(IAuthenticationHelper));

            }


        }



        public bool IsAuthorized(HttpContextBase httpContext)
        {
            var isAuthorized = InternalIsAuthorized();
            var isTesting = httpContext.Request["testHarnessMode"] == "true";
            if (!isAuthorized && isTesting )
            {

                throw new NotImplementedException();

      
            }
            return isAuthorized;
        }

    public bool InternalIsAuthorized()
    {

        var context = ApiContext;
        var authHelper = AuthenticationHelper;

        // var authHelper = new AuthenticationHelper(httpContext, provider: new CookieProvider(httpContext, Core.Settings.MozuConfigurationManager.Settings), cookieName:null);

        // var lwUser = httpContext.User as Mozu.Core.LightweightUserClaims;

        if (context.UserClaims == null)
        {
            return false;
        }




        if (context.UserClaims.ScopeType != UserScopeType.Tenant.ToString())
        {
            return false;
        }


        if (!String.Equals(context.UserClaims.Environment, Environment, StringComparison.OrdinalIgnoreCase ))
        {
            return false;
        }


        //if refresh token is missing it means they've logged out of the log out app.
        var refreshToken = authHelper.GetRefreshToken();
        if (string.IsNullOrEmpty(refreshToken))
        {
            return false;
        }
        if (context.UserClaims.Expiration < DateTime.UtcNow.AddMinutes(-1))
        {
            //var ticket = authHelper.GetAuthTicket();
            //if (ticket != null && ticket.RefreshTokenExpiration > DateTime.UtcNow)
            {
                
                
                var res = AdminUserWebApiClient.RefreshAuthTicket(
                    existingAuthTicket: new TenantAdminUserAuthTicket()
                                            {
                                                RefreshToken = refreshToken
                                            },
                    tenantId: context.TenantId).Result;

                if (res.ResponseMessage.IsSuccessStatusCode)
                {
                    var ticket = res.ReadAsSync();
                    
                    authHelper.SaveAccessToken( ticket.AccessToken );

                    context.SetUser(LightweightUserClaims.Parse(ticket.AccessToken));

                }
                else
                {
                    return false;
                }
            }
            //else
            //{
            //    return false;
            //}
        }




        return true;
    }

    protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            return IsAuthorized(httpContext);


        }
    }
}
