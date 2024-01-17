import { Formik, Form } from "formik"

export default function FormikWrapper({ initialValues, onSubmit, validationSchema, children }){
    return(
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
        >
            {(formik) => {
                return(
                    <Form>
                        {children(formik)}
                    </Form>
                )
            }}
        </Formik>
    )
}