import React, { useEffect, useMemo, useState } from 'react'
import { Button, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { IUser } from '../../../interfaces/IUser';
import { IFridge } from '../../../interfaces/IFridge';
import { getFridges } from '../../../http/fridgeApi';
import { getUsers } from '../../../http/userApi';
import { ISelect } from '../../../interfaces/ISelect';
import { IOrderitemCreateData } from './OrderitemCreateModal';
import { IOrderItem } from '../../../interfaces/IOrderItem';
import { editOrderitem } from '../../../http/orderItemApi';
import { IOrder } from '../../../interfaces/IOrder';
import { IFridgeInventory } from '../../../interfaces/IFridgeInventory';
import { getOrders } from '../../../http/orderApi';
import { getFridgeInventories } from '../../../http/fridgeInventoryApi';
import { useTranslation } from 'react-i18next';

interface IProps {
    show: boolean,
    onHide: () => void,
    fetch: () => void,
    item?: IOrderItem,
}

export interface IOrderitemEditData extends IOrderitemCreateData {
    id: string,
    name: string,
    address: string,
    contactEmail: string
}

export const OrderitemEditModal = ({ show, onHide, item, fetch }: IProps) => {
    const { t } = useTranslation();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
      } = useForm<IOrderitemEditData>();
                  const [orders, setOrders] = useState<IOrder[]>([])
                  const [fridgeInventories, setFridgeInventories] = useState<IFridgeInventory[]>([])
    
      useEffect(() => {
        if (item) {
          reset({
            ...item
          });
        }
      }, [item, reset]);
          
      const onSubmit = async (data: IOrderitemEditData) => {
        await editOrderitem(data.id, {...data })
          .then(() => {
            onHide();
            fetch();
          })
          .catch(() => alert(t('orderItems.error')));
      };

     const fetchOrders = async () => {
                   await getOrders().then((data) => setOrders(data));
                 }
                 
                 const fetchFridgeInventories = async () => {
                   await getFridgeInventories().then((data) => setFridgeInventories(data));
                 }
           
                 useEffect(() => {
                   fetchOrders();
                   fetchFridgeInventories();
                 }, [show])
           
                  const selectOrders = useMemo<ISelect[]>(() => {
                   return [
                       { value: "0", label: "Select order..." },
                       ...orders.map((order) => {
                           return {
                               value: order.id.toString(),
                               label: order.id,
                           };
                       }),
                   ];
               }, [orders]);
           
               const selectFridgeInventories = useMemo<ISelect[]>(() => {
                   return [
                       { value: "0", label: "Select item..." },
                       ...fridgeInventories.map((fridgeInventory) => {
                           return {
                               value: fridgeInventory.id.toString(),
                               label: fridgeInventory.id,
                           };
                       }),
                   ];
               }, [fridgeInventories]);
                        

    return (
        <Modal show={show} onHide={onHide}>
  <form onSubmit={handleSubmit(onSubmit)}>
    <Modal.Header closeButton>
      <Modal.Title>{t('orderItems.editModal.title')}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="form-group">
        <label className="control-label">{t('orderItems.createModal.quantity')}</label>
        <Controller
          control={control}
          name={"quantity"}
          rules={{
            required: t('orderItems.createModal.validation.quantity'),
          }}
          render={({ field }) => (
            <input type='number' className="form-control" {...field} />
          )}
        />
        <p style={{ color: "red" }}>{errors.quantity?.message}</p>
      </div>

      <div className="form-group">
        <label className="control-label">{t('orderItems.createModal.price')}</label>
        <Controller
          control={control}
          name={"price"}
          rules={{
            required: t('orderItems.createModal.validation.price'),
          }}
          render={({ field }) => (
            <input type='number' className="form-control" {...field} />
          )}
        />
        <p style={{ color: "red" }}>{errors.price?.message}</p>
      </div>

      <div className="form-group">
        <label className="control-label">{t('orderItems.createModal.order')}</label>
        <Controller
          control={control}
          name={"orderId"}
          rules={{
            required: t('orderItems.createModal.validation.order'),
            validate: (data) => (data !== "0" ? undefined : t('orderItems.createModal.validation.order')),
          }}
          render={({ field }) => (
            <select className="form-control" {...field}>
              <option value="0">{t('orderItems.createModal.selectOrder')}</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>{order.id}</option>
              ))}
            </select>
          )}
        />
        <p style={{ color: "red" }}>{errors.orderId?.message}</p>
      </div>

      <div className="form-group">
        <label className="control-label">{t('orderItems.createModal.fridgeInventory')}</label>
        <Controller
          control={control}
          name={"fridgeInventoryId"}
          rules={{
            required: t('orderItems.createModal.validation.fridgeInventory'),
            validate: (data) => (data !== "0" ? undefined : t('orderItems.createModal.validation.fridgeInventory')),
          }}
          render={({ field }) => (
            <select className="form-control" {...field}>
              <option value="0">{t('orderItems.createModal.selectFridgeInventory')}</option>
              {fridgeInventories.map((fi) => (
                <option key={fi.id} value={fi.id}>{fi.id}</option>
              ))}
            </select>
          )}
        />
        <p style={{ color: "red" }}>{errors.fridgeInventoryId?.message}</p>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        {t('orderItems.createModal.close')}
      </Button>
      <Button variant="primary" type="submit">
        {t('orderItems.createModal.submit')}
      </Button>
    </Modal.Footer>
  </form>
</Modal>

      )
}
