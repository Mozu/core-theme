using System;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using Autofac;
using Mozu.AdminUser.Contracts;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;


namespace Mozu.SiteBuilder.UX.Admin.Filters
{
    public class SiteBuilderAdminAuthorizeAttribute : AuthorizeAttribute
    {
        private SiteBuilderAuthorizeAttribute _inner;

        protected override bool IsAuthorized(HttpActionContext actionContext)
        {
            _inner = new SiteBuilderAuthorizeAttribute(actionContext.Request.LifetimeScope());
            return _inner.InternalIsAuthorized();
        }
    }


    public class SiteBuilderAuthorizeAttribute
    {
        private static string _environment;
        private readonly ILifetimeScope lifetimeScope;
        private IPublicAdminAuthTicketWebApiClient _adminUserWebApiClient;
        private ISettings _settings;


        private IAuthTicketWebApiClient _ticketAPi;

        public SiteBuilderAuthorizeAttribute(ILifetimeScope lifetimeScope)
        {
            // TODO: Complete member initialization
            this.lifetimeScope = lifetimeScope;
        }

        public IPublicAdminAuthTicketWebApiClient AdminUserWebApiClient
        {
            get
            {
                if (_adminUserWebApiClient == null)
                {
                    _adminUserWebApiClient = lifetimeScope.Resolve<IPublicAdminAuthTicketWebApiClient>();
                }
                return _adminUserWebApiClient;
            }
            set { _adminUserWebApiClient = value; }
        }

        public short[] RequiredBehaviors { get; set; }

        public IAuthTicketWebApiClient TicketAPI
        {
            get
            {
                if (_ticketAPi == null)
                {
                    _ticketAPi = lifetimeScope.Resolve<IAuthTicketWebApiClient>();
                }
                return _ticketAPi;
            }
            set { _ticketAPi = value; }
        }

        public ISettings Settings
        {
            get
            {
                if (_settings == null)
                {
                    _settings = lifetimeScope.Resolve<ISettings>();
                }
                return _settings;
            }
            set { _settings = value; }
        }

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
            get { return lifetimeScope.Resolve<ISiteBuilderApiContext>(); }
        }

        public IAuthenticationHelper AuthenticationHelper
        {
            get
            {
                return lifetimeScope.Resolve<IAuthenticationHelper>();
            }
        }


        public bool IsAuthorized(HttpContextBase httpContext)
        {
            bool isAuthorized = InternalIsAuthorized();
            bool isTesting = httpContext.Request["testHarnessMode"] == "true";
            if (!isAuthorized && isTesting)
            {
                throw new NotImplementedException();
            }
            return isAuthorized;
        }

        public bool InternalIsAuthorized()
        {
            ISiteBuilderApiContext context = ApiContext;
            IAuthenticationHelper authHelper = AuthenticationHelper;

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


            if (!String.Equals(context.UserClaims.Environment, Environment, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }


            //if refresh token is missing it means they've logged out of the log out app.
            string refreshToken = authHelper.GetAdminRefreshToken();
            if (string.IsNullOrEmpty(refreshToken))
            {
                return false;
            }
            if (context.UserClaims.Expiration < DateTime.UtcNow.AddMinutes(5))
            {
                //var ticket = authHelper.GetAuthTicket();
                //if (ticket != null && ticket.RefreshTokenExpiration > DateTime.UtcNow)
                {
                    ServiceClientResponse<TenantAdminUserAuthTicket> res = AdminUserWebApiClient.RefreshAuthTicket(
                        existingAuthTicket: new TenantAdminUserAuthTicket
                                                {
                                                    RefreshToken = refreshToken
                                                },
                        tenantId: context.TenantId).Result;

                    if (res.ResponseMessage.IsSuccessStatusCode)
                    {
                        TenantAdminUserAuthTicket ticket = res.ReadAsSync();

                        authHelper.SaveAdminAccessToken(ticket.AccessToken, false);

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

       
    }
}