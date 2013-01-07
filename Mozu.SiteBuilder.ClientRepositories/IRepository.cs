namespace Volusion.SiteBuilder.ClientRepositories
{
	public interface IRepository<T>
	{
		T Get(object id);
		T Update(T entity);
		T Create(T entity);
		void Delete(object id);
	}
}