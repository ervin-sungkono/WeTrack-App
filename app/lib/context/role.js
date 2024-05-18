import { createContext, useContext, useState, useEffect } from 'react';
import { getProjectRole } from '@/app/firebase/util';
import { getSession } from 'next-auth/react';
import { useSessionStorage } from 'usehooks-ts';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
    const [project, _] = useSessionStorage("project")
    const [role, setRole] = useState(null);

    useEffect(() => {
        if(project && project.id && !role){
            getSession().then(session => {
                if(session.user){
                    getProjectRole({ userId: session.user.uid, projectId: project.id })
                        .then(role => setRole(role))
                }
            })
        }
    }, [project, role]);

    return (
        <RoleContext.Provider value={role}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => useContext(RoleContext);
