import { $authhost } from ".";
import { ICompanyCreateData } from "../components/Models/Company/CompanyCreateModal";
import { ICompanyEditData } from "../components/Models/Company/CompanyEditModal";

export const getCompanies = async () => {
    const { data } = await $authhost.get('api/Company')
    return data;
}

export const createCompany = async (formData: ICompanyCreateData) => {
    const { data } = await $authhost.post('api/Company', formData)
    return data;
}

export const editCompany = async (id: string, formData: ICompanyEditData) => {
    const { data } = await $authhost.put(`api/Company/${id}`, formData)
    return data;
}

export const deleteCompany = async (id: string) => {
    const { data } = await $authhost.delete(`api/Company/${id}`)
    return data;
}
