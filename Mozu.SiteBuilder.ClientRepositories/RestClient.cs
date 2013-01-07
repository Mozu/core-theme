using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;

namespace Volusion.SiteBuilder.ClientRepositories
{
	public class RestRequest<T> : HttpRequestMessage<T>
	{
		readonly Dictionary<string, string> _parameters = new Dictionary<string, string>();

		public void AddParameter(KeyValuePair<string, string> keyValuePair)
		{
			_parameters.Add(keyValuePair.Key, keyValuePair.Value);	
		}


	}
}
