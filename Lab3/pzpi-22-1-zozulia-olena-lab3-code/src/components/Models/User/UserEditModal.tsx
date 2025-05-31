import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { editUser } from '../../../http/userApi';
import { IUser } from '../../../interfaces/IUser';
import { IUserCreateData } from './UserCreateModal';
import { ICompany } from '../../../interfaces/ICompany';
import { getCompanies } from '../../../http/companyApi';
import { ISelect } from '../../../interfaces/ISelect';
import { useTranslation } from 'react-i18next';

interface IProps {
  show: boolean;
  onHide: () => void;
  fetch: () => void;
  item?: IUser;
}

export interface IUserEditData extends IUserCreateData {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
}

export const UserEditModal = ({ show, onHide, item, fetch }: IProps) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IUserEditData>();

  const [companies, setCompanies] = useState<ICompany[]>([]);

  useEffect(() => {
    if (item) {
      reset({ ...item });
    }
  }, [item, reset]);

  const onSubmit = async (data: IUserEditData) => {
    await editUser(data.id, { ...data, role: +data.role })
      .then(() => {
        onHide();
        fetch();
      })
      .catch(() => alert(t('users.error')));
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      const data = await getCompanies();
      setCompanies(data);
    };
    if (show) fetchCompanies();
  }, [show]);

  const selectCompanies = useMemo<ISelect[]>(() => {
    return [
      {
        value: '00000000-0000-0000-0000-000000000000',
        label: t('users.createModal.selectCompany'),
      },
      ...companies.map((company) => ({
        value: company.id.toString(),
        label: company.name,
      })),
    ];
  }, [companies, t]);

  return (
    <Modal show={show} onHide={onHide}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('users.editModal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>{t('users.createModal.firstName')}</label>
            <Controller
              control={control}
              name="firstName"
              rules={{ required: t('users.createModal.firstNameRequired') }}
              render={({ field }) => <input className="form-control" {...field} />}
            />
            <p className="text-danger">{errors.firstName?.message}</p>
          </div>

          <div className="form-group">
            <label>{t('users.createModal.lastName')}</label>
            <Controller
              control={control}
              name="lastName"
              rules={{ required: t('users.createModal.lastNameRequired') }}
              render={({ field }) => <input className="form-control" {...field} />}
            />
            <p className="text-danger">{errors.lastName?.message}</p>
          </div>

          <div className="form-group">
            <label>{t('users.createModal.dateOfBirth')}</label>
            <Controller
              control={control}
              name="dateOfBirth"
              rules={{ required: true }}
              render={({ field }) => <input type="datetime-local" className="form-control" {...field} />}
            />
            <p className="text-danger">{errors.dateOfBirth?.message}</p>
          </div>

          <div className="form-group">
            <label>{t('users.createModal.phoneNumber')}</label>
            <Controller
              control={control}
              name="phoneNumber"
              rules={{ required: true }}
              render={({ field }) => <input className="form-control" {...field} />}
            />
            <p className="text-danger">{errors.phoneNumber?.message}</p>
          </div>

          <div className="form-group">
            <label>{t('users.createModal.email')}</label>
            <Controller
              control={control}
              name="email"
              rules={{ required: t('users.createModal.emailRequired') }}
              render={({ field }) => <input className="form-control" {...field} />}
            />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="form-group">
            <label>Password Hash</label>
            <Controller
              control={control}
              name="passwordHash"
              rules={{ required: true }}
              render={({ field }) => <input className="form-control" {...field} />}
            />
            <p className="text-danger">{errors.passwordHash?.message}</p>
          </div>

          <div className="form-group">
            <label>{t('users.createModal.role')}</label>
            <Controller
              control={control}
              name="role"
              rules={{ required: true }}
              render={({ field }) => (
                <select className="form-control" {...field}>
                  <option value={0}>{t("roles.admin")}</option>
                  <option value={1}>{t("roles.contractor")}</option>
                  <option value={2}>{t("roles.employee")}</option>
                  <option value={3}>{t("roles.superAdmin")}</option>
                </select>
              )}
            />
            <p className="text-danger">{errors.role?.message}</p>
          </div>

          <div className="form-group">
            <label>{t('users.createModal.companyId')}</label>
            <Controller
              control={control}
              name="companyId"
              rules={{ required: true }}
              render={({ field }) => (
                <select className="form-control" {...field}>
                  {selectCompanies.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            />
            <p className="text-danger">{errors.companyId?.message}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            {t('users.createModal.close')}
          </Button>
          <Button variant="primary" type="submit">
            {t('users.createModal.save')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
