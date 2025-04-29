using Models;

namespace Repositories
{
    public interface IFridgeRepository
    {
        Task<Fridge> GetByIdAsync(Guid id);
        Task<IEnumerable<Fridge>> GetAllAsync();
        Task AddAsync(Fridge fridge);
        Task UpdateAsync(Fridge fridge);
        Task DeleteAsync(Guid id);
    }
}
