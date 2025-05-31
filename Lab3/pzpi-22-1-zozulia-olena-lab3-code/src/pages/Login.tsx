import React, { useContext } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Context } from '..';
import { MAIN_ROUTE } from '../consts';
import { login } from '../http/authApi';
import { ILoginViewModel } from '../interfaces/ILoginViewModel';
import mapJwtClaims from '../mapJwtClaims';
import styles from '../styles/Login.module.css';
import { useTranslation } from 'react-i18next';

export const Login = () => {
    const { t } = useTranslation();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ILoginViewModel>();
    const contextValue = useContext(Context);
    const navigate = useNavigate();
    const user = contextValue!.user;

    const onSubmit = async (data: ILoginViewModel) => {
        await login(data).then((data) => {
            user.setIsAuth(true);
            user.setUser(mapJwtClaims(data));
            navigate(MAIN_ROUTE);
        }).catch(() => console.log(t('error')));
    };

    return (
        <div className={styles['login-container']}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles['login-form']}>
                <h2 className={styles['form-title']}>{t('login.title')}</h2>

                <div className={styles['form-group']}>
                    <label className={styles['form-label']}>{t('login.email')}</label>
                    <Controller
                        control={control}
                        name="email"
                        rules={{ required: t('login.emailRequired') }}
                        render={({ field }) => (
                            <input 
                                type="email" 
                                className={`${styles['form-input']} ${errors.email ? styles['error'] : ''}`}
                                {...field}
                            />
                        )}
                    />
                    {errors.email && <span className={styles['error-message']}>{errors.email.message}</span>}
                </div>
                
                <div className={styles['form-group']}>
                    <label className={styles['form-label']}>{t('login.password')}</label>
                    <Controller
                        control={control}
                        name="password"
                        rules={{ required: t('login.passwordRequired') }}
                        render={({ field }) => (
                            <input 
                                type="password" 
                                className={`${styles['form-input']} ${errors.password ? styles['error'] : ''}`}
                                {...field}
                            />
                        )}
                    />
                    {errors.password && <span className={styles['error-message']}>{errors.password.message}</span>}
                </div>
                
                <button type="submit" className={styles['submit-button']}>
                    {t('login.submit')}
                </button>
            </form>
        </div>
    );
};