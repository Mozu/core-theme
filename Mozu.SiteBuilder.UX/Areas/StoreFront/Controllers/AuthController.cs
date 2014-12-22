using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using Magnum.Extensions;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Extensions;
using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models;

using VMUser = Mozu.SiteBuilder.UX.Models.Customers.User;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Messaging;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [SslOnlyActionFilter]
    public class AuthController : BaseApiController
    {
        
        private readonly ICookieProvider _cookieProvider;
        private readonly ISiteBuilderApiContext _apiContext;
        private IAuthenticationHelper _authenticationHelper;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private readonly IAuthTicketWebApiClient _authTicketWebApiClient;
        private PageContext _pageContext;
        private VisitEventPublisher _visitPublisher;

        public AuthController(IAuthenticationHelper authenticationHelper, Mozu.Customer.Contracts.Clients.ICustomerAccountWebApiClient   customerAccountWebApiClient, Mozu.Customer.Contracts.Clients.IAuthTicketWebApiClient authTicketWebApiClient, ICookieProvider cookieProvider, ISiteBuilderApiContext  apiContext, PageContext pageContext, VisitEventPublisher visitPublisher)
        {
            if (customerAccountWebApiClient == null) throw new ArgumentNullException("customerAccountWebApiClient");
            if (authTicketWebApiClient == null) throw new ArgumentNullException("authTicketWebApiClient");
            _authenticationHelper = authenticationHelper;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _authTicketWebApiClient = authTicketWebApiClient;
         
            _cookieProvider = cookieProvider;
            _apiContext = apiContext;
            _pageContext = pageContext;
            _visitPublisher = visitPublisher;
        }
        //
        // GET: /StoreFront/Auth/

        protected void DoLogout() 
        {
            var user = LightweightUserClaims.CreateForAnonymousShopper(_apiContext.TenantId, _apiContext.SiteId.Value);
            _authenticationHelper.SaveStoreFrontAccessToken(null, null);
            _authenticationHelper.SaveStoreFrontRefreshToken( null, DateTime.Now );

            _apiContext.SetUser(user);
        }


        async Task<ServiceClientResponse<CustomerAuthTicket>> DoCreateAccount(CustomerAccountAndAuthInfo accountInfo )
        {
            var res = await _customerAccountWebApiClient.AddAccountAndLogin(accountInfo);
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var authTicket = res.ReadAsSync();
                var cust = authTicket.CustomerAccount;
                var userId = authTicket.UserId;



                var profile = new Mozu.Core.UserProfile()
                {
                    EmailAddress = cust.EmailAddress,
                    FirstName = cust.FirstName,
                    LastName = cust.LastName,
                    UserId = cust.UserId,
                    UserName = cust.UserName,
                };


                _authenticationHelper.SaveStoreFrontAccessToken(authTicket.AccessToken, profile.ToToken());
                _authenticationHelper.SaveStoreFrontRefreshToken(authTicket.RefreshToken, authTicket.RefreshTokenExpiration);
                var userClaim = LightweightUserClaims.Parse(authTicket.AccessToken);
                _apiContext.SetUser(userClaim);

                // iff the visit is already tracked, update the visit with the new user id
                if (_pageContext.Visit.IsTracked)
                {
                    _pageContext.Visit.UserId = userClaim.UserId;
                    _pageContext.Visit.IsUserTracked = true;
                    _visitPublisher.PublishVisit(_pageContext.Visit);
                }
            }

            return res;
        }

        protected async Task<ServiceClientResponse<CustomerAuthTicket>> DoLogin(string email, string password)
        {
            var res = (await _authTicketWebApiClient.CreateUserAuthTicket( new CustomerUserAuthInfo()
             {
                Username = email,
                Password = password

            }));

            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var authTicket = res.ReadAsSync();
                var cust = authTicket.CustomerAccount;
                var userId = authTicket.UserId;
         
                
              
                var profile = new Mozu.Core.UserProfile()
                                            {
                                                EmailAddress = cust.EmailAddress,
                                                FirstName = cust.FirstName,
                                                LastName = cust.LastName,
                                                UserId = cust.UserId,
                                                UserName = cust.UserName,
                                           };


                _authenticationHelper.SaveStoreFrontAccessToken(authTicket.AccessToken , profile.ToToken());
                _authenticationHelper.SaveStoreFrontRefreshToken(authTicket.RefreshToken, authTicket.RefreshTokenExpiration);
                var userClaim = LightweightUserClaims.Parse(authTicket.AccessToken);
                _apiContext.SetUser(userClaim);

                // iff the visit is already tracked, update the visit with the new page
                if (_pageContext.Visit.IsTracked)
                {
                    _pageContext.Visit.UserId = userClaim.UserId;
                    _pageContext.Visit.IsUserTracked = true;
                    _visitPublisher.PublishVisit(_pageContext.Visit);
                }
            }
            
            return res;
        }

        protected async Task<ServiceClientResponse<System.Net.Http.StreamContent>> DoResetPassword(ResetPasswordInfo info)
        {
            var res = (await _customerAccountWebApiClient.ResetPassword(info));

            return res;
        }

        protected async Task<ServiceClientResponse<System.Net.Http.StreamContent>> DoResetPasswordConfirm(ResetPasswordConfirmDetails info)
        {
            var res = (await _customerAccountWebApiClient.UpdateForgottenPassword(new ConfirmationInfo()
            {
                UserName = info.username,
                NewPassword = info.password,
                ConfirmationCode = info.validationToken,
            }));

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
           
            //redir.Headers.AddCookies(
            //    HttpContext.Response.Cookies.AllKeys.Select(x=> HttpContext.Response.Cookies[x]).Select(x=> new CookieHeaderValue(x.Name, x.Value ){Expires =x.Expires,Secure=x.Secure }));
            
            redir.Headers.Location = MakeRedirectUri(returnUrl);
            return redir;

        }

        [System.Web.Http.HttpGet]
        public ActionResult Login(string returnUrl = null)
        {

            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "login",
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }

            };


            return View("Login", new { ReturnUrl = returnUrl });
        }

        public class LoginDetails
        {
            public string email { get; set; }
            public string password { get; set; }
            public string returnUrl { get; set; }
        }

       [AcceptVerbs( "POST")]
        public async Task<HttpResponseMessage> CreateAccount(CustomerAccountAndAuthInfo authInfo)
         {
           
             var res = await DoCreateAccount(authInfo);
             if (res.ResponseMessage.IsSuccessStatusCode)
             {
                 return res.ResponseMessage;
             }

             if (res.ResponseMessage.IsSuccessStatusCode)
             {
                 return Request.CreateResponse(System.Net.HttpStatusCode.OK, new
                                                                             {
                                                                                 Message = String.Format("Logged in as {0}.", authInfo.Account.EmailAddress)
                                                                             });
             }
             else
             {
                 return Request.CreateResponse(System.Net.HttpStatusCode.Unauthorized, new
                 {
                     Message = String.Format("Login as {0} failed. Please try again.", authInfo.Account.EmailAddress)
                 });
             }
         }

         [AcceptVerbs("OPTIONS", "POST")]
         public async Task<HttpResponseMessage> AjaxCreateAccount(CustomerAccountAndAuthInfo authInfo)
         {
             if (this.Request.Method.Method  == "OPTIONS")
             {
                 return this.Request.CreateResponse(HttpStatusCode.OK);
             }
             var res= await  DoCreateAccount(authInfo);

             return res.ResponseMessage;
             ;


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
                if (String.IsNullOrEmpty(returnUrl))
                {
                    returnUrl = "/myaccount";
                }
                redir.Headers.Location = MakeRedirectUri(returnUrl);
                return redir;
                
            }
            else
            {
                string errorStr = (email != null) ? String.Format("Login as {0} failed. Please try again.", email) : "Login failed. Please specify a user.";
                return this.Request.CreateResponse(HttpStatusCode.OK, View("Login", new { email = email, Messages = new List<object> { new { Message = errorStr } } }));
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


         [AcceptVerbs("OPTIONS", "POST")]
         public async Task<HttpResponseMessage> AjaxResetPassword(ResetPasswordInfo info)
         {
             if (this.Request.Method.Method == "OPTIONS")
             {
                 return this.Request.CreateResponse(HttpStatusCode.OK);
             }
             var res = await DoResetPassword(info);

             return res.ResponseMessage;
             ;


         }

         [HttpGet]
         public async Task<ActionResult> ResetPassword(string t, string u)
         {

             var task = _customerAccountWebApiClient.CloneWithoutUserClaims().GetAccounts(filter: "UserId eq " + u);
             string userName = await task.ContinueWith<string>(x =>
             {
                 var res = x.Result;
                 if (res.ResponseMessage.IsSuccessStatusCode)
                 {
                     var account = res.ReadAsSync().Items.FirstOrDefault();
                     if (account != null)
                         return account.UserName ;
                 }
                 return null;
             });

             var model = new ResetPasswordConfirmDetails()
             {
                 username = userName,
                 validationToken = t,
             };
             return View("Reset-Password", model);
         }

         public class ResetPasswordConfirmDetails
         {
             public bool done { get; set; }
             public string username { get; set; }
             public string validationToken { get; set; }
             public string password { get; set; }
             public string passwordConfirm { get; set; }
             public object[] messages { get; set; }
         }

         [HttpPost]
         public async Task<HttpResponseMessage> ResetPassword(ResetPasswordConfirmDetails info)
         {
             var res = await DoResetPasswordConfirm(info);
             var ex = res.ReadException();
             info.done = res.ResponseMessage.IsSuccessStatusCode;
             info.messages = ex== null ? new object[0] : new object[] { new { message = ex.Message } };
             return this.Request.CreateResponse(HttpStatusCode.OK, View("Reset-Password", info));
         }




        //  [System.Web.Http.HttpPost]
        // public object  AjaxResetPassword(ResetPasswordInfo info)
        //{
        //    var res =  _customerAccountWebApiClient.ResetPassword(info).Result;
        //    if (res.ResponseMessage.IsSuccessStatusCode)
        //    {

        //        return new Response<bool>()
        //                   {
        //                       Data = true,
        //                       Success = true
        //                   };
        //    }
        //    else
        //    {

        //        var ex = res.ReadException();

        //        var errorCollection = ex.Data["DataContract"] as ErrorCollection;

        //        return new Response<string>()
        //                   {
        //                       Message = "nope you stink",
        //                       ServiceErrorCollection = errorCollection,
        //                       Success = false

        //                   };
        //    }
       
        //}
        ////  [System.Web.Http.HttpPost]
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
