import React, { useEffect } from 'react'
import { Button, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { editFoodItem } from '../../../http/foodItemApi';
import { IFoodItem } from '../../../interfaces/IFoodItem';
import { IFoodItemCreateData } from './FoodItemCreateModal';
import { useTranslation } from 'react-i18next';

interface IProps {
    show: boolean,
    onHide: () => void,
    fetch: () => void,
    item?: IFoodItem,
}

export interface IFoodItemEditData extends IFoodItemCreateData {
    id: string,
}

export const FoodItemEditModal = ({ show, onHide, item, fetch }: IProps) => {
    const { t } = useTranslation();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
      } = useForm<IFoodItemEditData>();
    
      useEffect(() => {
        if (item) {
          reset({
            ...item
          });
        }
      }, [item, reset]);
          
      const onSubmit = async (data: IFoodItemEditData) => {
        await editFoodItem(data.id, data)
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
                <Modal.Title>{t('foodItems.editModal.title')}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div
                  asp-validation-summary="ModelOnly"
                  className="text-danger"
                ></div>
                 <div className="form-group">
                                   <label className="control-label">{t('foodItems.createModal.name')}</label>
                                   <Controller
                                     control={control}
                                     name={"name"}
                                     rules={{
                                       required: t('foodItems.createModal.nameRequired'),
                                     }}
                                     render={({ field }) => (
                                       <input className="form-control" {...field} />
                                     )}
                                   ></Controller>
                                   <p style={{ color: "red" }}>{errors.name?.message}</p>
                                 </div>
                                  <div className="form-group">
                                   <label className="control-label">{t('foodItems.createModal.description')}</label>
                                   <Controller
                                     control={control}
                                     name={"description"}
                                     rules={{
                                       required: t('foodItems.createModal.descriptionRequired'),
                                     }}
                                     render={({ field }) => (
                                       <input className="form-control" {...field} />
                                     )}
                                   ></Controller>
                                   <p style={{ color: "red" }}>{errors.description?.message}</p>
                                 </div>
                   <div className="form-group">
                                         <label className="control-label">{t('foodItems.createModal.price')}</label>
                                         <Controller
                                             control={control}
                                             name={"price"}
                                             rules={{
                                                 required: "Enter temp",
                                                 min: {
                                                     value: 0,
                                                     message: t('foodItems.createModal.priceMin')
                                                 }
                                             }}
                                             render={({ field }) => (
                                                 <input type="number" className="form-control" {...field} />
                                             )}
                                         ></Controller>
                                         <p style={{ color: "red" }}>{errors.price?.message}</p>
                                     </div>
                   <div className="form-group">
                                         <label className="control-label">{t('foodItems.createModal.isAvailable')}</label>
                                      <Controller
                   control={control}
                   name={"isAvailable"}
                   render={({ field }) => (
                     <select
                       className="form-control"
                       {...field}
                       value={String(field.value)}
                       onChange={(e) => field.onChange(e.target.value === "true")}
                     >
                       <option value="true">{t('foodItems.createModal.isAvailableYes')}</option>
                       <option value="false">{t('foodItems.createModal.isAvailableNo')}</option>
                     </select>
                   )}
                 />
                                         <p style={{ color: "red" }}>{errors.isAvailable?.message}</p>
                                     </div>
              
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                  {t('foodItems.createModal.close')}
                </Button>
                <Button variant="primary" type="submit">
                  {t('foodItems.createModal.save')}
                </Button>
              </Modal.Footer>
            </form>
          </Modal>
      )
}
