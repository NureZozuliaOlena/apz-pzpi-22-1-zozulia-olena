using Models;

namespace Repositories
{
    public interface IFridgeInventoryRepository
    {
        Task<FridgeInventory> GetByIdAsync(Guid id);
        Task<IEnumerable<FridgeInventory>> GetAllAsync();
        Task AddAsync(FridgeInventory fridgeInventory);
        Task UpdateAsync(FridgeInventory fridgeInventory);
        Task DeleteAsync(Guid id);
    }
}
