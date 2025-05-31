import React, { useEffect } from 'react'
import { Button, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { editCompany } from '../../../http/companyApi';
import { ICompany } from '../../../interfaces/ICompany';
import { ICompanyCreateData } from './CompanyCreateModal';
import { useTranslation } from 'react-i18next';

interface IProps {
    show: boolean,
    onHide: () => void,
    fetch: () => void,
    item?: ICompany,
}

export interface ICompanyEditData extends ICompanyCreateData {
    id: string,
    name: string,
    address: string,
    contactEmail: string
}

export const CompanyEditModal = ({ show, onHide, item, fetch }: IProps) => {
    const { t } = useTranslation();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
      } = useForm<ICompanyEditData>();
    
      useEffect(() => {
        if (item) {
          reset({
            ...item
          });
        }
      }, [item, reset]);
          
      const onSubmit = async (data: ICompanyEditData) => {
        await editCompany(data.id, data)
          .then(() => {
            onHide();
            fetch();
          })
          .catch(() => alert(t('error')));
      };


    return (
        <Modal show={show} onHide={onHide}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header closeButton>
                <Modal.Title>{t('companies.editModal.title')}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div
                  asp-validation-summary="ModelOnly"
                  className="text-danger"
                ></div>
                 <div className="form-group">
                  <label className="control-label">{t('companies.createModal.name')}</label>
                  <Controller
                    control={control}
                    name={"name"}
                    rules={{
                      required: t('companies.createModal.nameRequired'),
                    }}
                    render={({ field }) => (
                      <input className="form-control" {...field} />
                    )}
                  ></Controller>
                  <p style={{ color: "red" }}>{errors.name?.message}</p>
                </div>
                 <div className="form-group">
                                  <label className="control-label">{t('companies.createModal.address')}</label>
                                  <Controller
                                    control={control}
                                    name={"address"}
                                    rules={{
                                      required: t('companies.createModal.addressRequired'),
                                    }}
                                    render={({ field }) => (
                                      <input className="form-control" {...field} />
                                    )}
                                  ></Controller>
                                  <p style={{ color: "red" }}>{errors.address?.message}</p>
                                </div>
                                 <div className="form-group">
                                  <label className="control-label">{t('companies.createModal.contactEmail')}</label>
                                  <Controller
                                    control={control}
                                    name={"contactEmail"}
                                    rules={{
                                      required: t('companies.createModal.emailRequired'),
                                    }}
                                    render={({ field }) => (
                                      <input className="form-control" {...field} />
                                    )}
                                  ></Controller>
                                  <p style={{ color: "red" }}>{errors.contactEmail?.message}</p>
                                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                  {t('companies.createModal.close')}
                </Button>
                <Button variant="primary" type="submit">
                  {t('companies.createModal.save')}
                </Button>
              </Modal.Footer>
            </form>
          </Modal>
      )
}
