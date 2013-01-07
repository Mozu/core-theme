using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.User.Contracts;

namespace Mozu.SiteBuilder.Mvc.Security
{
    public interface IAuthenticationHelper
    {
        void LogOut();

        LightweightUserClaims GetCurrentUser();

        ProfileToken GetCurrentProfileToken();

        UserAuthTicket GetCurrentTicket();

        void SetCurrentUser(UserAuthTicket authTicket);
    }
}