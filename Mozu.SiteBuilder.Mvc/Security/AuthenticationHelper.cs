// -----------------------------------------------------------------------
// <copyright file="AuthenticationHelper.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Globalization;
using System.Security.Principal;
using System.Threading;
using System.Web.Security;
using Mozu.Core.Api.Contracts;
using Mozu.User.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.Security
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using Mozu.User.Contracts;
    using System.Web;
    using System.ComponentModel;
    using Mozu.Core;
  
    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class AuthenticationHelper : IAuthenticationHelper
    {
        //public static String COOKIENAME = "sbAuth";
        private HttpContextBase _httpContext;

        public AuthenticationHelper(HttpContextBase httpContext, ICookieProvider provider = null, string cookieName = null)
        {
            _httpContext = httpContext;
            CookieName = cookieName ?? System.Configuration.ConfigurationManager.AppSettings["authCookieName"];
            CookieProvider = provider;
        }


        public string CookieName { get; set; }

        public ICookieProvider CookieProvider { get; set; }

        public void SetCurrentUser(UserAuthTicket ticket)
        {
            LightweightUserClaims id;
            UserProfile pt = null;
            if (ticket == null || String.IsNullOrEmpty(ticket.AccessToken))
            {
                id = LightweightUserClaims.CreateAnonymous(scopeType : UserScopeType.Tenant);
                ticket = ticket ?? new UserAuthTicket();
                ticket.AccessToken  = id.ToAccessToken();
            }
            else
            {
                id = LightweightUserClaims.Parse(ticket.AccessToken);
               
                //if ( !string.IsNullOrEmpty( ticket.User ) )
                //{
                //    pt = ticket.User;
                //}
            }
           
            Thread.CurrentPrincipal = id;
            if (_httpContext != null)
            {
                _httpContext.Items["ticket"] = ticket;
                _httpContext.User = id;
                _httpContext.Items["UserProfile"] = ticket.User ;
            }


            
            SetCookie(ticket);
        }

        /// <summary>
        /// Allows current user to be set with just an accesstoken.
        /// </summary>
        /// <param name="accessToken"></param>
        public void SetCurrentUser(string accessToken)
        {
            if (!String.IsNullOrEmpty(accessToken))
            {
                var claim = LightweightUserClaims.Parse(accessToken);
                SetCurrentUser(new UserAuthTicket { AccessToken = accessToken, AccessTokenExpiration = claim.Expiration });
            }
            else
            {
                SetCurrentUser((UserAuthTicket)null);
            }
        }
     


        public UserAuthTicket GetCurrentTicket ()
        {
            UserAuthTicket ticket = null;
            if (_httpContext != null)
            {
                ticket = (UserAuthTicket) _httpContext.Items["ticket"];
            }
            return ticket ?? GetTicketFromRequest();

        }

        public Mozu.Core.Api.Contracts.UserProfile GetCurrentProfileToken()
        {

            return _httpContext.Items["UserProfile"] as Mozu.Core.Api.Contracts.UserProfile;
        }

        public LightweightUserClaims GetCurrentUser()
        {
            IPrincipal principal = null;

            var context = _httpContext;
            if (context != null)
                principal = context.User;

            return principal as LightweightUserClaims
                   ?? Thread.CurrentPrincipal as LightweightUserClaims
                   ?? LightweightUserClaims.CreateAnonymous(scopeType: UserScopeType.Tenant);
        }

        public void SetCookie(UserAuthTicket ticket)
        {
            var cookie = ticket.ToCookie(CookieName );
            CookieProvider.SaveResponseCookie(CookieName, cookie);
        }

        public UserAuthTicket GetTicketFromRequest()
        {
            var cookie = CookieProvider.GetRequestCookie(CookieName);

            if (cookie != null && cookie["AccessToken"] !=null)
            {
                return cookie.ToTicket();
            }

            return null;
        }
        public UserAuthTicket CreateAnonymousTicket()
        {
            var user = LightweightUserClaims.CreateAnonymous(scopeType: UserScopeType.Tenant);

           
            return new UserAuthTicket()
            {
                AccessToken = user.ToAccessToken(),
                User = new Core.Api.Contracts.UserProfile()
                           {
                               UserId = user.UserId 
                           },
                AccessTokenExpiration = user.Expiration
            };
        }
        public void LogOut()
        {
            SetCurrentUser((UserAuthTicket)null);
            var cookie = new HttpCookie("")
            {
                Expires = DateTime.MinValue,
            };
            CookieProvider.SaveResponseCookie(CookieName, cookie);
        }


       
    }
}
