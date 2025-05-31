import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { createOrder } from '../../../http/orderApi';
import {Modal, Button} from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { IUser } from '../../../interfaces/IUser';
import { IFridge } from '../../../interfaces/IFridge';
import { getFridges } from '../../../http/fridgeApi';
import { ISelect } from '../../../interfaces/ISelect';
import { getUsers } from '../../../http/userApi';
import { useTranslation } from 'react-i18next';

interface IProps {
    show: boolean,
    onHide: () => void,
    fetch: () => void,
}

export interface IOrderCreateData {
    id: string,
    user: IUser,
    userId: string,
    fridge: IFridge,
    fridgeId: string,
    totalAmount: number,
    paymentStatus: number,
    timestamp: string,
}

export const OrderCreateModal = ({show, onHide, fetch}: IProps) => {
    const { t } = useTranslation();

    const {
        control,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<IOrderCreateData>();

    const [fridges, setFridges] = useState<IFridge[]>([])
    const [users, setUsers] = useState<IUser[]>([])

    const handleClose = () => {
        reset({})
        onHide();
    }

    const onSubmit = async (data: IOrderCreateData) => {
        await createOrder({...data, id: uuidv4(), paymentStatus: +data.paymentStatus})
            .then(() => {
                handleClose();
                fetch();
            }).catch(() => alert(t('orders.error')));
    };

    const fetchFridges = async () => {
        await getFridges().then((data) => setFridges(data));
    }

    const fetchUsers = async () => {
        await getUsers().then((data) => setUsers(data));
    }

    useEffect(() => {
        fetchFridges();
        fetchUsers();
    }, [show])

    const selectFridges = useMemo<ISelect[]>(() => {
        return [
            { value: "0", label: t('orders.createModal.selectFridge') },
            ...fridges.map((fridge) => ({
                value: fridge.id.toString(),
                label: fridge.id,
            })),
        ];
    }, [fridges, t]);

    const selectUsers = useMemo<ISelect[]>(() => {
        return [
            { value: "0", label: t('orders.createModal.selectUser') },
            ...users.map((user) => ({
                value: user.id.toString(),
                label: user.email,
            })),
        ];
    }, [users, t]);

    return (
        <Modal show={show} onHide={handleClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('orders.createModal.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group">
                        <label className="control-label">{t('orders.createModal.totalAmount')}</label>
                        <Controller
                            control={control}
                            name={"totalAmount"}
                            rules={{
                                required: t('orders.createModal.amountRequired'),
                            }}
                            render={({ field }) => (
                                <input type='number' className="form-control" {...field} />
                            )}
                        />
                        <p style={{ color: "red" }}>{errors.totalAmount?.message}</p>
                    </div>

                    <div className="form-group">
                        <label className="control-label">{t('orders.createModal.timestamp')}</label>
                        <Controller
                            control={control}
                            name={"timestamp"}
                            rules={{
                                required: t('orders.createModal.timestamp'),
                            }}
                            render={({ field }) => (
                                <input type="datetime-local" className="form-control" {...field} />
                            )}
                        />
                        <p style={{ color: "red" }}>{errors.timestamp?.message}</p>
                    </div>

                    <div className="form-group">
                        <label className="control-label">{t('orders.createModal.fridgeId')}</label>
                        <Controller
                            control={control}
                            name={"fridgeId"}
                            rules={{
                                required: t('orders.createModal.fridgeRequired'),
                                validate: (data) => (data !== "0" ? undefined : t('orders.createModal.fridgeRequired')),
                            }}
                            render={({ field }) => (
                                <select className="form-control" {...field}>
                                    {selectFridges.map(({ value, label }) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            )}
                        />
                        <p style={{ color: "red" }}>{errors.fridgeId?.message}</p>
                    </div>

                    <div className="form-group">
                        <label className="control-label">{t('orders.createModal.userEmail')}</label>
                        <Controller
                            control={control}
                            name={"userId"}
                            rules={{
                                required: t('orders.createModal.userRequired'),
                                validate: (data) => (data !== "0" ? undefined : t('orders.createModal.userRequired')),
                            }}
                            render={({ field }) => (
                                <select className="form-control" {...field}>
                                    {selectUsers.map(({ value, label }) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            )}
                        />
                        <p style={{ color: "red" }}>{errors.userId?.message}</p>
                    </div>

                    <div className="form-group">
                        <label className="control-label">{t('orders.createModal.paymentStatus')}</label>
                        <Controller
                            control={control}
                            name={"paymentStatus"}
                            rules={{
                                required: t('orders.createModal.paymentStatus'),
                            }}
                            render={({ field }) => (
                                <select className="form-control" {...field}>
                                    <option value={0}>{t('orders.tableHeaders.paymentStatus') + ': Pending'}</option>
                                    <option value={1}>{t('orders.tableHeaders.paymentStatus') + ': Completed'}</option>
                                    <option value={2}>{t('orders.tableHeaders.paymentStatus') + ': Failed'}</option>
                                    <option value={3}>{t('orders.tableHeaders.paymentStatus') + ': Refunded'}</option>
                                </select>
                            )}
                        />
                        <p style={{ color: "red" }}>{errors.paymentStatus?.message}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        {t('orders.createModal.close')}
                    </Button>
                    <Button variant="primary" type="submit">
                        {t('orders.createModal.save')}
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}
