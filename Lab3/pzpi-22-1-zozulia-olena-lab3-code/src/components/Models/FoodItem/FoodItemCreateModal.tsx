import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { createFoodItem } from '../../../http/foodItemApi';
import { Modal, Button } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

interface IProps {
  show: boolean;
  onHide: () => void;
  fetch: () => void;
}

export interface IFoodItemCreateData {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}

export const FoodItemCreateModal = ({ show, onHide, fetch }: IProps) => {
  const { t } = useTranslation();

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IFoodItemCreateData>();

  const handleClose = () => {
    reset({});
    onHide();
  };

  const onSubmit = async (data: IFoodItemCreateData) => {
    await createFoodItem({ ...data, id: uuidv4() })
      .then(() => {
        handleClose();
        fetch();
      })
      .catch(() => alert("Error"));
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('foodItems.createModal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label className="control-label">{t('foodItems.createModal.name')}</label>
            <Controller
              control={control}
              name="name"
              rules={{
                required: t('foodItems.createModal.nameRequired'),
              }}
              render={({ field }) => (
                <input className="form-control" {...field} />
              )}
            />
            <p style={{ color: 'red' }}>{errors.name?.message}</p>
          </div>

          <div className="form-group">
            <label className="control-label">{t('foodItems.createModal.description')}</label>
            <Controller
              control={control}
              name="description"
              rules={{
                required: t('foodItems.createModal.descriptionRequired'),
              }}
              render={({ field }) => (
                <input className="form-control" {...field} />
              )}
            />
            <p style={{ color: 'red' }}>{errors.description?.message}</p>
          </div>

          <div className="form-group">
            <label className="control-label">{t('foodItems.createModal.price')}</label>
            <Controller
              control={control}
              name="price"
              rules={{
                required: t('foodItems.createModal.priceMin'),
                min: {
                  value: 0,
                  message: t('foodItems.createModal.priceMin'),
                },
              }}
              render={({ field }) => (
                <input type="number" className="form-control" {...field} />
              )}
            />
            <p style={{ color: 'red' }}>{errors.price?.message}</p>
          </div>

          <div className="form-group">
            <label className="control-label">{t('foodItems.createModal.isAvailable')}</label>
            <Controller
              control={control}
              name="isAvailable"
              render={({ field }) => (
                <select
                  className="form-control"
                  {...field}
                  value={String(field.value)}
                  onChange={(e) => field.onChange(e.target.value === 'true')}
                >
                  <option value="true">{t('foodItems.createModal.isAvailableYes')}</option>
                  <option value="false">{t('foodItems.createModal.isAvailableNo')}</option>
                </select>
              )}
            />
            <p style={{ color: 'red' }}>{errors.isAvailable?.message}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t('foodItems.createModal.close')}
          </Button>
          <Button variant="primary" type="submit">
            {t('foodItems.createModal.save')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
