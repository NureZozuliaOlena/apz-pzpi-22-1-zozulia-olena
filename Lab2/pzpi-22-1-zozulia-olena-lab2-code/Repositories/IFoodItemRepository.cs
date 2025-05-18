using Models;

namespace Repositories
{
    public interface IFoodItemRepository
    {
        Task<FoodItem> GetByIdAsync(Guid id);
        Task<IEnumerable<FoodItem>> GetAllAsync();
        Task AddAsync(FoodItem foodItem);
        Task UpdateAsync(FoodItem foodItem);
        Task DeleteAsync(Guid id);
    }
}
