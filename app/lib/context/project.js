import { createContext, useState, useContext } from "react"
import { createNewProject } from "../fetch/project"
import { addTeam } from "../fetch/team"
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

        const project = await createNewProject(payload)

        if(project.data && projectData.teams){
            const team = await addTeam({ teams: projectData.teams, projectId: project.data.id })
            if(!team.data){
                console.log("Gagal mengundang anggota tim")
            }
        }

        setProjectData({})
        return project
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