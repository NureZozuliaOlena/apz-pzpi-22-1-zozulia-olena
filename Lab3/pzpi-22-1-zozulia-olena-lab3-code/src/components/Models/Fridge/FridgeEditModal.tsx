import React, { useEffect, useMemo, useState } from 'react'
import { Button, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { editFridge } from '../../../http/fridgeApi';
import { IFridge } from '../../../interfaces/IFridge';
import { IFridgeCreateData } from './FridgeCreateModal';
import { ICompany } from '../../../interfaces/ICompany';
import { getCompanies } from '../../../http/companyApi';
import { ISelect } from '../../../interfaces/ISelect';
import { useTranslation } from 'react-i18next';

interface IProps {
    show: boolean,
    onHide: () => void,
    fetch: () => void,
    item?: IFridge,
}

export interface IFridgeEditData extends IFridgeCreateData {
    id: string,
    name: string,
    address: string,
    contactEmail: string
}

export const FridgeEditModal = ({ show, onHide, item, fetch }: IProps) => {
    const { t } = useTranslation();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<IFridgeEditData>();
    const [companies, setCompanies] = useState<ICompany[]>([])

    useEffect(() => {
        if (item) {
            reset({ ...item });
        }
    }, [item, reset]);

    const onSubmit = async (data: IFridgeEditData) => {
        await editFridge(data.id, data)
            .then(() => {
                onHide();
                fetch();
            })
            .catch(() => alert(t("fridges.error")));
    };

    const fetchCompanies = async () => {
        await getCompanies().then((data) => setCompanies(data));
    }

    useEffect(() => {
        fetchCompanies();
    }, [show, item]);

    const selectCompanies = useMemo<ISelect[]>(() => {
        return [
            { value: "0", label: t("fridges.createModal.selectCompany") },
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
                    <Modal.Title>{t("fridges.editModal.title")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group">
                        <label className="control-label">{t("fridges.createModal.company")}</label>
                        <Controller
                            control={control}
                            name={"companyId"}
                            rules={{
                                required: t("fridges.createModal.companyRequired"),
                                validate: (data) => (data !== "0" ? undefined : t("fridges.createModal.companyRequired")),
                            }}
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
                    <div className="form-group">
                        <label className="control-label">{t("fridges.createModal.minInventory")}</label>
                        <Controller
                            control={control}
                            name={"minInventoryLevel"}
                            rules={{
                                required: t("fridges.createModal.minInventoryRequired"),
                                min: {
                                    value: 0,
                                    message: t("fridges.createModal.minInventoryMin")
                                }
                            }}
                            render={({ field }) => (
                                <input type="number" className="form-control" {...field} />
                            )}
                        />
                        <p style={{ color: "red" }}>{errors.minInventoryLevel?.message}</p>
                    </div>
                    <div className="form-group">
                        <label className="control-label">{t("fridges.createModal.minTemperature")}</label>
                        <Controller
                            control={control}
                            name={"minTemperature"}
                            rules={{
                                required: t("fridges.createModal.minTemperatureRequired"),
                                min: {
                                    value: -50,
                                    message: t("fridges.createModal.minTemperatureMin")
                                },
                                max: {
                                    value: 50,
                                    message: t("fridges.createModal.minTemperatureMax")
                                }
                            }}
                            render={({ field }) => (
                                <input type="number" className="form-control" {...field} />
                            )}
                        />
                        <p style={{ color: "red" }}>{errors.minTemperature?.message}</p>
                    </div>
                    <div className="form-group">
                        <label className="control-label">{t("fridges.createModal.lastRestocked")}</label>
                        <Controller
                            control={control}
                            name={"lastRestocked"}
                            rules={{
                                required: t("fridges.createModal.lastRestockedRequired"),
                            }}
                            render={({ field }) => (
                                <input type="datetime-local" className="form-control" {...field} />
                            )}
                        />
                        <p style={{ color: "red" }}>{errors.lastRestocked?.message}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        {t("fridges.createModal.close")}
                    </Button>
                    <Button variant="primary" type="submit">
                        {t("fridges.createModal.save")}
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}
