import { ICompany } from "./ICompany";

export interface IUser {
    id: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    phoneNumber: string,
    email: string,
    passwordHash: string,
    role: number,
    companyId: string,
    company: ICompany,
}