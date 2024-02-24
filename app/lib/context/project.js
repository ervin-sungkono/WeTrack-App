import { createContext, useState, useContext } from "react"

const ProjectContext = createContext({})

export const ProjectProvider = ({ children }) => {
    const [projectData, setData] = useState({})
    const setProjectData = (values) => setData((prevValues => ({...prevValues, ...values})))
    const submitProjectData = async(values) => {
        const payload = {
            ...projectData,
            ...values
        }
        const response = {}
        // const response = await ProjectUser(payload)
        // TODO: integrate with API create project

        setProjectData({})
        return response
    }

    return(
        <ProjectContext.Provider value={{projectData, setProjectData, submitProjectData}}>
            {children}
        </ProjectContext.Provider>
    )
}

export const useProjectData = () => useContext(ProjectContext)