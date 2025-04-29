using Microsoft.EntityFrameworkCore;
using Data;
using Models;

namespace Repositories
{
    public class FridgeInventoryRepository : IFridgeInventoryRepository
    {
        private readonly SmartLunchDbContext _context;

        public FridgeInventoryRepository(SmartLunchDbContext context)
        {
            _context = context;
        }

        public async Task<FridgeInventory> GetByIdAsync(Guid id)
        {
            return await _context.FridgeInventories
                                 .Include(fi => fi.Fridge)
                                 .Include(fi => fi.FoodItem)
                                 .FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<IEnumerable<FridgeInventory>> GetAllAsync()
        {
            return await _context.FridgeInventories
                                 .Include(fi => fi.Fridge)
                                 .Include(fi => fi.FoodItem)
                                 .ToListAsync();
        }

        public async Task AddAsync(FridgeInventory fridgeInventory)
        {
            await _context.FridgeInventories.AddAsync(fridgeInventory);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(FridgeInventory fridgeInventory)
        {
            _context.FridgeInventories.Update(fridgeInventory);
            var result = await _context.SaveChangesAsync();
            Console.WriteLine(result);
        }

        public async Task DeleteAsync(Guid id)
        {
            var fridgeInventory = await _context.FridgeInventories.FindAsync(id);
            if (fridgeInventory != null)
            {
                _context.FridgeInventories.Remove(fridgeInventory);
                await _context.SaveChangesAsync();
            }
        }
    }
}
