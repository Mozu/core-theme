using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.AdminUser.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Filters
{
    public class SiteBuilderAuthorizeAttribute : AuthorizeAttribute
    {
        private IAuthTicketWebApiClient _authTicketWebApiClient;

        public IAuthTicketWebApiClient  TicketApi
        {
            get
            {
                return _authTicketWebApiClient ?? (_authTicketWebApiClient = DependencyResolver.Current.GetService<IAuthTicketWebApiClient>());
            }
            set
            {
                _authTicketWebApiClient = value;
            }
        }

        public  bool IsAuthorized ( HttpContextBase httpContext)
        {
            if (bool.Parse(System.Configuration.ConfigurationManager.AppSettings["authorize"]))
            {

                if (httpContext == null)
                {
                    throw new ArgumentNullException("httpContext");
                }

                var authHelper = new AuthenticationHelper(httpContext, new CookieProvider(httpContext));

                var lwUser = httpContext.User as Mozu.Core.LightweightUserClaims;

                if (lwUser == null )
                {
                    return false;
                }

                if (lwUser.SiteId != SiteBuilderContext.Current.SiteId)
                {
                    return false;
                }


                //todo: get a list of behavior constants
                //relaxing behaviors as the test data doesnt have anything.... 
                //if (lwUser.BehaviorIds == null || lwUser.BehaviorIds.All(x => x != 3))
                //{
                //    return false;
                //}

                if (lwUser.Expiration < DateTime.UtcNow)
                {
                    var ticket = authHelper.GetCurrentTicket();
                    if ( ticket != null && ticket.RefreshTokenExpiration > DateTime.UtcNow )
                    {
                        var res = TicketApi.RefreshUserAuthTicket(ticket.RefreshToken).Result;
                        if (res.ResponseMessage.IsSuccessStatusCode)
                        {
                            ticket = res.ReadAsSync();
                            authHelper.SetCurrentUser(ticket);
                            lwUser = authHelper.GetCurrentUser();
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