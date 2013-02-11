using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Admin;
using LoginUser = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.LoginUser;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public interface IVolusionLoginHelper
    {
        Task<List<TaContext>> VolusionLogIn(LoginUser login);
    }
}