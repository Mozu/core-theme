using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.User.Contracts;

namespace Mozu.SiteBuilder.Mvc.Security
{
    public interface IAuthenticationHelper
    {
        //void LogOut(IApiContext context);
       // void SaveAuthTicket(UserAuthTicket ticket );
        void SaveAccessToken(string accessToken);
        string GetAccessToken();
        string GetRefreshToken();



        void SaveAuthTicket(UserAuthTicket ticket);

      
    }
}