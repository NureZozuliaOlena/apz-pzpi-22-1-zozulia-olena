package com.example.smart_lunch.inventory

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.smart_lunch.R
import com.example.smart_lunch.dto.FoodItemDto
import com.example.smart_lunch.dto.FridgeDto
import com.example.smart_lunch.dto.FridgeInventoryDto

class FridgeWithInventoryAdapter(
    private var fridges: List<FridgeDto>,
    private var inventories: List<FridgeInventoryDto>,
    private var foodItems: List<FoodItemDto>,
    private val onOrderClick: (FridgeInventoryDto) -> Unit
) : RecyclerView.Adapter<FridgeWithInventoryAdapter.FridgeViewHolder>() {

    inner class FridgeViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val fridgeName: TextView = view.findViewById(R.id.fridgeName)
        val inventoryRecycler: RecyclerView = view.findViewById(R.id.inventoryRecycler)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FridgeViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_fridge_with_inventory, parent, false)
        return FridgeViewHolder(view)
    }

    override fun getItemCount(): Int = fridges.size

    override fun onBindViewHolder(holder: FridgeViewHolder, position: Int) {
        val fridge = fridges[position]
        val context = holder.itemView.context
        holder.fridgeName.text = context.getString(R.string.fridge_number, position + 1)

        val fridgeInventories = inventories.filter { it.fridgeId == fridge.id }

        val adapter = InventoryItemAdapter(fridgeInventories, foodItems, onOrderClick)
        holder.inventoryRecycler.layoutManager = LinearLayoutManager(holder.itemView.context)
        holder.inventoryRecycler.adapter = adapter
    }

    fun updateData(
        newFridges: List<FridgeDto>,
        newInventories: List<FridgeInventoryDto>,
        newFoodItems: List<FoodItemDto>
    ) {
        fridges = newFridges
        inventories = newInventories
        foodItems = newFoodItems
        notifyDataSetChanged()
    }
}
