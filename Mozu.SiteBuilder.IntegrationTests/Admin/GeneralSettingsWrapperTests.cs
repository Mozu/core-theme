using System.Collections.Generic;
using System.Linq;
using Mozu.Reference.Contracts;
using Mozu.Reference.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin;
using Mozu.SiteBuilder.UX.Models.Settings;
using Mozu.SiteSettings.General.Contracts.Clients;
using NSubstitute;
using NUnit.Framework;
using MozuGeneralSettings = Mozu.SiteSettings.General.Contracts.GeneralSettings;
using TimeZone = Mozu.Reference.Contracts.TimeZone;

namespace Mozu.SiteBuilder.IntegrationTests.Admin
{
    [TestFixture]
    public class GeneralSettingsWrapperTests
    {
        [SetUp]
        public void SetUp()
        {
            _referenceDataWebApiClient = Substitute.For<IReferenceDataWebApiClient>();
            _generalSettingsWebApiClient = Substitute.For<IGeneralSettingsWebApiClient>();
            _provisioningWebApiClient = Substitute.For<IProvisioningWebApiClient>();
        }

        private IReferenceDataWebApiClient _referenceDataWebApiClient;
        private IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        private IProvisioningWebApiClient _provisioningWebApiClient;

        private GeneralSettingWrapper GetWrapper()
        {
            return new GeneralSettingWrapper(_referenceDataWebApiClient, _generalSettingsWebApiClient, _provisioningWebApiClient);
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
            GeneralSettingWrapper wrapper = GetWrapper();
            var zones = new List<TimeZone>
                        {
                            new TimeZone {IsDaylightSavingsTime = true, Offset = 5d, Id = "Central Standard"},
                            new TimeZone {IsDaylightSavingsTime = true, Offset = 6d, Id = "Mountain Daylight"},
                        };
            var timeZoneCollection = new TimeZoneCollection {Items = zones.ToList()};

            _referenceDataWebApiClient.With(x => x.GetTimeZones(), timeZoneCollection);

            IEnumerable<UX.Models.Settings.TimeZone> timeZones = wrapper.GetTimeZones();

            CollectionAssert.AreEqual(timeZones.Select(x => x.Id), zones.Select(x => x.Id));
        }

     
    }
}