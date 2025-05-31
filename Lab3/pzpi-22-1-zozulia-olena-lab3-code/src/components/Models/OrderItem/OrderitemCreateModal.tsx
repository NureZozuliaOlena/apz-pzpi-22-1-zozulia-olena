import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { createOrderitem } from '../../../http/orderItemApi';
import { Modal, Button } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { IOrder } from '../../../interfaces/IOrder';
import { IFridgeInventory } from '../../../interfaces/IFridgeInventory';
import { getOrders } from '../../../http/orderApi';
import { getFridgeInventories } from '../../../http/fridgeInventoryApi';
import { ISelect } from '../../../interfaces/ISelect';
import { useTranslation } from 'react-i18next';

interface IProps {
  show: boolean;
  onHide: () => void;
  fetch: () => void;
}

export interface IOrderitemCreateData {
  id: string;
  order: IOrder;
  orderId: string;
  fridgeInventory: IFridgeInventory;
  fridgeInventoryId: string;
  quantity: number;
  price: number;
}

export const OrderitemCreateModal = ({ show, onHide, fetch }: IProps) => {
  const { t } = useTranslation();

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IOrderitemCreateData>();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [fridgeInventories, setFridgeInventories] = useState<IFridgeInventory[]>([]);

  const handleClose = () => {
    reset({});
    onHide();
  };

  const onSubmit = async (data: IOrderitemCreateData) => {
    await createOrderitem({ ...data, id: uuidv4() })
      .then(() => {
        handleClose();
        fetch();
      })
      .catch(() => alert(t('orderItems.error')));
  };

  const fetchOrders = async () => {
    await getOrders().then((data) => setOrders(data));
  };

  const fetchFridgeInventories = async () => {
    await getFridgeInventories().then((data) => setFridgeInventories(data));
  };

  useEffect(() => {
    if (show) {
      fetchOrders();
      fetchFridgeInventories();
    }
  }, [show]);

  const selectOrders = useMemo<ISelect[]>(() => {
    return [
      { value: '0', label: t('orderItems.createModal.selectOrder') },
      ...orders.map((order) => ({
        value: order.id.toString(),
        label: order.id,
      })),
    ];
  }, [orders, t]);

  const selectFridgeInventories = useMemo<ISelect[]>(() => {
    return [
      { value: '0', label: t('orderItems.createModal.selectFridgeInventory') },
      ...fridgeInventories.map((inv) => ({
        value: inv.id.toString(),
        label: inv.id,
      })),
    ];
  }, [fridgeInventories, t]);

  return (
    <Modal show={show} onHide={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('orderItems.createModal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>{t('orderItems.createModal.quantity')}</label>
            <Controller
              control={control}
              name="quantity"
              rules={{ required: t('orderItems.createModal.validation.quantity') }}
              render={({ field }) => <input type="number" className="form-control" {...field} />}
            />
            <p style={{ color: 'red' }}>{errors.quantity?.message}</p>
          </div>

          <div className="form-group">
            <label>{t('orderItems.createModal.price')}</label>
            <Controller
              control={control}
              name="price"
              rules={{ required: t('orderItems.createModal.validation.price') }}
              render={({ field }) => <input type="number" className="form-control" {...field} />}
            />
            <p style={{ color: 'red' }}>{errors.price?.message}</p>
          </div>

          <div className="form-group">
            <label>{t('orderItems.createModal.order')}</label>
            <Controller
              control={control}
              name="orderId"
              rules={{
                required: t('orderItems.createModal.validation.order'),
                validate: (val) => val !== '0' || t('orderItems.createModal.validation.order'),
              }}
              render={({ field }) => (
                <select className="form-control" {...field}>
                  {selectOrders.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            />
            <p style={{ color: 'red' }}>{errors.orderId?.message}</p>
          </div>

          <div className="form-group">
            <label>{t('orderItems.createModal.fridgeInventory')}</label>
            <Controller
              control={control}
              name="fridgeInventoryId"
              rules={{
                required: t('orderItems.createModal.validation.fridgeInventory'),
                validate: (val) => val !== '0' || t('orderItems.createModal.validation.fridgeInventory'),
              }}
              render={({ field }) => (
                <select className="form-control" {...field}>
                  {selectFridgeInventories.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            />
            <p style={{ color: 'red' }}>{errors.fridgeInventoryId?.message}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t('orderItems.createModal.close')}
          </Button>
          <Button variant="primary" type="submit">
            {t('orderItems.createModal.submit')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
