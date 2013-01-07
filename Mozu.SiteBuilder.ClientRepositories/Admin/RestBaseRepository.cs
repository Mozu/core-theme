using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using Volusion.Core.Logging;
using Volusion.SiteBuilder.ClientRepositories.MediaTypeFormatters;
using Volusion.Core.ErrorHandling;

namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
	public class BaseRepository<T> : IRepository<T>
	{
		protected const string JSON_CONTENT_TYPE = "text/json";
		public Func<T, object> GetId;

		protected MediaTypeWithQualityHeaderValue _jsonMedia = new MediaTypeWithQualityHeaderValue(JSON_CONTENT_TYPE, .50);

		public BaseRepository(IRestRepositoryConfiguration restConfig)
		{
			TenantId = restConfig.TennantId;
            SiteId = restConfig.SiteId;
			BaseUri = new Uri(restConfig.Url);
		}

		public string RelativeUrl { get; set; }

		public Uri BaseUri { get; protected set; }
		public string TenantId { get; protected set; }
        public string SiteId { get; protected set; }
		#region IRepository<T> Members

		public T Get(object id)
		{
			string requestUri = GetRequestUriForId(id);
			return Get(requestUri);
		}

		public T Update(T entity)
		{
			using (HttpClient client = GetServiceClient())
			{
				var content = new ObjectContent<T>(entity, JSON_CONTENT_TYPE);
				string requestUri = GetRequestUriForId(GetId(entity));
				using (HttpResponseMessage resp = client.PutAsync(requestUri, content).Result)
				{
					Validate(resp);
					entity = ToObjectContent<T>(resp.Content).ReadAsAsync().Result;
				}
			}
			return entity;
		}

		public T Create(T entity)
		{
			using (HttpClient client = GetServiceClient())
			{
				var content = new ObjectContent<T>(entity, JSON_CONTENT_TYPE);
				content.Formatters.Insert(0, new JsonNetMediaTypeFormatter());
				string requestUri = String.Format("{0}", RelativeUrl);
				using (HttpResponseMessage resp = client.PostAsync(requestUri, content).Result)
				{
					Validate(resp);
					entity = ToObjectContent<T>(resp.Content).ReadAsAsync<T>().Result;
				}
			}
			return entity;
		}

		public void Delete(object id)
		{
			bool retVal = true;
			using (HttpClient client = GetServiceClient())
			{
				string requestUri = GetRequestUriForId(id);
				using (HttpResponseMessage resp = client.DeleteAsync(requestUri).Result)
				{
					Validate(resp);
					retVal = resp.IsSuccessStatusCode;
				}
			}
		}

		/*public TCollection List<TCollection>()
		{
			using (HttpClient client = GetServiceClient())
			{
				using (HttpResponseMessage resp = client.GetAsync(RelativeUrl).Result)
				{
					Validate(resp);
					return ToObjectContent<TCollection>(resp.Content).ReadAsAsync().Result;
				}
			}
		}*/

		public IEnumerable<T> List()
		{
			return List(RelativeUrl);
		}

		#endregion

		protected T Get(string requestUri)
		{
			using (HttpClient client = GetServiceClient())
			{
				using (HttpResponseMessage resp = client.GetAsync(requestUri).Result)
				{
					LoggingService.LoggerFor<BaseRepository<T>>().Debug(
						() => String.Format("StatuCode:{0};Headers:{1};Content:{2}", resp.StatusCode, resp.Headers, resp.Content));
					Validate(resp);
					return ToObjectContent<T>(resp.Content).ReadAsAsync<T>().Result;
				}
			}
		}

		protected IEnumerable<T> List(string requestUri)
		{
			using (HttpClient client = GetServiceClient())
			{
				using (HttpResponseMessage resp = client.GetAsync(requestUri).Result)
				{
					Validate(resp);
					return ToObjectContent<List<T>>(resp.Content).ReadAsAsync().Result;
				}
			}
		}

		protected string GetRequestUriForId(object id)
		{
			return String.Format("{0}/{1}", RelativeUrl, id);
		}

		protected ObjectContent<V> ToObjectContent<V>(HttpContent cnt)
		{
			ObjectContent oc = new ObjectContent<V>(cnt);
			oc.Formatters.Insert(0, new JsonNetMediaTypeFormatter());
			return (ObjectContent<V>) oc;
		}

		protected HttpClient GetServiceClient()
		{
			var client = new HttpClient
			             	{
			             		BaseAddress = BaseUri,
			             	};

			client.DefaultRequestHeaders.Add("tenant", TenantId.ToString());
			client.DefaultRequestHeaders.Accept.Add(_jsonMedia);
			return client;
		}

		protected void Validate(HttpResponseMessage msg)
		{
			if (!msg.IsSuccessStatusCode)
			{
				if (msg.StatusCode == HttpStatusCode.NotFound)
				{
					return;
				}
                var error  = msg.Content.ReadAsAsync<Volusion.Api.Contracts.ErrorCollection>().Result;

                if (error.ExceptionDetail.Type == "Volusion.Core.ErrorHandling.VolusionApplicationException")
                {
                    var apError = new ApplicationError ( new ErrorCode ( "", error.Items[0].MajorCode) , new ErrorCode ( "", error.Items[0].MinorCode), msg.StatusCode , error.Items[0].Message, error.Items[0].Property );
                    
                    
                    var ex = new VolusionApplicationException( apError);
                    

                    throw ex;
                }
                else if ( error.ExceptionDetail.Type == "VolusionApplicationAggregateException")
                {
                    var apError = new ApplicationError(new ErrorCode("", error.Items[0].MajorCode), new ErrorCode("", error.Items[0].MinorCode), msg.StatusCode, error.Items[0].Message, error.Items[0].Property);

                    
                    var ex = new VolusionApplicationException( apError);
                    throw ex;
                }
               
			}
		}
	}
}