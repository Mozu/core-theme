using System;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    public class ThemeRuntimeSetting
    {
        public ThemeSetting Setting { get; set; }
        public object Value { get; set; }

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ThemeRuntimeSetting() { }

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ThemeRuntimeSetting(ThemeSetting setting, object value)
        {
            Setting = setting;
            Value = value;
        }
    }
}
