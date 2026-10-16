import Link from "next/link"
import type { LinkProps } from "next/link"
import Button from "./Button"
import type { ComponentProps } from "react"

type LinkButtonProps = Omit<ComponentProps<typeof Button>, "type"> & { href?: LinkProps["href"] }

export default function LinkButton({ href = "", children, ...ButtonObject }: LinkButtonProps){
    return(
        <Link href={href}>
            <Button {...ButtonObject}>
                {children}
            </Button>
        </Link>
    )
}
