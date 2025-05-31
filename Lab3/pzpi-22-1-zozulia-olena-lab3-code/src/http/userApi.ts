import { $authhost } from ".";
import { IUserCreateData } from "../components/Models/User/UserCreateModal";
import { IUserEditData } from "../components/Models/User/UserEditModal";

export const getUsers = async () => {
    const { data } = await $authhost.get('api/User')
    return data;
}

export const createUser = async (formData: IUserCreateData) => {
    const { data } = await $authhost.post('api/User', formData)
    return data;
}

export const editUser = async (id: string, formData: IUserEditData) => {
    const { data } = await $authhost.put(`api/User/${id}`, formData)
    return data;
}

export const deleteUser = async (id: string) => {
    const { data } = await $authhost.delete(`api/User/${id}`)
    return data;
}
