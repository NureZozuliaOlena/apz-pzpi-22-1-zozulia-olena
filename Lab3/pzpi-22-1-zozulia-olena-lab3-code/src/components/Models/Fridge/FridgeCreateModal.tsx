import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { createFridge } from '../../../http/fridgeApi';
import { Modal, Button } from 'react-bootstrap';
import { ISelect } from '../../../interfaces/ISelect';
import { ICompany } from '../../../interfaces/ICompany';
import { getCompanies } from '../../../http/companyApi';
import { useTranslation } from 'react-i18next';

interface IProps {
    show: boolean,
    onHide: () => void,
    fetch: () => void,
}

export interface IFridgeCreateData {
    companyId: string,
    minTemperature: number,
    minInventoryLevel: number,
    lastRestocked: string
}

export const FridgeCreateModal = ({ show, onHide, fetch }: IProps) => {
    const { control, reset, handleSubmit, formState: { errors } } = useForm<IFridgeCreateData>();
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const { t } = useTranslation();

    const handleClose = () => {
        reset({});
        onHide();
    }

    const onSubmit = async (data: IFridgeCreateData) => {
        try {
            await createFridge(data);
            handleClose();
            fetch();
        } catch {
            alert(t('companies.error'));
        }
    };

    const fetchCompanies = async () => {
        const data = await getCompanies();
        setCompanies(data);
    };

    useEffect(() => {
        fetchCompanies();
    }, [show]);

    const selectCompanies = useMemo<ISelect[]>(() => [
        { value: "0", label: t('fridges.createModal.selectCompany') },
        ...companies.map(company => ({
            value: company.id.toString(),
            label: company.name,
        }))
    ], [companies, t]);

    return (
        <Modal show={show} onHide={handleClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('fridges.createModal.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group">
                        <label>{t('fridges.createModal.company')}</label>
                        <Controller
                            control={control}
                            name="companyId"
                            rules={{
                                required: t('fridges.createModal.companyRequired'),
                                validate: (value) => value !== "0" || t('fridges.createModal.companyRequired'),
                            }}
                            render={({ field }) => (
                                <select className="form-control" {...field}>
                                    {selectCompanies.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            )}
                        />
                        <p className="text-danger">{errors.companyId?.message}</p>
                    </div>

                    <div className="form-group">
                        <label>{t('fridges.createModal.minInventory')}</label>
                        <Controller
                            control={control}
                            name="minInventoryLevel"
                            rules={{
                                required: t('fridges.createModal.minInventoryRequired'),
                                min: {
                                    value: 0,
                                    message: t('fridges.createModal.minInventoryMin')
                                }
                            }}
                            render={({ field }) => (
                                <input type="number" className="form-control" {...field} />
                            )}
                        />
                        <p className="text-danger">{errors.minInventoryLevel?.message}</p>
                    </div>

                    <div className="form-group">
                        <label>{t('fridges.createModal.minTemperature')}</label>
                        <Controller
                            control={control}
                            name="minTemperature"
                            rules={{
                                required: t('fridges.createModal.minTemperatureRequired'),
                                min: { value: -50, message: t('fridges.createModal.minTemperatureMin') },
                                max: { value: 50, message: t('fridges.createModal.minTemperatureMax') },
                            }}
                            render={({ field }) => (
                                <input type="number" className="form-control" {...field} />
                            )}
                        />
                        <p className="text-danger">{errors.minTemperature?.message}</p>
                    </div>

                    <div className="form-group">
                        <label>{t('fridges.createModal.lastRestocked')}</label>
                        <Controller
                            control={control}
                            name="lastRestocked"
                            rules={{ required: t('fridges.createModal.lastRestockedRequired') }}
                            render={({ field }) => (
                                <input type="datetime-local" className="form-control" {...field} />
                            )}
                        />
                        <p className="text-danger">{errors.lastRestocked?.message}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        {t('fridges.createModal.close')}
                    </Button>
                    <Button variant="primary" type="submit">
                        {t('fridges.createModal.save')}
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}
