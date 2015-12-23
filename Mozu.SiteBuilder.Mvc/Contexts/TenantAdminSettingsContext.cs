using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.MZDB.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public interface ITenantAdminSettingsContext
    {
        bool EnableBetaAdmin { get; }

        bool EntityManagerVisible { get; }

        bool SiteBuilderContentListsVisible { get; }
        bool CustomRoutesVisible { get; }
        string BetaControlVersion { get; }
        Task<ITenantAdminSettingsContext> AsyncGet();

    }
    public class TenantAdminSettingsContext : ITenantAdminSettingsContext
    {
        private readonly Lazy<IEntityListsWebApiClient> _entityListsWebApiClient;
        private readonly Lazy<ISettings> _settings;

        Lazy<JObject> _state;
        public TenantAdminSettingsContext(Lazy<Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient> entityListsWebApiClient, Lazy<Mozu.Core.Settings.ISettings> settings)
        {
            _entityListsWebApiClient = entityListsWebApiClient;
            _settings = settings;

            _state = new Lazy<JObject>(GetSettings);
        }

        JObject GetSettings()
        {
            var res = _entityListsWebApiClient.Value.CloneWithoutUserClaims().GetEntity(entityListFullName: "tenantAdminSettings@mozu", id: "Global").Result;
            return res.ResponseMessage.IsSuccessStatusCode ? res.ReadAsSync() : new JObject();
        }

        public string BetaControlVersion
        {
            get
            {
                return _settings.Value.AppSettings("sitebuilder.betaControlVersion");
            }
        }

        public async Task<ITenantAdminSettingsContext> AsyncGet()
        {
            if (_state.IsValueCreated)
            {
                return this;
            }
            
            var res = (await _entityListsWebApiClient.Value.CloneWithoutUserClaims().GetEntity(entityListFullName: "tenantAdminSettings@mozu", id: "Global").ConfigureAwait(false));
            var val = res.ResponseMessage.IsSuccessStatusCode ? res.ReadAsSync() : new JObject();
            _state = new Lazy<JObject>(() => val);
            return this;
        }
        public bool EnableBetaAdmin
        {
            get
            {
                return ((bool?)_state.Value.GetValue("enableBetaAdmin")).GetValueOrDefault(false);
            }
        }

        public bool EntityManagerVisible
        {
            get
            {
                return ((bool?)_state.Value.GetValue("entityManagerVisible")).GetValueOrDefault(false);
            }
        }
        public bool SiteBuilderContentListsVisible
        {
            get
            {
                return ((bool?)_state.Value.GetValue("siteBuilderContentListsVisible")).GetValueOrDefault(false);
            }
        }
        public bool CustomRoutesVisible
        {
            get
            {
                return ((bool?)_state.Value.GetValue("customRoutesVisible")).GetValueOrDefault(false);
            }
        }


    }
}
