//using System.Collections.Generic;
//using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

//namespace Mozu.SiteBuilder.Mvc.Themes
//{
//    /// <summary>
//    /// Contains advanced information about a Theme including its inheritance heirarchy.
//    /// </summary>
//    public interface ITheme : IThemeBasicInfo
//    {
        
      

//        string ThemePath { get; }

//        /// <summary>
//        /// If this theme inherits from another theme, contains the inherited theme.
//        /// </summary>
//        ITheme Parent { get; }

//        /// <summary>
//        /// Returns a complete theme inheritance stack with this theme as the first.
//        /// For legacy reasons, this property actually returns the theme names.
//        /// </summary>
//        ICollection<string> Stack { get; }

//        /// <summary>
//        /// Returns a complete theme inheritance stack with this theme as the first.
//        /// </summary>
//        ICollection<ITheme> StackT { get; }

//        /// <summary>
//        /// Contains the theme configuration object.
//        /// </summary>
//        IEnumerable<ConfigurationItem> Configuration { get; }
//    }
//}
