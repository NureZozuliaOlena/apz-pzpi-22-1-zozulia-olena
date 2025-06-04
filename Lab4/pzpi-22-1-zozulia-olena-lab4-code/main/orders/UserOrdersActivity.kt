package com.example.smart_lunch.orders

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.smart_lunch.fridge.HomeActivity
import com.example.smart_lunch.core.MainActivity
import com.example.smart_lunch.R
import com.example.smart_lunch.core.RetrofitInstance
import com.example.smart_lunch.auth.SessionManager
import com.example.smart_lunch.dto.OrderDto
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.launch

class UserOrdersActivity : AppCompatActivity() {

    private lateinit var ordersRecyclerView: RecyclerView
    private lateinit var ordersAdapter: UserOrdersAdapter
    private var allOrders: List<OrderDto> = emptyList()
    private var userId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user_orders)

        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNavigation)

        bottomNav.selectedItemId = R.id.nav_orders

        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_fridges -> {
                    startActivity(Intent(this, HomeActivity::class.java))
                    finish()
                    true
                }
                R.id.nav_orders -> {
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

        userId = getSharedPreferences("auth", MODE_PRIVATE).getString("userId", null)
        if (userId == null) {
            Toast.makeText(this, getString(R.string.user_not_found), Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        ordersRecyclerView = findViewById(R.id.ordersRecyclerView)
        ordersRecyclerView.layoutManager = LinearLayoutManager(this)
        ordersAdapter = UserOrdersAdapter(emptyList())
        ordersRecyclerView.adapter = ordersAdapter

        loadOrders()
    }

    private fun loadOrders() {
        val sharedPref = getSharedPreferences("auth", MODE_PRIVATE)
        val userId = sharedPref.getString("userId", null)

        if (userId == null) {
            Toast.makeText(this, getString(R.string.user_id_not_found), Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                val response = RetrofitInstance.getApi().getOrdersByUserId(userId)
                if (response.isSuccessful) {
                    val orders = response.body()
                    if (orders != null) {
                        Log.d("ORDERS", "Отримано замовлень: ${orders.size}")
                    } else {
                        Log.e("ORDERS", "Порожній список замовлень")
                        Toast.makeText(this@UserOrdersActivity, getString(R.string.empty_orders_list), Toast.LENGTH_SHORT).show()
                    }

                    if (orders != null) {
                        Log.d("ORDERS", "Отримано замовлень: ${orders.size}")
                        allOrders = orders
                        ordersAdapter.updateOrders(allOrders)
                    }

                } else {
                    val errorBody = response.errorBody()?.string()
                    Log.e("ORDERS", "Помилка сервера: $errorBody")
                    Toast.makeText(this@UserOrdersActivity, getString(R.string.orders_loading_error), Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Log.e("ORDERS", "Виключення: ${e.message}", e)
                Toast.makeText(this@UserOrdersActivity, getString(R.string.error_with_message, e.message), Toast.LENGTH_SHORT).show()
            }
        }

    }

}
