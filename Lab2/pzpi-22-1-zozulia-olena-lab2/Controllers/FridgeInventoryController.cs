using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.DTO;
using Repositories;
using Service;

namespace Controllers
{
    [Authorize(Roles = "Admin,Contractor")]
    [ApiController]
    [Route("api/[controller]")]
    public class FridgeInventoryController : ControllerBase
    {
        private readonly IFridgeInventoryRepository _fridgeInventoryRepository;
        private readonly IFridgeRepository _fridgeRepository;
        private readonly IMapper _mapper;
        private readonly PredictionService _predictionService;

        public FridgeInventoryController(
            IFridgeInventoryRepository fridgeInventoryRepository,
            IFridgeRepository fridgeRepository,
            IMapper mapper,
            PredictionService predictionService)
        {
            _fridgeInventoryRepository = fridgeInventoryRepository;
            _fridgeRepository = fridgeRepository;
            _mapper = mapper;
            _predictionService = predictionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var fridgeInventories = await _fridgeInventoryRepository.GetAllAsync();
            var fridgeInventoryDtos = _mapper.Map<List<FridgeInventoryDto>>(fridgeInventories);
            return Ok(fridgeInventoryDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var fridgeInventory = await _fridgeInventoryRepository.GetByIdAsync(id);
            if (fridgeInventory == null)
            {
                return NotFound();
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

            await _fridgeInventoryRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
