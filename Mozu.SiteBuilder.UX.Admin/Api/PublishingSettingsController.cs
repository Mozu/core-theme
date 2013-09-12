using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mozu.Core.Api.Routing;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/settings/publishing", SuppressDescriptorGeneration = true)]
    public class PublishingSettingsController : BaseController
    {
        private readonly ISettings _settings;
        private ISiteBuilderApiContext _ctx;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public PublishingSettingsController(ISettings settings, ISiteBuilderApiContext ctx)
        {
            _settings = settings;
            _ctx = ctx;
        }


    }
}
