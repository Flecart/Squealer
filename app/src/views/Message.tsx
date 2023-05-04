import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "src/contexts";

export default function  Message(): JSX.Element {
    const navigate = useNavigate();
    const { id } = useParams();

    if(id==null)
        navigate("/404");

    useEffect(() => {
        fetchApi<IMessage>(
            `${apiMessageBase}/${id}`,
            { method: 'GET' },
            auth,
            (message) => {
                setMessage(() => message);
            },
            


    return <SidebarLayout>
        <Post>
        </Post>
        {/* aggiungere  lle risposte*/}
        </SidebarLayout>;


}