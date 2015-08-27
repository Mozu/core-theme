//using System;
//using System.Globalization;
//using System.Web;
//using Mozu.Core.Api.Contracts;

//using Newtonsoft.Json;

//namespace Mozu.SiteBuilder.Mvc.Security
//{
//    public static class AuthenticationExtensions
//    {
//        private const string AccessToken = "AccessToken";
//        private const string RefreshToken = "RefreshToken";
//        private const string UserProfile = "UserProfile";
//        private const string AccessTokenExpiration = "AccessTokenExpiration";
//        private const string RefreshTokenExpiration = "RefreshTokenExpiration";

//        public static HttpCookie ToCookie(this UserAuthTicket ticket, string cookieName)
//        {
//            var cookie = new HttpCookie(cookieName);
           
//            if (ticket != null)
//            {
//                cookie[AccessToken] = ticket.AccessToken;
//                cookie[RefreshToken] = ticket.RefreshToken;
//                cookie[UserProfile] = ToString(ticket.User);
//                cookie[AccessTokenExpiration] = ticket.AccessTokenExpiration.Ticks.ToString("X2");
//                cookie[RefreshTokenExpiration] = ticket.RefreshTokenExpiration.Ticks.ToString("X2");
//            }
            
//            cookie.Expires = DateTime.Now.AddYears(20);
//            return cookie;
//        }
//        static string ToString(UserProfile user)
//        {
           
//            if (user != null)
//            {
//                return new Mozu.Core.UserProfile()
//                {
//                    EmailAddress = user.EmailAddress,
//                    UserId = user.UserId,
//                    FirstName = user.FirstName,
//                    LastName = user.LastName
//                }.ToToken();
//            }
//            return null;
//        }

//        static UserProfile ToUser(string str)
//        {
//            if (!string.IsNullOrWhiteSpace( str))
//            {
//                var cup = Mozu.Core.UserProfile.Parse(str);
//                return new UserProfile()
//                           {
//                               EmailAddress = cup.EmailAddress,
//                               UserId = cup.UserId,
//                               FirstName = cup.FirstName,
//                               LastName = cup.LastName
//                           };

//            }
//            return null;

//        }
//        public static UserAuthTicket ToTicket(this HttpCookie cookie)
//        {
//            if (cookie[AccessToken] == null)
//            {
//                return null;
//            }
//            return new UserAuthTicket
//            {
//                AccessToken = cookie[AccessToken],
//                RefreshToken = cookie[RefreshToken],
//                User = ToUser(cookie[UserProfile]),
//                AccessTokenExpiration = new DateTime(Int64.Parse(cookie[AccessTokenExpiration], NumberStyles.HexNumber)),
//                RefreshTokenExpiration = new DateTime(Int64.Parse(cookie[RefreshTokenExpiration], NumberStyles.HexNumber)),
//            };
//        }
//    }
//}