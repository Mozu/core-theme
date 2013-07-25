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
            var isAuthorized = InternalIsAuthorized(httpContext);
            var isTesting = httpContext.Request["testHarnessMode"] == "true";
            if (!isAuthorized && isTesting )
            {

                throw new NotImplementedException();

      
            }
            return isAuthorized;
        }

        public bool InternalIsAuthorized(HttpContextBase httpContext)
        {
            if (bool.Parse(System.Configuration.ConfigurationManager.AppSettings["authorize"]))
            {

                if (httpContext == null)
                {
                    throw new ArgumentNullException("httpContext");
                }

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

            

                //if (lwUser != SiteBuilderContext.Current.SiteId)
                //{
                //    return false;
                //}

                //if (RequiredBehaviors != null && RequiredBehaviors.Length > 0 &&
                //    (context.UserClaims.BehaviorIds == null || !(RequiredBehaviors.All(x => lwUser.BehaviorIds.Contains(x)))))
                //{
                //    return false;
                //}


                if (context.UserClaims.Expiration < DateTime.UtcNow.AddMinutes(-1))
                {
                    var ticket = authHelper.GetAuthTicket();
                    if (ticket != null && ticket.RefreshTokenExpiration > DateTime.UtcNow)
                    {
                        var res = AdminUserWebApiClient.RefreshAuthTicket(
                             existingAuthTicket: new TenantAdminUserAuthTicket()
                             {
                                 RefreshToken = ticket.RefreshToken
                             },
                             tenantId: context.TenantId ).Result;
                       
                        if (res.ResponseMessage.IsSuccessStatusCode)
                        {
                            var ticket2 = res.ReadAsSync();
                              ticket = new UserAuthTicket()
                                         {

                                             AccessToken = ticket2.AccessToken,
                                             AccessTokenExpiration = ticket2.AccessTokenExpiration,
                                             User = ticket2.User,
                                             GrantedBehaviors = ticket2.GrantedBehaviors ,
                                             RefreshTokenExpiration = ticket2.RefreshTokenExpiration,
                                             RefreshToken = ticket2.RefreshToken
                                         };
                            authHelper.SaveAuthTicket(ticket);
                            
                            context.SetUser( LightweightUserClaims.Parse( ticket.AccessToken ));

                        }
                        else
                        {
                            return false;
                        }
                    }
                    else
                    {
                        return false;
                    }
                }


            }

            return true;
        }
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            return IsAuthorized(httpContext);


        }
    }
}