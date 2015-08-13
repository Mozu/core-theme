using System;
using Mozu.Core;
using Mozu.Core.Api.Contracts;


namespace Mozu.SiteBuilder.Mvc.Security
{
    public interface IAuthenticationHelper
    {
        //void LogOut(IApiContext context);
       // void SaveAuthTicket(UserAuthTicket ticket );
        void SaveAdminAccessToken(string accessToken, bool isForStoreFrontAccess);
        string GetAdminAccessToken();
        string GetProfileToken();
        string GetAdminRefreshToken();


        void ClearStorefrontTokens();
        void SaveStoreFrontRefreshToken(string token, DateTime? expiryTime);

        string GetStoreFrontRefreshToken();

        string GetStoreFrontAccessToken();

        void SaveStoreFrontAccessToken(string token, string profile, DateTime? expiry = null);


        // void SaveAuthTicket(UserAuthTicket ticket);

        //    UserAuthTicket GetAuthTicket();

        //   void SaveAccessToken(string p);
    }
}