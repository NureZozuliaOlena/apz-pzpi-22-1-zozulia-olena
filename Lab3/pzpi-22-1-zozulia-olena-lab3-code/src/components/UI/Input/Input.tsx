import React from 'react'
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form'

interface IProps <T extends FieldValues, TName extends Path<T>> {
    field?:ControllerRenderProps<T, TName>,
    inputType:InputType,
    label?:string,
    disabled?: boolean,
}

type InputType = "password" | "text" | "number" | "date";

export const Input = <T extends FieldValues, TName extends Path<T>>(props:IProps<T, TName>) => {
  return (
      <input type={props.inputType} disabled={props.disabled} {...props.field} className="form-control" />
  )
}