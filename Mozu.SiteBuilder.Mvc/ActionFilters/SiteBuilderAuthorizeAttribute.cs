using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.User.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Security;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class SiteBuilderAuthorizeAttribute : AuthorizeAttribute
    {
        private IAuthTicketWebApiClient _ticketAPi;
        public short[] RequiredBehaviors { get; set; }

        public Mozu.User.Contracts.Clients.IAuthTicketWebApiClient  TicketAPI
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
        public  bool IsAuthorized ( HttpContextBase httpContext)
        {
            if (bool.Parse(System.Configuration.ConfigurationManager.AppSettings["authorize"]))
            {

                if (httpContext == null)
                {
                    throw new ArgumentNullException("httpContext");
                }

                var authHelper = new AuthenticationHelper(new CookieProvider(httpContext));

                var lwUser = httpContext.User as Mozu.Core.LightweightUserClaims;

                if (lwUser == null)
                {
                    return false;
                }

                if (lwUser.SiteId != SiteBuilderContext.Current.SiteId)
                {
                    return false;
                }

                if (RequiredBehaviors != null && RequiredBehaviors.Length > 0 &&
                    (lwUser.BehaviorIds == null || !(RequiredBehaviors.All(x => lwUser.BehaviorIds.Contains(x)))))
                {
                    return false;
                }


                if (lwUser.Expiration < DateTime.UtcNow.AddMinutes(-1) )
                {
                    var ticket = authHelper.GetCurrentTicket();
                    if ( ticket != null && ticket.RefreshTokenExpiration > DateTime.UtcNow )
                    {
                        var res = TicketAPI.RefreshUserAuthTicket(ticket.RefreshToken).Result;
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