
using System.Threading.Tasks;

namespace Volusion.SiteBuilder.ClientRepositories.ServiceClient
{
	public interface IServiceClient<T> where T : class {}

	public interface IRepositoryServiceClient<T> : IServiceClient<T> where T : class
	{
		T Get(object id);
		T Update(T entity);
		T Create(T entity);
		void Delete(object id);
	}

	public interface IRepositoryServiceClientAsync<T> : IServiceClient<T> where T : class
	{
		Task<T> GetAsync(object id);
		Task<T> UpdateAsync(T entity);
		Task<T> CreateAsync(T entity);
		Task DeleteAsync(object id);
	}
}
