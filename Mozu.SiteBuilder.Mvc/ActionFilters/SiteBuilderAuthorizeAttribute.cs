//using System;
//using System.Linq;
//using System.Web;
//using System.Web.Http;
//using System.Web.Mvc;
//using Mozu.Core;
//using Mozu.User.Contracts.Clients;
//using Mozu.SiteBuilder.Mvc.Security;

//namespace Mozu.SiteBuilder.Mvc.ActionFilters
//{


   

//    public class SiteBuilderAuthorizeAttribute2 : AuthorizeAttribute
//    {
//        private IAuthTicketWebApiClient _ticketAPi;
//        public short[] RequiredBehaviors { get; set; }

//        public Mozu.User.Contracts.Clients.IAuthTicketWebApiClient TicketAPI
//        {
//            get
//            {
//                if (_ticketAPi == null)
//                {
//                    return (IAuthTicketWebApiClient)System.Web.Mvc.DependencyResolver.Current.GetService(typeof(IAuthTicketWebApiClient));
//                }
//                return _ticketAPi;
//            }
//            set { _ticketAPi = value; }

//        }

//        public IApiContext ApiContext
//        {
//            get
//            {
//                return (IApiContext)System.Web.Mvc.DependencyResolver.Current.GetService(typeof(IApiContext));

//            }


//        }

//        public IAuthenticationHelper AuthenticationHelper
//        {
//            get
//            {
//                return (IAuthenticationHelper)System.Web.Mvc.DependencyResolver.Current.GetService(typeof(IAuthenticationHelper));

//            }


//        }


//        public bool IsAuthorized(HttpContextBase httpContext)
//        {
//            if (bool.Parse(System.Configuration.ConfigurationManager.AppSettings["authorize"]))
//            {

//                if (httpContext == null)
//                {
//                    throw new ArgumentNullException("httpContext");
//                }

//                var context = ApiContext;
//                var authHelper = AuthenticationHelper;

//                // var authHelper = new AuthenticationHelper(httpContext, provider: new CookieProvider(httpContext, Core.Settings.MozuConfigurationManager.Settings), cookieName:null);

//                // var lwUser = httpContext.User as Mozu.Core.LightweightUserClaims;

//                if (context.UserClaims == null)
//                {
//                    return false;
//                }
//                int siteId;
//                string siteStr;
//                context.UserClaims.Bag.TryGetValue("SiteId", out siteStr);
//                int.TryParse(siteStr, out siteId);


//                if (siteId != context.SiteId)
//                {
//                    return false;
//                }
//                if (context.UserClaims.ScopeType != UserScopeType.Tenant.ToString())
//                {
//                    return false;
//                }
//                //if (lwUser != SiteBuilderContext.Current.SiteId)
//                //{
//                //    return false;
//                //}

//                //if (RequiredBehaviors != null && RequiredBehaviors.Length > 0 &&
//                //    (context.UserClaims.BehaviorIds == null || !(RequiredBehaviors.All(x => lwUser.BehaviorIds.Contains(x)))))
//                //{
//                //    return false;
//                //}


//                if (context.UserClaims.Expiration < DateTime.UtcNow.AddMinutes(5))
//                {
//                    var refreshToken = authHelper.GetRefreshToken();
//                    //if ( ticket != null && ticket.RefreshTokenExpiration > DateTime.UtcNow )
//                    {
//                        var res = TicketAPI.RefreshUserAuthTicket(refreshToken).Result;
//                        if (res.ResponseMessage.IsSuccessStatusCode)
//                        {
//                            var ticket = res.ReadAsSync();
//                            authHelper.SaveAccessToken(ticket.AccessToken);

//                        }
//                        else
//                        {
//                            return false;
//                        }
//                    }
//                    //else
//                    //{
//                    //    return false;
//                    //}
//                }


//            }

//            return true;
//        }
//        protected override bool AuthorizeCore(HttpContextBase httpContext)
//        {
//            return IsAuthorized(httpContext);


//        }
//    }
//}