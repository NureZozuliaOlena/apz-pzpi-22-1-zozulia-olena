import { $authhost } from ".";
import { IFridgeCreateData } from "../components/Models/Fridge/FridgeCreateModal";
import { IFridgeEditData } from "../components/Models/Fridge/FridgeEditModal";

export const getFridges = async () => {
    const { data } = await $authhost.get('api/Fridge')
    return data;
}

export const createFridge = async (formData: IFridgeCreateData) => {
    const { data } = await $authhost.post('api/Fridge', formData)
    return data;
}

export const editFridge = async (id: string, formData: IFridgeEditData) => {
    const { data } = await $authhost.put(`api/Fridge/${id}`, formData)
    return data;
}

export const deleteFridge = async (id: string) => {
    const { data } = await $authhost.delete(`api/Fridge/${id}`)
    return data;
}
