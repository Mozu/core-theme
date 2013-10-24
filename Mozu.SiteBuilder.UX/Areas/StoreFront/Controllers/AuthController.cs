using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;

using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models;
using Mozu.User.Contracts;
using VMUser = Mozu.SiteBuilder.UX.Models.Customers.User;
using System.Net.Http;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
  
    public class AuthController : BaseApiController
    {
        private Mozu.User.Contracts.Clients.IUserWebApiClient _userWebApiClient;
        private Mozu.User.Contracts.Clients.IAuthTicketWebApiClient _authTicketWebApiClient;
        private readonly ICookieProvider _cookieProvider;
        private readonly ISiteBuilderApiContext _apiContext;
        private IAuthenticationHelper _authenticationHelper;

        public AuthController(IAuthenticationHelper authenticationHelper, Mozu.User.Contracts.Clients.IUserWebApiClient userWebApiClient, Mozu.User.Contracts.Clients.IAuthTicketWebApiClient authTicketWebApiClient, ICookieProvider cookieProvider, ISiteBuilderApiContext  apiContext)
        {
            _authenticationHelper = authenticationHelper;
            _userWebApiClient = userWebApiClient;
            _authTicketWebApiClient = authTicketWebApiClient;
            _cookieProvider = cookieProvider;
            _apiContext = apiContext;
        }
        //
        // GET: /StoreFront/Auth/

        protected void DoLogout() 
        {
            var user = LightweightUserClaims.CreateForAnonymousShopper(_apiContext.TenantId, _apiContext.SiteId.Value);
            _authenticationHelper.SaveAuthTicket(new UserAuthTicket()
                                                     {
                                                         AccessToken= user.ToAccessToken(),
                                                         User = new Mozu.Core.Api.Contracts.UserProfile() ,
                                                         RefreshToken = null
                                                     });
            _apiContext.SetUser(user);
        }

        protected async Task<ServiceClientResponse<UserLoginResult>> DoLogin(string email, string password)
        {
            var res = (await _userWebApiClient.CloneWithoutUserClaims().Login(new Mozu.Core.Api.Contracts.UserAuthInfo()
            {

                EmailAddress = email,
                Password = password

            }));

            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var user = _userWebApiClient.CloneWithoutUserClaims().GetUserByEmail(email).Result.ReadAsSync();
                //if (user.IsAdminUser)
                //{
                //    return Redirect("/admin");
                //}
                var ticket = res.ReadAsSync().AuthTicket;

                _authenticationHelper.SaveAuthTicket(ticket);

                _apiContext.SetUser(LightweightUserClaims.Parse(ticket.AccessToken));

            }
            return res;
        }

        private Uri MakeRedirectUri(string returnUrl = null)
        {
            if (string.IsNullOrEmpty(returnUrl))
            {
                returnUrl = Request.Headers.Referrer.ToString();
                if (string.IsNullOrEmpty(returnUrl))
                {
                    return new Uri("/", UriKind.Relative);
                }
                else
                {
                    return new Uri(returnUrl, UriKind.Absolute);
                }
            }
            else
            {
                return new Uri(returnUrl, UriKind.Relative);
            }
        }

        [System.Web.Http.HttpGet]
        public HttpResponseMessage LogOut(string returnUrl = null)
        {
            DoLogout();

            var redir = this.Request.CreateResponse(statusCode: System.Net.HttpStatusCode.Redirect);
            redir.Headers.Location = MakeRedirectUri(returnUrl);
            return redir;

        }
          [System.Web.Http.HttpGet]
        public Response<string> AjaxLogOut()
        {
            DoLogout();

           return    new Response<string>()
                  {
                      Success = true
                  };

        }
        [System.Web.Http.HttpGet]
        public ActionResult Login(string returnUrl = null)
        {
            return View("Login", new { ReturnUrl = returnUrl });
        }

        public class LoginDetails
        {
            public string email { get; set; }
            public string password { get; set; }
            public string returnUrl { get; set; }
        }

        [System.Web.Http.HttpPost]
        public async Task<HttpResponseMessage>   Login(LoginDetails details)
        {
            string email = details.email;
            string password = details.password;
            string returnUrl = details.returnUrl;

            var res = await DoLogin(email, password);

            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var redir = this.Request.CreateResponse(statusCode: System.Net.HttpStatusCode.Redirect);
                redir.Headers.Location = MakeRedirectUri(returnUrl);
                return redir;
                
            }
            else
            {

                return this.Request.CreateResponse(HttpStatusCode.OK, View("Login", new { email = email, Messages = new { Message = String.Format("Login as {0} failed. Please try again.", email) } }));
            }
        }
         [System.Web.Http.HttpPost]
        public async Task<object> AjaxLogin(LoginDetails details)
        {
            string email = details.email;
            string password = details.password;
            string returnUrl = details.returnUrl;
            var res = await DoLogin(email, password);
                    
            if (res.ResponseMessage.IsSuccessStatusCode) {
                    return  new
                    {
                        Message = String.Format("Logged in as {0}.", email)
                    };
                }
            else
            {
                return Request.CreateResponse(System.Net.HttpStatusCode.Unauthorized, new
                {
                    Message = String.Format("Login as {0} failed. Please try again.", email)
                });
            }
            
        }
          [System.Web.Http.HttpPost]
         public object  AjaxResetPassword(string email)
        {
            var res = _userWebApiClient.ResetPassword( new ResetPasswordInfo(){
                EmailAddress = email
            }).Result;
              if (res.ResponseMessage.IsSuccessStatusCode)
              {

                  return new Response<bool>()
                             {
                                 Data = true,
                                 Success = true
                             };
              }
              else
              {

                  var ex = res.ReadException();

                  var errorCollection = ex.Data["DataContract"] as ErrorCollection;

                  return new Response<string>()
                             {
                                 Message = "nope you stink",
                                 ServiceErrorCollection = errorCollection,
                                 Success = false

                             };
              }
        }
        //  [System.Web.Http.HttpPost]
        //public object  AjaxSignIn(string email, string password)
        //{
        //    var info = new Core.Api.Contracts.UserAuthInfo { EmailAddress = email, Password = password };

        //    var res = _authTicketWebApiClient.CloneWithoutUserClaims().CreateUserAuthTicket(info).Result;
        //    if (res.ResponseMessage.IsSuccessStatusCode)
        //    {

        //        var user = res.ReadAsSync();



        //        _authenticationHelper.SaveAuthTicket(user);
        //        _apiContext.SetUser(LightweightUserClaims.Parse(user.AccessToken));



        //        return new Response<VMUser>
        //                   {
        //                       Data = new VMUser
        //                                  {
        //                                      FirstName = user.User.FirstName,
        //                                      LastName = user.User.LastName,
        //                                      Email = user.User.EmailAddress,
        //                                      UserId = user.User.UserId,
        //                                      IsAuthenticated = true
        //                                  },
        //                       Success = true
        //                   };
        //    }

        //    var ex = res.ReadException();
        //    var errorCollection = ex.Data["DataContract"] as ErrorCollection;

        //      return new Response<string>()
        //                 {
        //                     Message = ex.Message,
        //                     ServiceErrorCollection = errorCollection,
        //                     Success = false
        //                 };
        //}
    }
}
