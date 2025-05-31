import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { createFridgeInventory } from '../../../http/fridgeInventoryApi';
import { Modal, Button } from 'react-bootstrap';
import { ISelect } from '../../../interfaces/ISelect';
import { IFridge } from '../../../interfaces/IFridge';
import { IFoodItem } from '../../../interfaces/IFoodItem';
import { getFridges } from '../../../http/fridgeApi';
import { getFoodItems } from '../../../http/foodItemApi';
import { useTranslation } from 'react-i18next';

interface IProps {
  show: boolean;
  onHide: () => void;
  fetch: () => void;
}

export interface IFridgeInventoryCreateData {
  fridgeId: string;
  fridge: IFridge;
  foodItem: IFoodItem;
  foodItemId: string;
  quantity: number;
}

export const FridgeInventoryCreateModal = ({ show, onHide, fetch }: IProps) => {
  const { t } = useTranslation();

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IFridgeInventoryCreateData>();

  const [fridges, setFridges] = useState<IFridge[]>([]);
  const [foodItems, setFoodItems] = useState<IFoodItem[]>([]);

  const handleClose = () => {
    reset({});
    onHide();
  };

  const onSubmit = async (data: IFridgeInventoryCreateData) => {
    await createFridgeInventory({ ...data })
      .then(() => {
        handleClose();
        fetch();
      })
      .catch(() => alert(t('fridgeInventories.error')));
  };

  const fetchFridges = async () => {
    await getFridges().then(setFridges);
  };

  const fetchFoodItems = async () => {
    await getFoodItems().then(setFoodItems);
  };

  useEffect(() => {
    if (show) {
      fetchFridges();
      fetchFoodItems();
    }
  }, [show]);

  const selectFridges = useMemo<ISelect[]>(() => {
    return [
      { value: '0', label: t('fridgeInventories.createModal.selectFridge') },
      ...fridges.map((fridge) => ({
        value: fridge.id.toString(),
        label: fridge.id,
      })),
    ];
  }, [fridges, t]);

  const selectFoodItems = useMemo<ISelect[]>(() => {
    return [
      { value: '0', label: t('fridgeInventories.createModal.selectFoodItem') },
      ...foodItems.map((item) => ({
        value: item.id.toString(),
        label: item.name,
      })),
    ];
  }, [foodItems, t]);

  return (
    <Modal show={show} onHide={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('fridgeInventories.createModal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label className="control-label">{t('fridgeInventories.createModal.fridge')}</label>
            <Controller
              control={control}
              name="fridgeId"
              rules={{
                required: t('fridgeInventories.createModal.selectFridge'),
                validate: (val) => (val !== '0' ? undefined : t('fridgeInventories.createModal.selectFridge')),
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
            <p style={{ color: 'red' }}>{errors.fridgeId?.message}</p>
          </div>

          <div className="form-group">
            <label className="control-label">{t('fridgeInventories.createModal.foodItem')}</label>
            <Controller
              control={control}
              name="foodItemId"
              rules={{
                required: t('fridgeInventories.createModal.selectFoodItem'),
                validate: (val) => (val !== '0' ? undefined : t('fridgeInventories.createModal.selectFoodItem')),
              }}
              render={({ field }) => (
                <select className="form-control" {...field}>
                  {selectFoodItems.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            />
            <p style={{ color: 'red' }}>{errors.foodItemId?.message}</p>
          </div>

          <div className="form-group">
            <label className="control-label">{t('fridgeInventories.createModal.quantity')}</label>
            <Controller
              control={control}
              name="quantity"
              rules={{
                required: t('fridgeInventories.createModal.quantityRequired'),
                min: {
                  value: 0,
                  message: t('fridgeInventories.createModal.quantityMin'),
                },
              }}
              render={({ field }) => <input type="number" className="form-control" {...field} />}
            />
            <p style={{ color: 'red' }}>{errors.quantity?.message}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t('fridgeInventories.createModal.close')}
          </Button>
          <Button variant="primary" type="submit">
            {t('fridgeInventories.createModal.save')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
