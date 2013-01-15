using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

namespace Mozu.SiteBuilder.Mvc.Settings
{
    public interface IThemeSettingsRepository
    {
        Task<RuntimeConfigurationFieldCollection> GetRuntimeValues();
        Task<List<FieldValue>> SaveInstanceValues(List<FieldValue> values);
        Task<List<FieldValue>> GetInstanceValues();
        DateTime GetTimeStamp();
    }
}