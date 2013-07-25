using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models;
using Mozu.User.Contracts;
using VMUser = Mozu.SiteBuilder.UX.Models.Customers.User;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ValidateInput(false)]
    public class AuthController : BaseController
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

        public JsonDCResult LogOut()
        {
            _authenticationHelper.LogOut(_apiContext);
            //_cookieProvider.SaveResponseCookie("order", new HttpCookie("")); // uggh, but it works
            return new JsonDCResult()
            {
                Data = new Response<string>()
                {
                    Success = true
                }
            };

        }
        [HttpGet]
        public ActionResult SignIn(string returnUrl)
        {
            return View("SignIn");
        }
        [HttpPost]
        public ActionResult SignIn(string email, string password, string returnUrl, FormCollection collection)
        {
            var res = _userWebApiClient.Login( new Mozu.Core.Api.Contracts.UserAuthInfo()
            {
                
                EmailAddress = email,
                Password = password

            }).Result;
           

            
            
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var user = _userWebApiClient.GetUserByEmail(email).Result.ReadAsSync();
                //if (user.IsAdminUser)
                //{
                //    return Redirect("/admin");
                //}
                var ticket = res.ReadAsSync().AuthTicket;

                _authenticationHelper.SaveAuthTicket(ticket);

                _apiContext.SetUser(LightweightUserClaims.Parse(ticket.AccessToken));

                if ( string.IsNullOrEmpty(returnUrl))
                {
                    returnUrl = "/";
                }
                return Redirect(returnUrl);
            }
            else
            {
                ModelState.AddModelError("email", "There was an error with your E-Mail/Password combination. Please try again.");
                
                return View("SignIn" , new { email = email });
            }
        }
        public JsonDCResult SignIn(string email, string password)
        {
            var res = _userWebApiClient.Login(new Mozu.Core.Api.Contracts.UserAuthInfo()
            {

                EmailAddress = email,
                Password = password

            }).Result;
            var answer = new JsonDCResult();
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var user = _userWebApiClient.GetUserByEmail(email).Result.ReadAsSync();
                //if (user.IsAdminUser)
                //{
                //    answer.Data = new
                //        {
                //            ErrorCode = "IS_ADMIN_USER",
                //            Message = String.Format("The user {0} is an administrator.", email)
                //        };
                //}
                //else
                {
                    var ticket = res.ReadAsSync().AuthTicket;

                    _authenticationHelper.SaveAuthTicket(ticket); 
                    _apiContext.SetUser(LightweightUserClaims.Parse(ticket.AccessToken));
                    
                    answer.Data = new
                    {
                        Message = String.Format("Logged in as {0}.", email)
                    };
                }
            }
            else
            {
                answer.Data = new
                {
                    Message = String.Format("There was an error logging in as {0}. Please check your username and password.")
                };
            }
            return answer;
        }
        public JsonDCResult AjaxResetPassword(string email)
        {
            var res = _userWebApiClient.ResetPassword( new ResetPasswordInfo(){
                EmailAddress = email
            }).Result;
            if (res.ResponseMessage.IsSuccessStatusCode)
            {

                return new JsonDCResult()
                {
                    Data = new Response<bool>()
                    {
                        Data = true,
                        Success = true
                    }


                };
            }
            else
            {

                var ex = res.ReadException();

                var errorCollection = ex.Data["DataContract"] as ErrorCollection;

                return new JsonDCResult()
                {
                    Data = new Response<string>()
                    {
                        Message = "nope you stink",
                        ServiceErrorCollection = errorCollection,
                        Success = false

                    }

                };
            }

        }
        
        public JsonDCResult AjaxSignIn(string email, string password)
        {
            var info = new Core.Api.Contracts.UserAuthInfo { EmailAddress = email, Password = password };

            var res = _authTicketWebApiClient.CreateUserAuthTicket(info).Result;
            if (res.ResponseMessage.IsSuccessStatusCode)
            {

                var user = res.ReadAsSync();



                _authenticationHelper.SaveAuthTicket(user);
                _apiContext.SetUser(LightweightUserClaims.Parse(user.AccessToken));

              

                return new JsonDCResult
                {
                    Data = new Response<VMUser>
                    {
                        Data = new VMUser
                        {
                            FirstName = user.User.FirstName ,
                            LastName = user.User.LastName,
                            Email = user.User.EmailAddress,
                            UserId = user.User.UserId,
                            IsAuthenticated = true
                        },
                        Success = true
                    }
                };
            }

            var ex = res.ReadException();
            var errorCollection = ex.Data["DataContract"] as ErrorCollection;

            return new JsonDCResult()
            {
                Data = new Response<string>()
                {
                    Message = ex.Message,
                    ServiceErrorCollection = errorCollection,
                    Success = false
                }
            };
        }
    }
}
