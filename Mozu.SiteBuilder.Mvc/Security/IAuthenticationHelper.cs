using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.User.Contracts;

namespace Mozu.SiteBuilder.Mvc.Security
{
    public interface IAuthenticationHelper
    {
        void LogOut();

        LightweightUserClaims GetCurrentUser();

        Mozu.Core.Api.Contracts.UserProfile GetCurrentProfileToken();

        UserAuthTicket GetCurrentTicket();

        void SetCurrentUser(UserAuthTicket authTicket);

        void SetCurrentUser(string authToken);
    }
}