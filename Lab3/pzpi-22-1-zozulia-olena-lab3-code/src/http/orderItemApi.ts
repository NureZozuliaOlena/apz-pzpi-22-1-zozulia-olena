import { $authhost } from ".";
import { IOrderitemCreateData } from "../components/Models/OrderItem/OrderitemCreateModal";
import { IOrderitemEditData } from "../components/Models/OrderItem/OrderItemEditModal";


export const getOrderitems = async () => {
    const { data } = await $authhost.get('api/Orderitem')
    return data;
}

export const createOrderitem = async (formData: IOrderitemCreateData) => {
    const { data } = await $authhost.post('api/Orderitem', formData)
    return data;
}

export const editOrderitem = async (id: string, formData: IOrderitemEditData) => {
    const { data } = await $authhost.put(`api/Orderitem/${id}`, formData)
    return data;
}

export const deleteOrderitem = async (id: string) => {
    const { data } = await $authhost.delete(`api/Orderitem/${id}`)
    return data;
}
