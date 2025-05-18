using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.DTO;
using Repositories;
using Service;

namespace Controllers
{
    [Authorize(Roles = "SuperAdmin,Admin,Contractor")]
    [ApiController]
    [Route("api/[controller]")]
    public class FridgeInventoryController : ControllerBase
    {
        private readonly IFridgeInventoryRepository _fridgeInventoryRepository;
        private readonly IFridgeRepository _fridgeRepository;
        private readonly IMapper _mapper;
        private readonly PredictionService _predictionService;
        private readonly SmartLunchDbContext _context;

        public FridgeInventoryController(
            IFridgeInventoryRepository fridgeInventoryRepository,
            IFridgeRepository fridgeRepository,
            IMapper mapper,
            PredictionService predictionService,
            SmartLunchDbContext context)
        {
            _fridgeInventoryRepository = fridgeInventoryRepository;
            _fridgeRepository = fridgeRepository;
            _mapper = mapper;
            _predictionService = predictionService;
            _context = context;
        }

        private string GetUserRole() =>
            User.FindFirst(ClaimTypes.Role)?.Value;

        private Guid? GetCompanyIdFromClaims()
        {
            var companyIdStr = User.FindFirst("CompanyId")?.Value;
            return Guid.TryParse(companyIdStr, out var id) ? id : null;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var role = GetUserRole();

            if (role == "SuperAdmin")
            {
                var fridgeInventories = await _fridgeInventoryRepository.GetAllAsync();
                var fridgeInventoryDtos = _mapper.Map<List<FridgeInventoryDto>>(fridgeInventories);
                return Ok(fridgeInventoryDtos);
            }
            else
            {
                var companyId = GetCompanyIdFromClaims();
                if (companyId == null) return Forbid("Invalid or missing CompanyId");

                var inventories = await _context.FridgeInventories
                    .Include(fi => fi.Fridge)
                    .Where(fi => fi.Fridge.CompanyId == companyId)
                    .ToListAsync();

                var dtos = _mapper.Map<List<FridgeInventoryDto>>(inventories);
                return Ok(dtos);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var fridgeInventory = await _fridgeInventoryRepository.GetByIdAsync(id);
            if (fridgeInventory == null)
            {
                return NotFound();
            }

            var role = GetUserRole();
            if (role != "SuperAdmin")
            {
                var companyId = GetCompanyIdFromClaims();
                if (companyId == null) return Forbid("Invalid or missing CompanyId");

                if (fridgeInventory.Fridge.CompanyId != companyId)
                    return Forbid("Access denied.");
            }

            var fridgeInventoryDto = _mapper.Map<FridgeInventoryDto>(fridgeInventory);
            return Ok(fridgeInventoryDto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FridgeInventoryDto fridgeInventoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var fridge = await _fridgeRepository.GetByIdAsync(fridgeInventoryDto.FridgeId);
            if (fridge == null)
            {
                return NotFound($"Fridge with ID {fridgeInventoryDto.FridgeId} not found.");
            }

            var role = GetUserRole();
            if (role != "SuperAdmin")
            {
                var companyId = GetCompanyIdFromClaims();
                if (companyId == null) return Forbid("Invalid or missing CompanyId");

                if (fridge.CompanyId != companyId)
                    return Forbid("You cannot add inventory to a fridge outside your company.");
            }

            var fridgeInventory = _mapper.Map<FridgeInventory>(fridgeInventoryDto);
            await _fridgeInventoryRepository.AddAsync(fridgeInventory);

            var createdFridgeInventoryDto = _mapper.Map<FridgeInventoryDto>(fridgeInventory);
            return CreatedAtAction(nameof(GetById), new { id = createdFridgeInventoryDto.Id }, createdFridgeInventoryDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] FridgeInventoryDto fridgeInventoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingFridgeInventory = await _fridgeInventoryRepository.GetByIdAsync(id);
            if (existingFridgeInventory == null)
            {
                return NotFound($"FridgeInventory with ID {id} not found.");
            }

            var fridge = await _fridgeRepository.GetByIdAsync(fridgeInventoryDto.FridgeId);
            if (fridge == null)
            {
                return NotFound($"Fridge with ID {fridgeInventoryDto.FridgeId} not found.");
            }

            var role = GetUserRole();
            if (role != "SuperAdmin")
            {
                var companyId = GetCompanyIdFromClaims();
                if (companyId == null) return Forbid("Invalid or missing CompanyId");

                if (existingFridgeInventory.Fridge.CompanyId != companyId || fridge.CompanyId != companyId)
                    return Forbid("Access denied.");
            }

            _mapper.Map(fridgeInventoryDto, existingFridgeInventory);
            await _fridgeInventoryRepository.UpdateAsync(existingFridgeInventory);

            var updatedFridgeInventoryDto = _mapper.Map<FridgeInventoryDto>(existingFridgeInventory);
            return Ok(updatedFridgeInventoryDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var fridgeInventory = await _fridgeInventoryRepository.GetByIdAsync(id);
            if (fridgeInventory == null)
            {
                return NotFound();
            }

            var role = GetUserRole();
            if (role != "SuperAdmin")
            {
                var companyId = GetCompanyIdFromClaims();
                if (companyId == null) return Forbid("Invalid or missing CompanyId");

                if (fridgeInventory.Fridge.CompanyId != companyId)
                    return Forbid("Access denied.");
            }

            await _fridgeInventoryRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
