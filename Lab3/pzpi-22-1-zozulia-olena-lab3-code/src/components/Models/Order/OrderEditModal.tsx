import React, { useEffect, useMemo, useState } from 'react'
import { Button, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { editOrder } from '../../../http/orderApi';
import { IOrder } from '../../../interfaces/IOrder';
import { IOrderCreateData } from './OrderCreateModal';
import { IUser } from '../../../interfaces/IUser';
import { IFridge } from '../../../interfaces/IFridge';
import { getFridges } from '../../../http/fridgeApi';
import { getUsers } from '../../../http/userApi';
import { ISelect } from '../../../interfaces/ISelect';
import { useTranslation } from 'react-i18next';

interface IProps {
    show: boolean,
    onHide: () => void,
    fetch: () => void,
    item?: IOrder,
}

export interface IOrderEditData extends IOrderCreateData {
    id: string,
    name: string,
    address: string,
    contactEmail: string
}

export const OrderEditModal = ({ show, onHide, item, fetch }: IProps) => {
    const { t } = useTranslation();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
      } = useForm<IOrderEditData>();

    const [fridges, setFridges] = useState<IFridge[]>([])
    const [users, setUsers] = useState<IUser[]>([])

    useEffect(() => {
        if (item) {
          reset({
            ...item
          });
        }
    }, [item, reset]);

    const onSubmit = async (data: IOrderEditData) => {
        await editOrder(data.id, {...data, paymentStatus: +data.paymentStatus})
          .then(() => {
            onHide();
            fetch();
          })
          .catch(() => alert(t("orders.error")));
    };

    const fetchFridges = async () => {
        await getFridges().then((data) => setFridges(data));
    }
                  
    const fetchUsers = async () => {
        await getUsers().then((data) => setUsers(data));
    }
            
    useEffect(() => {
        if(show) {
          fetchFridges();
          fetchUsers();
        }
    }, [show])
            
    const selectFridges = useMemo<ISelect[]>(() => {
        return [
            { value: "0", label: t("orders.createModal.selectFridge") },
            ...fridges.map((fridge) => {
                return {
                    value: fridge.id.toString(),
                    label: fridge.id,
                };
            }),
        ];
    }, [fridges, t]);
            
    const selectUsers = useMemo<ISelect[]>(() => {
        return [
            { value: "0", label: t("orders.createModal.selectUser") },
            ...users.map((user) => {
                return {
                    value: user.id.toString(),
                    label: user.email,
                };
            }),
        ];
    }, [users, t]);

    return (
        <Modal show={show} onHide={onHide}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header closeButton>
                <Modal.Title>{t("orders.editModal.title")}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="form-group">
                  <label className="control-label">{t("orders.createModal.totalAmount")}</label>
                  <Controller
                    control={control}
                    name={"totalAmount"}
                    rules={{
                      required: t("orders.createModal.amountRequired"),
                    }}
                    render={({ field }) => (
                      <input type='number' className="form-control" {...field} />
                    )}
                  ></Controller>
                  <p style={{ color: "red" }}>{errors.totalAmount?.message}</p>
                </div>

                <div className="form-group">
                  <label className="control-label">{t("orders.createModal.timestamp")}</label>
                  <Controller
                      control={control}
                      name={"timestamp"}
                      rules={{
                          required: t("orders.createModal.timestamp") + " " + t("orders.error"),
                      }}
                      render={({ field }) => (
                          <input type="datetime-local" className="form-control" {...field} />
                      )}
                  ></Controller>
                  <p style={{ color: "red" }}>{errors.timestamp?.message}</p>
                </div>

                <div className="form-group">
                  <label className="control-label">{t("orders.createModal.fridgeId")}</label>
                  <Controller
                      control={control}
                      name={"fridgeId"}
                      rules={{
                          required: t("orders.createModal.fridgeRequired"),
                          validate: (data) => (data !== "0" ? undefined : t("orders.createModal.fridgeRequired")),
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
                  ></Controller>
                  <p style={{ color: "red" }}>{errors.fridgeId?.message}</p>
                </div>

                <div className="form-group">
                  <label className="control-label">{t("orders.createModal.userEmail")}</label>
                  <Controller
                      control={control}
                      name={"userId"}
                      rules={{
                          required: t("orders.createModal.userRequired"),
                          validate: (data) => (data !== "0" ? undefined : t("orders.createModal.userRequired")),
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
                  ></Controller>
                  <p style={{ color: "red" }}>{errors.userId?.message}</p>
                </div>

                <div className="form-group">
                  <label className="control-label">{t("orders.createModal.paymentStatus")}</label>
                  <Controller
                      control={control}
                      name={"paymentStatus"}
                      rules={{
                          required: t("orders.createModal.paymentStatus"),
                      }}
                      render={({ field }) => (
                          <select className="form-control" {...field}>
                            <option value={0}>{t("orders.createModal.paymentStatusPending") || "Pending"}</option>
                            <option value={1}>{t("orders.createModal.paymentStatusCompleted") || "Completed"}</option>
                            <option value={2}>{t("orders.createModal.paymentStatusFailed") || "Failed"}</option>
                            <option value={3}>{t("orders.createModal.paymentStatusRefunded") || "Refunded"}</option>
                          </select>
                      )}
                  ></Controller>
                  <p style={{ color: "red" }}>{errors.paymentStatus?.message}</p>
                </div>

              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                  {t("orders.createModal.close")}
                </Button>
                <Button variant="primary" type="submit">
                  {t("orders.createModal.save")}
                </Button>
              </Modal.Footer>
            </form>
          </Modal>
      )
}
