import { ErrorMessage } from "formik";

/**
 * FormikErrorMessage Component
 */
export default function FormikErrorMessage({ name }){
  return (
    <ErrorMessage name={name}>
      {(errMessage) => {
        return <p className="text-xs text-red-600">{errMessage}</p>
      }}
    </ErrorMessage>
  )
}