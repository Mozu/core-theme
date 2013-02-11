// -----------------------------------------------------------------------
// <copyright file="ProvisionHelper.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Contracts;
using Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Configuration;
    using Newtonsoft.Json.Linq;

    public interface IProvisioningHelper
    {
        void ProvisionCms();
    }

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class ProvisioningHelper : IProvisioningHelper
    {
        private static readonly Lazy<Dictionary<string,Version>> g_cmsFeatureVersions = new Lazy<Dictionary<string,Version>>(CreateCmsVersionsRequirements);
        private static readonly HashSet<int> g_provisionedSites = new HashSet<int>();

        private readonly IProvisioningWebApiClient _client;
        private readonly ISiteBuilderContext _ctx;

        public static HashSet<int> ProvisionedSites
        {
            get { return g_provisionedSites; }
        }

        static Dictionary<string,Version> CreateCmsVersionsRequirements()
        {
            var job = JObject.Parse(ConfigurationManager.AppSettings["cms-feature-versions"]);

            var dic = new Dictionary<string, Version>();
            foreach (var kvp in job)
            {
                dic[kvp.Key] = Version.Parse((string)kvp.Value);
            }
            return dic;
        }

        public ProvisioningHelper(IProvisioningWebApiClient client, ISiteBuilderContext ctx)
        {
            _client = client;
            _ctx = ctx;
        }

        public void ProvisionCms()
        {
            lock (g_provisionedSites)
            {
                if (g_provisionedSites.Contains(_ctx.SiteId.GetValueOrDefault(-1)))
                {
                    return;
                }
            }

            //try
            //{
            //    var features = _client. .GetProvisionedFeatures().Result.ReadAsAsync().Result;

            //    var featuresToAdd = GetFeaturesToAdd(features);

            //    if (!TryFeatureProvision(featuresToAdd))
            //        return;
            //}
            //catch (Exception ex)
            //{
            //    System.Diagnostics.EventLog.WriteEntry("Volusion.NextGen", ex.ToString(), System.Diagnostics.EventLogEntryType.Error);
            //    throw;
            //}

            lock (g_provisionedSites)
            {
                g_provisionedSites.Add(_ctx.SiteId.GetValueOrDefault(-1));
            }
        }

        private static IEnumerable<Feature> GetFeaturesToAdd(IEnumerable<ProvisionedFeature> features)
        {
            return from req in g_cmsFeatureVersions.Value
                   let feature = features.FirstOrDefault(x => string.Equals(x.Name, req.Key))
                   where feature == null || Version.Parse(feature.Version) < req.Value
                   select new Feature
                       {
                           Name = req.Key, Version = req.Value.ToString()
                       };
        }

        private bool TryFeatureProvision(IEnumerable<Feature> features)
        {
            return true;
            //if (!features.Any())
            //    return false;

            //var featureProvision = new FeatureProvisionMessage { FeaturesToAdd = features.ToList() };
            //var successfulProvision = _client.ProvisionFeatures(featureProvision, true).Result.ResponseMessage.IsSuccessStatusCode;

            //return successfulProvision;
        }
    }
}
