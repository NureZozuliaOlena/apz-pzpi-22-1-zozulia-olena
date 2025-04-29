using Models;

namespace Repositories
{
    public interface ICompanyRepository
    {
        Task<Company> GetByIdAsync(Guid id);
        Task<IEnumerable<Company>> GetAllAsync();
        Task AddAsync(Company company);
        Task UpdateAsync(Company company);
        Task DeleteAsync(Guid id);
    }
}
