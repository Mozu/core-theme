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
        

        public AuthenticationHelper(ICookieProvider provider = null , string cookieName = null )
        {
            CookieName = cookieName ?? System.Configuration.ConfigurationManager.AppSettings["authCookieName"];
            CookieProvider = provider;
        }


        public string CookieName { get; set; }

        public ICookieProvider CookieProvider { get; set; }

        public void SetCurrentUser(UserAuthTicket ticket)
        {
            LightweightUserClaims id;
            ProfileToken pt = null;
            if (ticket == null || String.IsNullOrEmpty(ticket.AccessToken))
            {
                id = new LightweightUserClaims
                {
                    //set to min.. only way to say non authenticated
                    Expiration = DateTime.Now.AddYears( 10 ) ,
                    UserId = Guid.NewGuid().ToString("N"),
                    IsAnonymous = true 
                };
                ticket = ticket ?? new UserAuthTicket();
                ticket.AccessToken  = id.ToAccessToken();
            }
            else
            {
                id = LightweightUserClaims.Parse(ticket.AccessToken);
                if ( !string.IsNullOrEmpty( ticket.ProfileToken ) )
                {
                    pt = ProfileToken.Parse(ticket.ProfileToken);
                }
            }

            Thread.CurrentPrincipal = id;
            if (HttpContext.Current != null)
            {
                HttpContext.Current.Items["ticket"] = ticket;
                HttpContext.Current.User = id;
                HttpContext.Current.Items["profileToken"] = pt;
            }

            if (ticket == null)
                return;

            
            SetCookie(ticket);
        }
        public UserAuthTicket GetCurrentTicket ()
        {
            UserAuthTicket ticket = null;
            if (HttpContext.Current != null)
            {
                ticket = (UserAuthTicket) HttpContext.Current.Items["ticket"];
            }
            return ticket ?? GetTicketFromRequest();

        }

        public ProfileToken GetCurrentProfileToken()
        {
            return HttpContext.Current.Items["profileToken"] as ProfileToken;
        }

        public LightweightUserClaims GetCurrentUser()
        {
            IPrincipal principal = null;

            var context = HttpContext.Current;
            if (context != null)
                principal = context.User;

            return principal as LightweightUserClaims
                ?? Thread.CurrentPrincipal as LightweightUserClaims
                ?? new LightweightUserClaims();
        }

        public void SetCookie(UserAuthTicket ticket)
        {
            var cookie = ticket.ToCookie(CookieName );
            CookieProvider.SaveResponseCookie(CookieName, cookie);
        }

        public UserAuthTicket GetTicketFromRequest()
        {
            var cookie = CookieProvider.GetRequestCookie(CookieName);

            if (cookie == null || cookie["AccessToken"] == null)
            {
                var user = new LightweightUserClaims()
                               {
                                   //set to min.. only way to say non authenticated
                                   Expiration = DateTime.Now.AddYears(10),
                                   UserId = Guid.NewGuid().ToString("N"),
                                   IsAnonymous = true
                               };
                var profile = new ProfileToken()
                                  {
                                      UserId = user.UserId
                                  };
                return new UserAuthTicket()
                           {
                               AccessToken = user.ToAccessToken(),
                               ProfileToken = profile.ToToken(),
                               AccessTokenExpiration = user.Expiration
                           };
            }

            return cookie.ToTicket();
        }

        public void LogOut()
        {
            SetCurrentUser(null);
            var cookie = new HttpCookie("")
            {
                Expires = DateTime.MinValue,
            };
            CookieProvider.SaveResponseCookie(CookieName, cookie);
        }
    }
}
