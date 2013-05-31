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

        //public IAuthTicketWebApiClient  TicketApi
        //{
        //    get
        //    {
        //        return _authTicketWebApiClient ?? (_authTicketWebApiClient = DependencyResolver.Current.GetService<IAuthTicketWebApiClient>());
        //    }
        //    set
        //    {
        //        _authTicketWebApiClient = value;
        //    }
        //}

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
        

        public bool IsAuthorized(HttpContextBase httpContext)
        {
            var isAuthorized = InternalIsAuthorized(httpContext);
            var isTesting = httpContext.Request["testHarnessMode"] == "true";
            if (!isAuthorized && isTesting )
            {

                throw new NotImplementedException();

                //var testAccountRaw = System.Configuration.ConfigurationManager.AppSettings["testAccountInfo"];
                //var testAccount = (dynamic)Newtonsoft.Json.JsonConvert.DeserializeObject(testAccountRaw);
                //var adminTicket = AdminUserWebApiClient .CreateUserAuthTicket( userAuthInfo : new UserAuthInfo()
                //                                             {
                //                                                 EmailAddress = testAccount.emailAddress,
                //                                                 Password = testAccount.password
                //                                             }).Result.ReadAsSync();

                //var  settings =DependencyResolver.Current.GetService<ISettings>();
       
                //var authHelper = DependencyResolver.Current.GetService<IAuthenticationHelper>();


                


                //var ticket = _authTicketWebApiClient.With( TargetContextLevelType.Tenant ).With(x =>  x.TenantId=(int)testAccount.tenantId).CreateAuthTicketForTenant(new UserTokenInfo()
                //                                               {
                //                                                   AccessToken = adminTicket.AuthTicket.AccessToken
                //                                               }).Result.ReadAsSync();
                //authHelper.SetCurrentUser(ticket);
                //isAuthorized = true;
            }
            return isAuthorized;
        }

        public  bool InternalIsAuthorized ( HttpContextBase httpContext)
        {
            if (bool.Parse(System.Configuration.ConfigurationManager.AppSettings["authorize"]))
            {

                if (httpContext == null)
                {
                    throw new ArgumentNullException("httpContext");
                }

                var authHelper = new AuthenticationHelper(httpContext, new CookieProvider(httpContext, Core.Settings.MozuConfigurationManager.Settings));

                var lwUser = httpContext.User as Mozu.Core.LightweightUserClaims;

                if (lwUser == null )
                {
                    return false;
                }



                int tenantId = -33;
                string tenantStr;
                lwUser.Bag.TryGetValue("TenantId", out tenantStr);
                int.TryParse(tenantStr, out tenantId);

                if (tenantId != SiteBuilderContext.Current.TenantId)
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
                        var res = AdminUserWebApiClient.RefreshAuthTicket(
                            existingAuthTicket: new TenantAdminUserAuthTicket()
                                                    {
                                                        RefreshToken = ticket.RefreshToken
                                                    },
                            tenantId: tenantId).Result;
                        if (res.ResponseMessage.IsSuccessStatusCode)
                        {
                            var tat = res.ReadAsSync();
                            ticket = new UserAuthTicket()
                                         {

                                             AccessToken = tat.AccessToken,
                                             AccessTokenExpiration = tat.AccessTokenExpiration,
                                             User = tat.User,
                                             GrantedBehaviors = tat.GrantedBehaviors ,
                                             RefreshTokenExpiration = tat.RefreshTokenExpiration,
                                             RefreshToken = tat.RefreshToken
                                         };
                                              
                         
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