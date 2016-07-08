using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Search
{
    public class SynonymDefinition
    {
        /// <summary>
        /// The unique identifier for the synonym definition
        /// </summary>
        public int? SynonymId { get; set; }

        /// <summary>
        /// bidirectional or unidirectional
        /// </summary>
        public string DefinitionType { get; set; }

        /// <summary>
        /// If key is defined then map is directed
        /// </summary>
        public string Key { get; set; }

        /// <summary>
        /// List of synonyms.  If no key is defined the matches are bidirectional
        /// </summary>
        public List<string> Synonyms { get; set; }
    }
}