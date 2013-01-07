namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
	/// <summary>
	/// TODO: Update summary.
	/// </summary>
	public interface IRestRepositoryConfiguration
	{
        string TennantId { get; set; }
        string SiteId { get; set; }
		string Url { get; set; }
	}
}