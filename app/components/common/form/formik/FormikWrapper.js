import { Formik, Form } from "formik"

export default function FormikWrapper({ initialValues, onSubmit, validationSchema, children, className }){
    return(
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
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