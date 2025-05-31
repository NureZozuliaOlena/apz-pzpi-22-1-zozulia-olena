import React, { useContext } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Context } from '..';
import { MAIN_ROUTE } from '../consts';
import { register as registerUser } from '../http/authApi';
import { IRegisterViewModel } from '../interfaces/IRegisterViewModel';
import styles from '../styles/Login.module.css';
import { useTranslation } from 'react-i18next';

export const Register = () => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<IRegisterViewModel>();
  const contextValue = useContext(Context);
  const navigate = useNavigate();
  const user = contextValue!.user;

  const onSubmit = async (data: IRegisterViewModel) => {
    try {
      await registerUser(data);
      navigate('/login');
    } catch (e) {
      console.error(t('error'));
    }
  };

  return (
    <div className={styles['login-container']}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles['login-form']}>
        <h2 className={styles['form-title']}>{t('register.title')}</h2>

        {[
          { name: 'firstName', type: 'text' },
          { name: 'lastName', type: 'text' },
          { name: 'email', type: 'email' },
          { name: 'password', type: 'password' },
          { name: 'phoneNumber', type: 'text' },
          { name: 'dateOfBirth', type: 'date' },
        ].map(({ name, type }) => (
          <div key={name} className={styles['form-group']}>
            <label className={styles['form-label']}>{t(`register.${name}`)}</label>
            <Controller
              control={control}
              name={name as keyof IRegisterViewModel}
              rules={{ required: t(`register.${name}Required`) }}
              render={({ field }) => (
                <input
                  type={type}
                  className={`${styles['form-input']} ${errors[name as keyof IRegisterViewModel] ? styles['error'] : ''}`}
                  {...field}
                />
              )}
            />
            {errors[name as keyof IRegisterViewModel] && (
              <span className={styles['error-message']}>
                {(errors[name as keyof IRegisterViewModel]?.message as string)}
              </span>
            )}
          </div>
        ))}

        <div className={styles['form-group']}>
          <label className={styles['form-label']}>{t('register.role')}</label>
          <Controller
            control={control}
            name="role"
            rules={{ required: t('register.roleRequired') }}
            render={({ field }) => (
              <select className={styles['form-input']} {...field}>
                <option value="">{t('register.selectRole')}</option>
                <option value="SuperAdmin">SuperAdmin</option>
                <option value="Admin">Admin</option>
                <option value="Contractor">Contractor</option>
                <option value="Employee">Employee</option>
              </select>
            )}
          />
        </div>

        <div className={styles['form-group']}>
          <label className={styles['form-label']}>{t('register.companyId')}</label>
          <Controller
            control={control}
            name="companyId"
            render={({ field }) => (
              <input type="text" className={styles['form-input']} {...field} />
            )}
          />
        </div>

        <button type="submit" className={styles['submit-button']}>
          {t('register.submit')}
        </button>
      </form>
    </div>
  );
};
