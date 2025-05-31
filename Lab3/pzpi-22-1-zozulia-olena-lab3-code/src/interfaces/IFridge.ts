import { ICompany } from "./ICompany";

export interface IFridge {
    id: string,
    companyId: string,
    company: ICompany,
    minTemperature: number,
    minInventoryLevel: number,
    lastRestocked: string
}