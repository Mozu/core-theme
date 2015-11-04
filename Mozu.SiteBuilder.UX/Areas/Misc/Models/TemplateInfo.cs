namespace Mozu.SiteBuilder.UX.Areas.Misc.Models
{
    public struct TemplateInfo
    {
        private const string format = "{0} - {1}";
        public string key { get; set; }
        public string scrubbedContent { get; set; }
        public string themeId { get; set; }

        public new string ToString()
        {
            return string.Format(format, themeId, key);
        }
    }
}