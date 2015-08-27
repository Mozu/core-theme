using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Reference.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.Settings;
using DC= Mozu.SiteSettings.General.Contracts;
using Mozu.SiteSettings.General.Contracts.Clients;
using IPBlock = Mozu.SiteBuilder.UX.Admin.Api.Models.GeneralSettings.IPBlock;

namespace Mozu.SiteBuilder.UX.Admin
{
    public interface IGeneralSettingWrapper
    {
        Task<GeneralSettings> ReadSettings();

        //IEnumerable<IPBlock> GetIPBlocks();

        IEnumerable<TimeZone> GetTimeZones();

      //  void UpdateIPBlockCollection(GeneralSettings settingsToSave, IEnumerable<int?> existingBlockIds);

      //  void DeleteAllIPBlocks(IEnumerable<int?> existingBlockIds);

        GeneralSettings UpdateThemeCore(GeneralSettings settingsToSave);
        GeneralSettings UpdateGeneralSettings(GeneralSettings settingsToSave);
    }

    public class GeneralSettingWrapper : IGeneralSettingWrapper
    {
        private readonly IReferenceDataWebApiClient _referenceDataWebApiClient;
        private readonly IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        IProvisioningWebApiClient _provisioningWebApiClient;

        public GeneralSettingWrapper(IReferenceDataWebApiClient referenceDataWebApiClient, IGeneralSettingsWebApiClient generalSettingsWebApiClient, IProvisioningWebApiClient provisioningWebApiClient)
        {
            _referenceDataWebApiClient = referenceDataWebApiClient;
            _generalSettingsWebApiClient = generalSettingsWebApiClient;
            _provisioningWebApiClient = provisioningWebApiClient;
        }

        public async Task<GeneralSettings> ReadSettings()
        {
            var result = await _generalSettingsWebApiClient.GetGeneralSettings();
            return Mapper.Map<GeneralSettings>(result.ReadAsSync());
        }

        //public IEnumerable<IPBlock> GetIPBlocks()
        //{
        //    var none = Enumerable.Empty<IPBlock>();
        //    var task = _generalSettingsWebApiClient.GetIPBlocks();
        //    if (task.IsFaulted)
        //        return none;

        //    var result = task.Result;
        //    if (result.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
        //        return none;

        //    var ipBlocks = result.ReadAsAsync().Result;
        //    return ipBlocks.Items.Select(Mapper.Map<IPBlock>);
        //}

        public IEnumerable<TimeZone> GetTimeZones()
        {
            var timeZones = _referenceDataWebApiClient.GetTimeZones().Result.ReadAsAsync().Result;

            return timeZones.Items.Select(Mapper.Map<TimeZone>);
        }

        //public void UpdateIPBlockCollection(GeneralSettings settingsToSave, IEnumerable<int?> existingBlockIds)
        //{
        //    //var settings = Mapper.Map<DC.GeneralSettings>(settingsToSave);
        //    //var ipBlocks = settings.IPBlocks.Items;
        //    //foreach (var block in ipBlocks)
        //    //{
        //    //    if (block.Id > 0)
        //    //        _generalSettingsWebApiClient.UpdateIPBlock(block, block.Id).Result.ReadAsAsync();
        //    //    else
        //    //        _generalSettingsWebApiClient.CreateIPBlock(block).Result.ReadAsAsync();
        //    //}

        //    //var deletableBlocks = settingsToSave.IPBlocks.Select(x => x.Id).Where(x => x != 0).ToArray();
        //    //foreach (var ipBlockId in existingBlockIds)
        //    //{
        //    //    if (!deletableBlocks.Contains(ipBlockId))
        //    //        _generalSettingsWebApiClient.DeleteIPBlock(ipBlockId).Result.ReadAsAsync();
        //    //}
        //}

        //public void DeleteAllIPBlocks(IEnumerable<int?> existingBlockIds)
        //{
        //    foreach (var ipBlockId in existingBlockIds)
        //    {
        //        _generalSettingsWebApiClient.DeleteIPBlock(ipBlockId).Result.ReadAsAsync();
        //    }
        //}
        public GeneralSettings UpdateGeneralSettings(GeneralSettings settingsToSave)
        {
            var dcGeneralSettings = _generalSettingsWebApiClient.GetGeneralSettings().Result.ReadAsSync();
            var settings = Mapper.Map<DC.GeneralSettings>(settingsToSave);
            settings.Theme = dcGeneralSettings.Theme;
            settings.MobileTheme = dcGeneralSettings.MobileTheme;
            settings.TaxableTerritories = dcGeneralSettings.TaxableTerritories;
            settings.TabletTheme = dcGeneralSettings.TabletTheme;
            var updateGeneralSettings = _generalSettingsWebApiClient.UpdateGeneralSettings(settings).Result.ReadAsAsync();

            return Mapper.Map<GeneralSettings>(updateGeneralSettings.Result);
        }



        public GeneralSettings UpdateThemeCore(GeneralSettings settingsToSave)
        {
            var existing = _generalSettingsWebApiClient.GetGeneralSettings().Result.ReadAsSync();

           
            var settings = Mapper.Map<DC.GeneralSettings>(settingsToSave);

            existing.Theme = settings.Theme;
            existing.MobileTheme = settings.MobileTheme;
            existing.TabletTheme = settings.TabletTheme;

            var updateGeneralSettings = _generalSettingsWebApiClient.UpdateGeneralSettings(existing).Result.ReadAsAsync();

            return Mapper.Map<GeneralSettings>(updateGeneralSettings.Result);
        }
    }
}