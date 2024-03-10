import { getServerSession } from "next-auth"

export const getUserSession = (req, res, authOptions) => {
    const session = getServerSession(req,{
        ...res,
        getHeader: (name) => res.headers?.get(name),
        setHeader: (name, value) => res.headers?.set(name, value),
    }, authOptions)
  
    return session
}