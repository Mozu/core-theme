using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using Mozu.SiteBuilder.UX.Models.Admin;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    // TODO: Temporarily extracted an interface here. These methods are all shared between AccountController and AuthController and should be moved into another Helper class
    public interface IAccountController : IHttpController
    {
        Task<Response<List<TaContext>>> VolusionLogIn(LoginUser login);
    }
}