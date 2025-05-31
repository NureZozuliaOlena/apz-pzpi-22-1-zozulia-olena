import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { createUser } from '../../../http/userApi';
import { Modal, Button } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { ICompany } from '../../../interfaces/ICompany';
import { getCompanies } from '../../../http/companyApi';
import { ISelect } from '../../../interfaces/ISelect';
import { useTranslation } from 'react-i18next';

interface IProps {
  show: boolean,
  onHide: () => void,
  fetch: () => void,
}

export interface IUserCreateData {
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

export const UserCreateModal = ({ show, onHide, fetch }: IProps) => {
  const { t } = useTranslation();

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IUserCreateData>();

  const [companies, setCompanies] = useState<ICompany[]>([]);

  const handleClose = () => {
    reset({});
    onHide();
  }

  const onSubmit = async (data: IUserCreateData) => {
    await createUser({ ...data, id: uuidv4(), role: +data.role })
      .then(() => {
        handleClose();
        fetch();
      })
      .catch(() => alert(t("users.error") || "Error"));
  };

  const fetchCompanies = async () => {
    await getCompanies().then((data) => setCompanies(data));
  }

  useEffect(() => {
    if (show) {
      fetchCompanies();
    }
  }, [show]);

  const selectCompanies = useMemo<ISelect[]>(() => {
    return [
      { value: "0", label: t("users.createModal.selectCompany") },
      ...companies.map((company) => ({
        value: company.id.toString(),
        label: company.name,
      })),
    ];
  }, [companies, t]);

  return (
    <Modal show={show} onHide={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>{t("users.createModal.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label className="control-label">{t("users.createModal.firstName")}</label>
            <Controller
              control={control}
              name={"firstName"}
              rules={{
                required: t("users.createModal.firstNameRequired"),
              }}
              render={({ field }) => (
                <input className="form-control" {...field} />
              )}
            />
            <p style={{ color: "red" }}>{errors.firstName?.message}</p>
          </div>

          <div className="form-group">
            <label className="control-label">{t("users.createModal.lastName")}</label>
            <Controller
              control={control}
              name={"lastName"}
              rules={{
                required: t("users.createModal.lastNameRequired"),
              }}
              render={({ field }) => (
                <input className="form-control" {...field} />
              )}
            />
            <p style={{ color: "red" }}>{errors.lastName?.message}</p>
          </div>

          <div className="form-group">
            <label className="control-label">{t("users.createModal.dateOfBirth")}</label>
            <Controller
              control={control}
              name={"dateOfBirth"}
              rules={{
                required: t("users.createModal.dateOfBirthRequired") || t("users.createModal.dateOfBirth"),
              }}
              render={({ field }) => (
                <input type="datetime-local" className="form-control" {...field} />
              )}
            />
            <p style={{ color: "red" }}>{errors.dateOfBirth?.message}</p>
          </div>

          <div className="form-group">
            <label className="control-label">{t("users.createModal.phoneNumber")}</label>
            <Controller
              control={control}
              name={"phoneNumber"}
              rules={{
                required: t("users.createModal.phoneNumberRequired") || t("users.createModal.phoneNumber"),
              }}
              render={({ field }) => (
                <input className="form-control" {...field} />
              )}
            />
            <p style={{ color: "red" }}>{errors.phoneNumber?.message}</p>
          </div>

          <div className="form-group">
            <label className="control-label">{t("users.createModal.email")}</label>
            <Controller
              control={control}
              name={"email"}
              rules={{
                required: t("users.createModal.emailRequired"),
              }}
              render={({ field }) => (
                <input className="form-control" {...field} />
              )}
            />
            <p style={{ color: "red" }}>{errors.email?.message}</p>
          </div>

          <div className="form-group">
            <label className="control-label">{t("users.createModal.passwordHash")}</label>
            <Controller
              control={control}
              name={"passwordHash"}
              rules={{
                required: t("users.createModal.passwordHashRequired") || t("users.createModal.passwordHash"),
              }}
              render={({ field }) => (
                <input type="password" className="form-control" {...field} />
              )}
            />
            <p style={{ color: "red" }}>{errors.passwordHash?.message}</p>
          </div>

          <div className="form-group">
            <label className="control-label">{t("users.createModal.role")}</label>
            <Controller
              control={control}
              name={"role"}
              rules={{
                required: t("users.createModal.roleRequired") || t("users.createModal.role"),
              }}
              render={({ field }) => (
                <select className="form-control" {...field}>
                  <option value={0}>{t("roles.admin")}</option>
                  <option value={1}>{t("roles.contractor")}</option>
                  <option value={2}>{t("roles.employee")}</option>
                  <option value={3}>{t("roles.superAdmin")}</option>
                </select>
              )}
            />
            <p style={{ color: "red" }}>{errors.role?.message}</p>
          </div>

          <div className="form-group">
            <label className="control-label">{t("users.createModal.companyId")}</label>
            <Controller
              control={control}
              name={"companyId"}
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
            <p style={{ color: "red" }}>{errors.companyId?.message}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t("users.createModal.close")}
          </Button>
          <Button variant="primary" type="submit">
            {t("users.createModal.save")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
