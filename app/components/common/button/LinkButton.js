import Link from "next/link"
import Button from "./Button"

export default function LinkButton({ href = "", children, ...ButtonObject }){
    return(
        <Link href={href}>
            <Button {...ButtonObject}>
                {children}
            </Button>
        </Link>
    )
}