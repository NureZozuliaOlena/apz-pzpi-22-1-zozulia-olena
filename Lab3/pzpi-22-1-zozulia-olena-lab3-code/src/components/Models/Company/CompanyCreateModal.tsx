import React from 'react'
import { Controller, useForm } from 'react-hook-form';
import { createCompany } from '../../../http/companyApi';
import {Modal, Button} from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

interface IProps {
    show: boolean,
    onHide: () => void,
    fetch: () => void,
}

export interface ICompanyCreateData {
    id: string,
    name: string,
    address: string,
    contactEmail: string,
}

export const CompanyCreateModal = ({show, onHide, fetch}: IProps) => {
    const { t } = useTranslation();
      const {
        control,
        reset,
        handleSubmit,
        formState: { errors },
      } = useForm<ICompanyCreateData>();
    
      const handleClose = () => {
        reset({})
        onHide();
      }
      
      const onSubmit = async (data: ICompanyCreateData) => {
        await createCompany({...data, id: uuidv4()})
          .then(() => {
            handleClose();
            fetch();
          }).catch(() => alert(t('error')));
      };
          
      return (
        <Modal show={show} onHide={handleClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header closeButton>
                <Modal.Title>{t('companies.createModal.title')}</Modal.Title>
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
                <Button variant="secondary" onClick={handleClose}>
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
