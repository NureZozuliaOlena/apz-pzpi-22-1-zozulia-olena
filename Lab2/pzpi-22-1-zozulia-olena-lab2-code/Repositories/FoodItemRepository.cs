using Microsoft.EntityFrameworkCore;
using Data;
using Models;

namespace Repositories
{
    public class FoodItemRepository : IFoodItemRepository
    {
        private readonly SmartLunchDbContext _context;

        public FoodItemRepository(SmartLunchDbContext context)
        {
            _context = context;
        }

        public async Task<FoodItem> GetByIdAsync(Guid id)
        {
            return await _context.FoodItems.FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<IEnumerable<FoodItem>> GetAllAsync()
        {
            return await _context.FoodItems.ToListAsync();
        }

        public async Task AddAsync(FoodItem foodItem)
        {
            await _context.FoodItems.AddAsync(foodItem);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(FoodItem foodItem)
        {
            _context.FoodItems.Update(foodItem);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var foodItem = await _context.FoodItems.FindAsync(id);
            if (foodItem != null)
            {
                _context.FoodItems.Remove(foodItem);
                await _context.SaveChangesAsync();
            }
        }
    }
}
