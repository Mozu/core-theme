using System;
using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

namespace Mozu.SiteBuilder.Mvc.Settings
{
    public interface IThemeSettingsRepository
    {
        RuntimeConfigurationFieldCollection GetRuntimeValues();
        List<FieldValue> SaveInstanceValues(List<FieldValue> values);
        List<FieldValue> GetInstanceValues();
        DateTime GetTimeStamp();
    }
}