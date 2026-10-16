import { ErrorMessage } from "formik";

type FormikErrorMessageProps = { name: string }

/**
 * FormikErrorMessage Component
 */
export default function FormikErrorMessage({ name }: FormikErrorMessageProps){
  return (
    <ErrorMessage name={name}>
      {(errMessage) => {
        return <p className="text-xs text-red-600">{String(errMessage)}</p>
      }}
    </ErrorMessage>
  )
}
