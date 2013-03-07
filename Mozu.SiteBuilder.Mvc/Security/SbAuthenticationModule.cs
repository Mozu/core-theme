// -----------------------------------------------------------------------
// <copyright file="SbAuthenticationModule.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Security
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Web;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class SbAuthenticationModule : IHttpModule
    {
        public void Dispose()
        {
        }

        public void Init(HttpApplication context )
        {
            context.AuthenticateRequest += new EventHandler(this.OnAuthenticate);
        }

        void OnAuthenticate(object sender, EventArgs e)
        {
            var helper =  new AuthenticationHelper( new HttpContextWrapper( HttpContext.Current) , new CookieProvider ());
            var ticket = helper.GetTicketFromRequest();
            if (ticket == null)
            {
                ticket = helper.CreateAnonymousTicket();
                helper.SetCookie(ticket);
            }
            helper.SetCurrentUser(ticket);
        }
    }
}
