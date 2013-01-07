using System;
using System.Globalization;
using System.Web;
using Mozu.Core.Api.Contracts;
using Mozu.User.Contracts;

namespace Mozu.SiteBuilder.Mvc.Security
{
    public static class AuthenticationExtensions
    {
        private const string AccessToken = "AccessToken";
        private const string RefreshToken = "RefreshToken";
        private const string ProfileToken = "ProfileToken";
        private const string AccessTokenExpiration = "AccessTokenExpiration";
        private const string RefreshTokenExpiration = "RefreshTokenExpiration";

        public static HttpCookie ToCookie(this UserAuthTicket ticket, string cookieName)
        {
            var cookie = new HttpCookie(cookieName);

            cookie[AccessToken] = ticket.AccessToken;
            cookie[RefreshToken] = ticket.RefreshToken;
            cookie[ProfileToken] = ticket.ProfileToken;
            cookie[AccessTokenExpiration] = ticket.AccessTokenExpiration.Ticks.ToString("X2");
            cookie[RefreshTokenExpiration] = ticket.RefreshTokenExpiration.Ticks.ToString("X2");
            cookie.Expires = DateTime.Now.AddYears(20);
            return cookie;
        }

        public static UserAuthTicket ToTicket(this HttpCookie cookie)
        {
            return new UserAuthTicket
            {
                AccessToken = cookie[AccessToken],
                RefreshToken = cookie[RefreshToken],
                ProfileToken = cookie[ProfileToken ],
                AccessTokenExpiration = new DateTime(Int64.Parse(cookie[AccessTokenExpiration], NumberStyles.HexNumber)),
                RefreshTokenExpiration = new DateTime(Int64.Parse(cookie[RefreshTokenExpiration], NumberStyles.HexNumber)),
            };
        }
    }
}