package com.example.smart_lunch.orders

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.smart_lunch.R
import com.example.smart_lunch.dto.OrderDto

class UserOrdersAdapter(private var orders: List<OrderDto>) : RecyclerView.Adapter<UserOrdersAdapter.OrderViewHolder>() {

    class OrderViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val amountText: TextView = view.findViewById(R.id.totalAmount)
        val statusText: TextView = view.findViewById(R.id.paymentStatus)
        val dateText: TextView = view.findViewById(R.id.timestamp)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OrderViewHolder {
        val view =
            LayoutInflater.from(parent.context).inflate(R.layout.item_order, parent, false)
        return OrderViewHolder(view)
    }

    override fun getItemCount(): Int = orders.size

    override fun onBindViewHolder(holder: OrderViewHolder, position: Int) {
        val context = holder.itemView.context
        val order = orders[position]

        holder.amountText.text = context.getString(R.string.amount_format, order.totalAmount)
        holder.statusText.text = context.getString(R.string.status_format, order.paymentStatus)
        holder.dateText.text = context.getString(R.string.date_format, order.timestamp)
    }

    fun updateOrders(newOrders: List<OrderDto>) {
        orders = newOrders
        notifyDataSetChanged()
    }
}
