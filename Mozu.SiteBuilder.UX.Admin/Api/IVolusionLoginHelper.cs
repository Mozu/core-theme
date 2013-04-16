using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Admin;
using LoginUser = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.LoginUser;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public interface IVolusionLoginHelper
    {
        List<Mozu.Tenant.Contracts.Tenant>  VolusionLogIn(LoginUser login);
    }
}