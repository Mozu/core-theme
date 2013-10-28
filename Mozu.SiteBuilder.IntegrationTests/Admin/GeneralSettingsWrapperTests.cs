using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using Mozu.Core.Api.Contracts;
using Mozu.Reference.Contracts;
using Mozu.Reference.Contracts.Clients;
using NSubstitute;
using NUnit.Framework;
using Should;
using Mozu.SiteBuilder.UX.Admin;
using Mozu.SiteSettings.General.Contracts;
using Mozu.SiteSettings.General.Contracts.Clients;
using GeneralSettings = Mozu.SiteBuilder.UX.Models.Settings.GeneralSettings;
using MozuGeneralSettings = Mozu.SiteSettings.General.Contracts.GeneralSettings;
using IPBlock = Mozu.SiteSettings.General.Contracts.IPBlock;
using TimeZone = Mozu.Reference.Contracts.TimeZone;

namespace Mozu.SiteBuilder.IntegrationTests.Admin
{
    [TestFixture]
    public class GeneralSettingsWrapperTests
    {
        private IReferenceDataWebApiClient _referenceDataWebApiClient;
        private IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        private IProvisioningWebApiClient _provisioningWebApiClient;

        [SetUp]
        public void SetUp()
        {
            _referenceDataWebApiClient = Substitute.For<IReferenceDataWebApiClient>();
            _generalSettingsWebApiClient = Substitute.For<IGeneralSettingsWebApiClient>();
            _provisioningWebApiClient = Substitute.For<IProvisioningWebApiClient>();
        }

        //[Test]
        //public void DeleteAllIPBlocks_should_be_passesd_to_GeneralSettingsWebApiClient()
        //{
        //    var wrapper = GetWrapper();

        //    _generalSettingsWebApiClient.WithAny(x => x.DeleteIPBlock(0), TestResponse.Void);

        //    wrapper.DeleteAllIPBlocks(new int?[] { 111, 222 });

        //    _generalSettingsWebApiClient.Received().DeleteIPBlock(111);
        //    _generalSettingsWebApiClient.Received().DeleteIPBlock(222);
        //    _generalSettingsWebApiClient.DidNotReceive().DeleteIPBlock(default(int?));
        //}

       


        
        //[Test]
        //public void ReadSettings_should_create_when_response_has_exception_and_no_settings_found()
        //{
        //    var wrapper = GetWrapper();
        //    _generalSettingsWebApiClient.WithException(x => x.GetGeneralSettings(null), new Exception("settings not found"), message => message.StatusCode = HttpStatusCode.NotFound);

        //    wrapper.ReadSettings();

        //    _provisioningWebApiClient.Received().CreateSite(Arg.Any<SiteProvisionMessage>());
        //}

        //[Test]
        //public void GetIPBlocks_should_return_mapped_items_from_service()
        //{
        //    var wrapper = GetWrapper();
        //    var serviceBlocks = Enumerable.Range(127, 72).Select(x => new IPBlock { RangeStart = x + ".0.0.1", RangeEnd = x + ".0.0.255", Id = 1000 + x });
        //    var blockCollection = new IPBlockCollection { Items = serviceBlocks.ToList() };

        //    _generalSettingsWebApiClient.With(x => x.GetIPBlocks(), blockCollection);

        //    var blocks = wrapper.GetIPBlocks();

        //    var mapped = blocks.Select(x => new { Id = x.Id ?? 0, x.RangeStart, x.RangeEnd });
        //    var server = blockCollection.Items.Select(x => new { x.Id, x.RangeStart, x.RangeEnd });
        //    CollectionAssert.AreEqual(mapped, server);
        //}

        [Test]
        public void GetTimesZones_should_return_mapped_values_from_service()
        {
            var wrapper = GetWrapper();
            var zones = new List<TimeZone>
                {
                    new TimeZone { IsDaylightSavingsTime = true, Offset = 5d, Id = "Central Standard" },
                    new TimeZone { IsDaylightSavingsTime = true, Offset = 6d, Id = "Mountain Daylight" },
                };
            var timeZoneCollection = new TimeZoneCollection { Items = zones.ToList() };

            _referenceDataWebApiClient.With(x => x.GetTimeZones(), timeZoneCollection);

            var timeZones = wrapper.GetTimeZones();

            CollectionAssert.AreEqual(timeZones.Select(x => x.Id), zones.Select(x => x.Id));
        }

        [Test]
        public void UpdateGeneralSettings_should_update_and_return_mapped()
        {
            var wrapper = GetWrapper();
            var websiteName = "¡Mexipani Candy Bueno 感嘆符!";
            var serviceSettings = new MozuGeneralSettings { WebsiteName = websiteName };

            _generalSettingsWebApiClient.WithAny(x => x.UpdateGeneralSettings(null), serviceSettings);

            var generalSettings = new GeneralSettings { WebsiteName = websiteName };

            var settings = wrapper.UpdateGeneralSettings(generalSettings);

            Assert.NotNull(settings);
        }

        private GeneralSettingWrapper GetWrapper()
        {
            return new GeneralSettingWrapper(_referenceDataWebApiClient, _generalSettingsWebApiClient, _provisioningWebApiClient);
        }
    }
}