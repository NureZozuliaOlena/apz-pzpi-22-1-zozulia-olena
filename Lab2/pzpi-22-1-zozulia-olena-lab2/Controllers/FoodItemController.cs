using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.DTO;
using Repositories;

namespace Controllers
{
    [Authorize(Roles = "Admin,Contractor")]
    [ApiController]
    [Route("api/[controller]")]
    public class FoodItemController : ControllerBase
    {
        private readonly IFoodItemRepository _foodItemRepository;
        private readonly IMapper _mapper;

        public FoodItemController(IFoodItemRepository foodItemRepository, IMapper mapper)
        {
            _foodItemRepository = foodItemRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var foodItems = await _foodItemRepository.GetAllAsync();
            var foodItemDtos = _mapper.Map<List<FoodItemDto>>(foodItems);
            return Ok(foodItemDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var foodItem = await _foodItemRepository.GetByIdAsync(id);
            if (foodItem == null)
            {
                return NotFound();
            }

            var foodItemDto = _mapper.Map<FoodItemDto>(foodItem);
            return Ok(foodItemDto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FoodItemDto foodItemDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var foodItem = _mapper.Map<FoodItem>(foodItemDto);

            await _foodItemRepository.AddAsync(foodItem);

            var createdFoodItemDto = _mapper.Map<FoodItemDto>(foodItem);
            return CreatedAtAction(nameof(GetById), new { id = createdFoodItemDto.Id }, createdFoodItemDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] FoodItemDto foodItemDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingFoodItem = await _foodItemRepository.GetByIdAsync(id);
            if (existingFoodItem == null)
            {
                return NotFound();
            }

            _mapper.Map(foodItemDto, existingFoodItem);
            await _foodItemRepository.UpdateAsync(existingFoodItem);

            var updatedFoodItemDto = _mapper.Map<FoodItemDto>(existingFoodItem);
            return Ok(updatedFoodItemDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var foodItem = await _foodItemRepository.GetByIdAsync(id);
            if (foodItem == null)
            {
                return NotFound();
            }

            await _foodItemRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
