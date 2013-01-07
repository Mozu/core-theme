using System;
using System.Linq;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text.RegularExpressions;

namespace Mozu.SiteBuilder.UX.Models.Settings
{
    [DataContract]
    public class PaymentSettings
    {
        [DataMember(Name = "supportedCards")]
        public List<KeyValuePair<string, string>> SupportedCards { get; set; }
    }

    [DataContract]
    public class CheckoutSettings
    {
        [DataMember(Name = "paymentSettings")]
        public PaymentSettings PaymentSettings { get; set; }
    }

    [DataContract]
    public class GeneralSettings  :ModelBase
    {
        [DataMember(Name = "websiteName")]
        public string WebsiteName { get; set; }

        [DataMember(Name = "timeZone")]
        public string SiteTimeZone { get; set; }

        [DataMember(Name = "timeFormat")]
        public string SiteTimeFormat { get; set; }

        [DataMember(Name = "daylightSaving")]
        public bool AdjustForDaylightSavingTime { get; set; }

        [DataMember(Name = "allowAllIps")]
        public bool AllowAllIPs { get; set; }


        [DataMember(Name = "ipRanges")]
        public List<IPBlock> IPBlocks { get; set; }

        [DataMember(Name = "senderEmail")]
        public string SenderEmailAddress { get; set; }

        [DataMember(Name = "senderEmailName")]
        public string SenderEmailAddressName
        {
            get { return "Mr. Not Inservicesyet"; }
            set { }
        }

        [DataMember(Name = "replyToEmail")]
        public string ReplyToEmailAddress { get; set; }


        [DataMember(EmitDefaultValue = false, Name = "logoPath")]
        public string LogoPath { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "logoText")]
        public string LogoText { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "favIconMobilePath")]
        public string FavIconMobilePath { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "favIconPath")]
        public string FavIconPath { get; set; }

        /// <summary>
        /// "Theme" has been overridden in the UI to contain both the desktop and possibly mobile theme concatenated in one string.
        /// </summary>
        private string _theme;
        [DataMember(Name = "theme")]
        [Obsolete("Theme doesn't mean what it used to mean. You probably want DesktopTheme.")]
        public string Theme { get { return _theme; } set { _theme = value; } }

        public string DesktopTheme
        {
            get
            {
                if (_theme != null && _theme.Contains(";"))
                    return _theme.Split(';').First();
                else
                    return _theme;
            }
            set
            {
                // regex replace the contents of Theme leading up to ';'
                if (_theme != null)
                    _theme = Regex.Replace(_theme, ".+;?", value);
                else
                    _theme = value;
            }
        }

        public string MobileTheme {
            get
            {
                if (_theme != null && _theme.Contains(";"))
                    return _theme.Split(';')[1];
                else
                    return null;
            }
            set
            {
                _theme = String.Format("{0};{1}", DesktopTheme, value);
            }
        }

    }
}