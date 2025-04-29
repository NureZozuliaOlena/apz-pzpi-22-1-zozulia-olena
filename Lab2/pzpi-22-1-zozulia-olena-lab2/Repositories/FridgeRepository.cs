using Microsoft.EntityFrameworkCore;
using Data;
using Models;

namespace Repositories
{
    public class FridgeRepository : IFridgeRepository
    {
        private readonly SmartLunchDbContext _context;

        public FridgeRepository(SmartLunchDbContext context)
        {
            _context = context;
        }

        public async Task<Fridge> GetByIdAsync(Guid id)
        {
            return await _context.Fridges
                .Include(f => f.Company)
                .Include(f => f.FridgeInventories)
                .FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<IEnumerable<Fridge>> GetAllAsync()
        {
            return await _context.Fridges
                .Include(f => f.Company)
                .ToListAsync();
        }

        public async Task AddAsync(Fridge fridge)
        {
            await _context.Fridges.AddAsync(fridge);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Fridge fridge)
        {
            _context.Fridges.Update(fridge);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var fridge = await _context.Fridges.FindAsync(id);
            if (fridge != null)
            {
                _context.Fridges.Remove(fridge);
                await _context.SaveChangesAsync();
            }
        }
    }
}
