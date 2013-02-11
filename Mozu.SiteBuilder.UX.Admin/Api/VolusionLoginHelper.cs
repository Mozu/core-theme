using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.AdminUser.Contracts;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Models.Admin;
using LoginUser = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.LoginUser;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public class VolusionLoginHelper : IVolusionLoginHelper
    {
        private IInvitationWebApiClient _invitationWebApiClient;
        private readonly IUserHelper _userHelper;
        private readonly IAdminUserWebApiClient _usersRepo;
        private readonly IAuthenticationHelper _authHelper;
        private readonly ISettings _settings;

        public VolusionLoginHelper(IInvitationWebApiClient invitationWebApiClient, IUserHelper userHelper, IAdminUserWebApiClient usersRepo, IAuthenticationHelper authHelper, ISettings settings)
        {
            _invitationWebApiClient = invitationWebApiClient;
            _userHelper = userHelper;
            _usersRepo = usersRepo;
            _authHelper = authHelper;
            _settings = settings;
        }

        public async Task<List<TaContext>> VolusionLogIn(LoginUser user)
        {
            UserLoginResult ulr = null;
            //Core.Api.Contracts.UserAuthTicket ticket = null;
            LightweightUserClaims volLwp = null;
            var dcUser = Mapper.Map<Core.Api.Contracts.User>(user);
            if (!string.IsNullOrEmpty(user.Invitation))
            {
                var invite = _invitationWebApiClient.GetInvitation(user.Invitation).Result.ReadAsSync();

                if (_userHelper.UserExists(user))
                {
                    // var rootAuthRepo = new AuthTicketWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
                    ulr = await _usersRepo.Login(new Core.Api.Contracts.UserAuthInfo { EmailAddress = user.EmailAddress, Password = user.Password }).Result.ReadAsAsync();
                    //  ticket = lur.AuthTicket;
                    //ticket = _usersRepo.CreateUserAuthTicket().Result.ReadAsSync();
                    _authHelper.SetCurrentUser(ulr.AuthTicket);
                    var user1 = _authHelper.GetCurrentUser();
                    _invitationWebApiClient = new InvitationWebApiClient(new ServiceClientMessageHandler(new ApiContext() { SiteId = user.SiteId.GetValueOrDefault(0), TenantId = user.TenantId.GetValueOrDefault(0), UserClaims = user1 }, _settings));

                    var ci = await _invitationWebApiClient.ConfirmInvitation(user.Invitation);
                    if (ci.HasException)
                    {
                        throw ci.ReadException();
                    }
                }
                else
                {

                    dcUser.EmailAddress = invite.EmailAddress;
                    dcUser.LocaleCode = string.IsNullOrEmpty(dcUser.LocaleCode) ? "en-US" : dcUser.LocaleCode;

                    var ticket = _invitationWebApiClient.CompleteInvitation(user.Invitation, dcUser).Result.ReadAsSync();
                    _authHelper.SetCurrentUser(ticket);
                }



            }
            if (ulr == null)
            {
                ulr = await _usersRepo.Login(new Core.Api.Contracts.UserAuthInfo { EmailAddress = user.EmailAddress, Password = user.Password }).Result.ReadAsAsync();

            }
            _authHelper.SetCurrentUser(ulr.AuthTicket);
            //volLwp = LightweightUserClaims.Parse(ulr.AuthTicket.AccessToken );



            //   var res = SiteRolesList(volLwp.UserId );
            // return this.List<Tuple<Site, int>>(res);
            //      sites.Items.FirstOrDefault(site=> site.Id == role.SiteId )
            /*List<Site> sites = new List<Site>();
            List<Task<ServiceClientResponse<SiteCollection>>> blurgs = new List<Task<ServiceClientResponse<SiteCollection>>>();
            foreach (var tenant in ulr.Tenants)
            {
                blurgs.Add(_tenantClient.GetSites(tenant.Id));
            }
            Task.WaitAll(blurgs.ToArray() );

            foreach (var blurg in blurgs)
            {
                sites.AddRange(blurg.Result.ReadAsSync().Items);
            }*/

            //var sites = _siteClient.GetSites(0, int.MaxValue, null, string.Join(" or ", ulr.Tenants.Select(x => "TenantId eq " + x))).Result.ReadAsSync();
            //return this.List<Tuple<Site, int>>(sites.Select(x => new Tuple<Site, int>(x, 1)).ToList());

            var contexts = Mapper.Map<List<TaContext>>(ulr.Tenants);

            return contexts;

            /*var ts = _tenantClient.GetTenants(0, int.MaxValue, null, string.Join(" or ", ulr.Tenants.Select(x => "TenantId eq " + x.Id))).Result.ReadAsSync();

            //var tenants = ts.Items.Select(x => new TaContext { TenantId = x.Id });
            var tenants = ts.Items.Select(x => _taContextProvider.GetContext(x.Id));

            return List(tenants.ToList());*/
        }
    }
}