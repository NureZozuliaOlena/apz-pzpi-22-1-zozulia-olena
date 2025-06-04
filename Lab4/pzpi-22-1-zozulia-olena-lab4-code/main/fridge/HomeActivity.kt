package com.example.smart_lunch.fridge

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.smart_lunch.core.MainActivity
import com.example.smart_lunch.R
import com.example.smart_lunch.core.RetrofitInstance
import com.example.smart_lunch.auth.SessionManager
import kotlinx.coroutines.launch
import com.example.smart_lunch.dto.FoodItemDto
import com.example.smart_lunch.dto.FridgeInventoryDto
import com.example.smart_lunch.dto.OrderDto
import com.example.smart_lunch.dto.OrderItemDto
import com.example.smart_lunch.inventory.FridgeRepository
import com.example.smart_lunch.inventory.FridgeWithInventoryAdapter
import com.example.smart_lunch.orders.AdminOrdersActivity
import com.example.smart_lunch.orders.UserOrdersActivity
import com.google.android.material.bottomnavigation.BottomNavigationView

class HomeActivity : AppCompatActivity() {

    private lateinit var fridgeRepository: FridgeRepository
    private lateinit var fridgeAdapter: FridgeWithInventoryAdapter

    private var foodItemsList: List<FoodItemDto> = emptyList()
    private var inventoriesList: List<FridgeInventoryDto> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)

        RetrofitInstance.initialize(this)

        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNavigation)
        val sharedPref = getSharedPreferences("auth", MODE_PRIVATE)
        val userRole = sharedPref.getString("userRole", null)

        Log.d("HomeActivity", "User role: $userRole")

        if (userRole == "2") {
            setContentView(R.layout.activity_home)
            setupBottomNavForEmployee()
            setupFridgeView()
        } else if (userRole == "0") {
            startActivity(Intent(this, AdminOrdersActivity::class.java))
            finish()

        } else if (userRole == "3") {
            startActivity(Intent(this, AdminOrdersActivity::class.java))
            finish()

        } else {
            bottomNav.visibility = View.GONE
            Log.e("HomeActivity", "Невідома роль: $userRole")
        }
            fridgeRepository = FridgeRepository(applicationContext)

        fridgeAdapter = FridgeWithInventoryAdapter(emptyList(), emptyList(), emptyList()) { inventory ->
            placeOrder(inventory)
        }

        val fridgeRecyclerView = findViewById<RecyclerView>(R.id.fridgeRecyclerView)
        fridgeRecyclerView.layoutManager = LinearLayoutManager(this)
        fridgeRecyclerView.adapter = fridgeAdapter

        observeData()

        lifecycleScope.launch {
            fridgeRepository.loadFridges()
            fridgeRepository.loadInventories()
            fridgeRepository.loadFoodItems()
        }
    }

    private fun observeData() {
        fridgeRepository.foodItems.observe(this) { foodItems ->
            foodItemsList = foodItems ?: emptyList()
            updateAdapter()
        }

        fridgeRepository.inventories.observe(this) { inventories ->
            inventoriesList = inventories ?: emptyList()
            updateAdapter()
        }

        fridgeRepository.error.observe(this) { error ->
            if (error != null) {
                Toast.makeText(this, error, Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun updateAdapter() {
        val fridges = fridgeRepository.fridges.value ?: emptyList()
        fridgeAdapter.updateData(fridges, inventoriesList, foodItemsList)
    }

    private fun placeOrder(inventory: FridgeInventoryDto) {
        val sharedPref = getSharedPreferences("auth", MODE_PRIVATE)
        val userId = sharedPref.getString("userId", null)

        if (userId == null) {
            Toast.makeText(this, getString(R.string.user_not_found), Toast.LENGTH_SHORT).show()
            return
        }

        val foodItem = foodItemsList.find { it.id == inventory.foodItemId }
        val price = foodItem?.price ?: 0.0

        if (price <= 0.0) {
            Toast.makeText(this, getString(R.string.price_not_found), Toast.LENGTH_SHORT).show()
            return
        }

        val orderItem = OrderItemDto(
            fridgeInventoryId = inventory.id.toString(),
            quantity = 1,
            price = price
        )

        val order = OrderDto(
            userId = userId,
            fridgeId = inventory.fridgeId.toString(),
            totalAmount = price,
            items = listOf(orderItem)
        )

        lifecycleScope.launch {
            try {
                val response = RetrofitInstance.getApi().createOrder(order)
                if (response.isSuccessful) {
                    Toast.makeText(this@HomeActivity, getString(R.string.order_created), Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@HomeActivity, "${getString(R.string.error)}: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@HomeActivity, "${getString(R.string.error)}: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupBottomNavForEmployee() {
        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNavigation)
        bottomNav.menu.clear()
        bottomNav.inflateMenu(R.menu.bottom_nav_menu_employee)
        bottomNav.visibility = View.VISIBLE

        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_fridges -> true
                R.id.nav_orders -> {
                    startActivity(Intent(this, UserOrdersActivity::class.java))
                    true
                }
                R.id.nav_logout -> {
                    SessionManager.clearToken(this)
                    startActivity(Intent(this, MainActivity::class.java))
                    finish()
                    true
                }
                else -> false
            }
        }
    }

    private fun setupFridgeView() {
        fridgeRepository = FridgeRepository(applicationContext)
        fridgeAdapter = FridgeWithInventoryAdapter(emptyList(), emptyList(), emptyList()) { inventory ->
            placeOrder(inventory)
        }

        val fridgeRecyclerView = findViewById<RecyclerView>(R.id.fridgeRecyclerView)
        fridgeRecyclerView.layoutManager = LinearLayoutManager(this)
        fridgeRecyclerView.adapter = fridgeAdapter

        observeData()

        lifecycleScope.launch {
            fridgeRepository.loadFridges()
            fridgeRepository.loadInventories()
            fridgeRepository.loadFoodItems()
        }
    }

}