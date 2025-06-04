package com.example.smart_lunch.orders

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.smart_lunch.core.BackupActivity
import com.example.smart_lunch.core.MainActivity
import com.example.smart_lunch.R
import com.example.smart_lunch.core.RetrofitInstance
import com.example.smart_lunch.auth.SessionManager
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.launch

class AdminOrdersActivity : AppCompatActivity() {

    private lateinit var ordersRecyclerView: RecyclerView
    private lateinit var ordersAdapter: UserOrdersAdapter
    private lateinit var totalAmountTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_orders)

        ordersRecyclerView = findViewById(R.id.ordersRecyclerView)
        ordersRecyclerView.layoutManager = LinearLayoutManager(this)
        ordersAdapter = UserOrdersAdapter(emptyList())
        ordersRecyclerView.adapter = ordersAdapter

        totalAmountTextView = findViewById(R.id.totalAmountTextView)

        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNavigation)

        val sharedPref = getSharedPreferences("auth", MODE_PRIVATE)
        val userRole = sharedPref.getString("userRole", null)

        if (userRole == "3") {
            bottomNav.menu.clear()
            bottomNav.inflateMenu(R.menu.bottom_nav_menu_superadmin)
        } else {
            bottomNav.menu.clear()
            bottomNav.inflateMenu(R.menu.bottom_nav_menu_admin)
        }

        bottomNav.selectedItemId = R.id.nav_orders

        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_orders -> true
                R.id.nav_backup -> {
                    startActivity(Intent(this, BackupActivity::class.java))
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

        loadAllOrders()
    }

    private fun loadAllOrders() {
        lifecycleScope.launch {
            try {
                val response = RetrofitInstance.getApi().getAllOrders()
                if (response.isSuccessful) {
                    val orders = response.body()
                    if (orders != null) {
                        ordersAdapter.updateOrders(orders)

                        val total = orders.sumOf { it.totalAmount ?: 0.0 }
                        totalAmountTextView.text = "Сума замовлень: %.2f грн".format(total)

                    } else {
                        Toast.makeText(this@AdminOrdersActivity, "Список замовлень порожній", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this@AdminOrdersActivity, "Помилка завантаження замовлень: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminOrdersActivity, "Помилка: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
