using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

namespace Mozu.SiteBuilder.Mvc.Settings
{
    public interface IThemeSettingsRepository
    {
        Task<RuntimeConfigurationFieldCollection> GetRuntimeValues(string themeId);
        Task<List<FieldValue>> SaveInstanceValues(List<FieldValue> values, string themeId);
        Task<List<FieldValue>> GetInstanceValues(string themeId);
        DateTime GetTimeStamp(string themeId);
    }
}