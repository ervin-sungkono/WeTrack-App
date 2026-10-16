"use client"
import { Formik, Form, type FormikConfig, type FormikProps } from "formik"
import type { ReactNode } from "react"

type FormikWrapperProps<Values extends object> = {
    initialValues: Values
    onSubmit: FormikConfig<Values>["onSubmit"]
    validationSchema?: FormikConfig<Values>["validationSchema"]
    children: (formik: FormikProps<Values>) => ReactNode
    className?: string
    enableReinitialize?: boolean
}

export default function FormikWrapper<Values extends object>({ initialValues, onSubmit, validationSchema, children, className, enableReinitialize = false }: FormikWrapperProps<Values>){
    return(
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
            enableReinitialize={enableReinitialize}
            validateOnChange={false}
        >
            {(formik) => {
                return(
                    <Form className={className}>
                        {children(formik)}
                    </Form>
                )
            }}
        </Formik>
    )
}
