import { jwtDecode } from 'jwt-decode';
import { $authhost, $host } from './index'
import { ILoginViewModel } from '../interfaces/ILoginViewModel';

export type ClaimName = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name" | "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
export type UserClaims = {
    [key in ClaimName]:string;
}

export const login = async (loginData: ILoginViewModel) => {
    const { data } = await $host.post('api/Auth/login', loginData)
    localStorage.setItem('token', data.token)
    return jwtDecode(data.token) as UserClaims;
}

export const checkToken = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
     throw new Error();   
    }

    return token;
    const {data} = await $authhost.post('api/auth/checkSignIn')
}