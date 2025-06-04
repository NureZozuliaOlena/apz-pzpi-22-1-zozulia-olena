package com.example.smart_lunch.inventory

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.smart_lunch.dto.FridgeInventoryDto
import com.example.smart_lunch.R
import com.example.smart_lunch.dto.FoodItemDto

class InventoryItemAdapter(
    private val items: List<FridgeInventoryDto>,
    private val foodItems: List<FoodItemDto>,
    private val onOrderClick: (FridgeInventoryDto) -> Unit
) : RecyclerView.Adapter<InventoryItemAdapter.InventoryViewHolder>() {

    class InventoryViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val foodNameTextView: TextView = view.findViewById(R.id.foodItemName)
        val quantityTextView: TextView = view.findViewById(R.id.quantity)
        val orderButton: Button = view.findViewById(R.id.orderButton)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): InventoryViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_inventory, parent, false)
        return InventoryViewHolder(view)
    }

    override fun onBindViewHolder(holder: InventoryViewHolder, position: Int) {
        val item = items[position]
        val foodItem = foodItems.find { it.id == item.foodItemId }
        val foodName = foodItem?.name ?: item.foodItemName ?: holder.itemView.context.getString(R.string.unknown_name)

        holder.foodNameTextView.text = foodName
        holder.quantityTextView.text = holder.itemView.context.getString(R.string.quantity_format, item.quantity)
        holder.orderButton.isEnabled = item.quantity > 0

        holder.orderButton.setOnClickListener {
            onOrderClick(item)
        }
    }

    override fun getItemCount() = items.size
}
