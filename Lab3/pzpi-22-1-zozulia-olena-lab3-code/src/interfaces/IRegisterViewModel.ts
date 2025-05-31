export interface IRegisterViewModel {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: "SuperAdmin" | "Admin" | "Contractor" | "Employee";
  companyId?: string;
}
