using System;
using System.Collections.Generic;
using System.Web.Script.Serialization;

namespace Volusion.SiteBuilder.ClientRepositories
{
	public class JsonResourceUriMappingProvider : IResourceUriMappingProvider
	{
		private readonly string _jsonResourceUriMappings;
		private readonly Dictionary<string, Uri> _mappings = new Dictionary<string, Uri>();

		public JsonResourceUriMappingProvider(string jsonResourceUriMappings)
		{
			_jsonResourceUriMappings = jsonResourceUriMappings;
			var mappings = new JavaScriptSerializer().Deserialize<IEnumerable<ResourceUriMapping>>(_jsonResourceUriMappings);

			if (mappings == null) return;

			foreach (var resourceUriMapping in mappings)
			{
				_mappings.Add(resourceUriMapping.Name, new Uri(resourceUriMapping.Uri));
			}
		}

		public IDictionary<string, Uri> GetResourceMappings()
		{
			return _mappings;
		}
	}
}