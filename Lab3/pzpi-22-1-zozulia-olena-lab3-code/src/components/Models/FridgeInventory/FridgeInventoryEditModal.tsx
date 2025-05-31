import React, { useEffect, useMemo, useState } from 'react'
import { Button, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { editFridgeInventory } from '../../../http/fridgeInventoryApi';
import { IFridgeInventory } from '../../../interfaces/IFridgeInventory';
import { ICompany } from '../../../interfaces/ICompany';
import { getCompanies } from '../../../http/companyApi';
import { ISelect } from '../../../interfaces/ISelect';
import { IFridgeInventoryCreateData } from './FridgeInventoryCreateModal';
import { IFridge } from '../../../interfaces/IFridge';
import { IFoodItem } from '../../../interfaces/IFoodItem';
import { getFridges } from '../../../http/fridgeApi';
import { getFoodItems } from '../../../http/foodItemApi';
import { useTranslation } from 'react-i18next';

interface IProps {
    show: boolean,
    onHide: () => void,
    fetch: () => void,
    item?: IFridgeInventory,
}

export interface IFridgeInventoryEditData extends IFridgeInventoryCreateData {
    id: string,
    name: string,
    address: string,
    contactEmail: string
}

export const FridgeInventoryEditModal = ({ show, onHide, item, fetch }: IProps) => {
  const { t } = useTranslation();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
      } = useForm<IFridgeInventoryEditData>();
            const [fridges, setFridges] = useState<IFridge[]>([])
            const [foodItems, setFoodItems] = useState<IFoodItem[]>([])
    
      useEffect(() => {
        if (item) {
          reset({
            ...item
          });
        }
      }, [item, reset]);
          
      const onSubmit = async (data: IFridgeInventoryEditData) => {
        await editFridgeInventory(data.id, data)
          .then(() => {
            onHide();
            fetch();
          })
          .catch(() => alert("Error"));
      };

      const fetchFridges = async () => {
              await getFridges().then((data) => setFridges(data));
            }
            
            const fetchFoodItems = async () => {
              await getFoodItems().then((data) => setFoodItems(data));
            }
      
            useEffect(() => {
              fetchFridges();
              fetchFoodItems();
            }, [show])
      
             const selectFridges = useMemo<ISelect[]>(() => {
              return [
                  { value: "0", label: "Select fridge..." },
                  ...fridges.map((fridge) => {
                      return {
                          value: fridge.id.toString(),
                          label: fridge.id,
                      };
                  }),
              ];
          }, [fridges]);
      
          const selectFoodItems = useMemo<ISelect[]>(() => {
              return [
                  { value: "0", label: "Select food item..." },
                  ...foodItems.map((foodItem) => {
                      return {
                          value: foodItem.id.toString(),
                          label: foodItem.name,
                      };
                  }),
              ];
          }, [foodItems]);

    return (
        <Modal show={show} onHide={onHide}>
  <form onSubmit={handleSubmit(onSubmit)}>
    <Modal.Header closeButton>
      <Modal.Title>{t('fridgeInventories.editModal.title')}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="form-group">
        <label className="control-label">{t('fridgeInventories.createModal.fridge')}</label>
        <Controller
          control={control}
          name={"fridgeId"}
          rules={{
            required: t("fridgeInventories.createModal.selectFridge"),
            validate: (data) => (data != "0" ? undefined : t("fridgeInventories.createModal.selectFridge")),
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
        <label className="control-label">{t('fridgeInventories.createModal.foodItem')}</label>
        <Controller
          control={control}
          name={"foodItemId"}
          rules={{
            required: t("fridgeInventories.createModal.selectFoodItem"),
            validate: (data) => (data != "0" ? undefined : t("fridgeInventories.createModal.selectFoodItem")),
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
        <p style={{ color: "red" }}>{errors.foodItemId?.message}</p>
      </div>

      <div className="form-group">
        <label className="control-label">{t('fridgeInventories.createModal.quantity')}</label>
        <Controller
          control={control}
          name={"quantity"}
          rules={{
            required: t("fridgeInventories.createModal.quantityRequired"),
            min: {
              value: 0,
              message: t("fridgeInventories.createModal.quantityMin"),
            },
          }}
          render={({ field }) => (
            <input type="number" className="form-control" {...field} />
          )}
        />
        <p style={{ color: "red" }}>{errors.quantity?.message}</p>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        {t('fridgeInventories.createModal.close')}
      </Button>
      <Button variant="primary" type="submit">
        {t('fridgeInventories.createModal.save')}
      </Button>
    </Modal.Footer>
  </form>
</Modal>

      )
}
