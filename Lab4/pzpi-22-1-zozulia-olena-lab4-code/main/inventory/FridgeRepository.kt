package com.example.smart_lunch.inventory

import android.content.Context
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.smart_lunch.core.RetrofitInstance
import com.example.smart_lunch.dto.FoodItemDto
import com.example.smart_lunch.dto.FridgeDto
import com.example.smart_lunch.dto.FridgeInventoryDto

class FridgeRepository(private val context: Context) {

    private val _fridges = MutableLiveData<List<FridgeDto>>()
    val fridges: LiveData<List<FridgeDto>> = _fridges

    private val _inventories = MutableLiveData<List<FridgeInventoryDto>>()
    val inventories: LiveData<List<FridgeInventoryDto>> = _inventories

    private val _foodItems = MutableLiveData<List<FoodItemDto>>()
    val foodItems: LiveData<List<FoodItemDto>> = _foodItems

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    suspend fun loadFridges() {
        try {
            val response = RetrofitInstance.getApi().getFridges()
            if (response.isSuccessful) {
                _fridges.postValue(response.body() ?: emptyList())
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e("FRIDGE_LOAD", "Response code: ${response.code()}, error: $errorBody")
                _error.postValue("Failed to load fridges: $errorBody")
            }
        } catch (e: Exception) {
            Log.e("FRIDGE_LOAD", "Exception: ${e.message}")
            _error.postValue("Error loading fridges: ${e.message}")
        }
    }

    suspend fun loadInventories() {
        try {
            val response = RetrofitInstance.getApi().getFridgeInventories()
            if (response.isSuccessful) {
                _inventories.postValue(response.body() ?: emptyList())
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e("INVENTORY_LOAD", "Response code: ${response.code()}, error: $errorBody")
                _error.postValue("Failed to load inventories: $errorBody")
            }
        } catch (e: Exception) {
            Log.e("INVENTORY_LOAD", "Exception: ${e.message}")
            _error.postValue("Error loading inventories: ${e.message}")
        }
    }

    suspend fun loadFoodItems() {
        try {
            val response = RetrofitInstance.getApi().getFoodItems()
            if (response.isSuccessful) {
                _foodItems.postValue(response.body() ?: emptyList())
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e("FOODITEM_LOAD", "Response code: ${response.code()}, error: $errorBody")
                _error.postValue("Failed to load food items: $errorBody")
            }
        } catch (e: Exception) {
            Log.e("FOODITEM_LOAD", "Exception: ${e.message}")
            _error.postValue("Error loading food items: ${e.message}")
        }
    }
}
