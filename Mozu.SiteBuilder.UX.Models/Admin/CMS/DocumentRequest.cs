namespace Mozu.SiteBuilder.UX.Models.Admin.CMS
{
    public class DocumentRequest
    {
        public string Id { get; set; }
        public string ListFQN { get; set; }
        private string _path;
        public string Path {
            get
            {
                return _path;
            }
            set
            {
                _path = value;
                if (_path != null)
                {
                    _path = _path.Replace("/", "-").Replace("\\", "-");
                }

            } }
        public string DocumentTypeFQN { get; set; }
        [System.Runtime.Serialization.IgnoreDataMember()]
        public DocumentWithListInfo Document { get; set; }

        /// <summary>
        /// if true documents outside the date range of the current request will be returned.
        /// </summary>
        public bool? IncludeInactiveDocument { get; set; }

        public string PublishState { get; set; }
    }

    public class DocListFlags
    {
        public bool SupportsPublishing { get; set; }
        public bool EnablePublishing { get; set; }
        public bool SupportsActiveDateRange { get; set; }
        public bool EnableActiveDateRange { get; set; }
    }

    public class DocumentWithListInfo : Mozu.Content.Contracts.Document{
        public DocListFlags ListFlags { get; set; }
    }
}
