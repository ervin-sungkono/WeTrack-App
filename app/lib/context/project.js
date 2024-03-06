import { createContext, useState, useContext } from "react"
import { createNewProject } from "../fetch/project"
import { SessionProvider } from "next-auth/react"

const ProjectContext = createContext({})

export const ProjectProvider = ({ children }) => {
    const [projectData, setData] = useState({})
    const setProjectData = (values) => setData((prevValues => ({...prevValues, ...values})))
    const submitProjectData = async(values) => {
        const payload = {
            ...projectData,
            ...values
        }

        const response = await createNewProject(payload)

        setProjectData({})
        return response
    }

    return(
        <SessionProvider>
            <ProjectContext.Provider value={{projectData, setProjectData, submitProjectData}}>
                {children}
            </ProjectContext.Provider>
        </SessionProvider>
    )
}

export const useProjectData = () => useContext(ProjectContext)