import Login from "../view/Login";
import Main from "../view/Main";
import TalbePage from "../components/TablePage";
import Iframe from "../components/Iframe";
import MyIframe from "../components/MyIframe";
import Tree from "../components/Tree";
import ProofingApplication from "../view/ProofingApplication";
import MyCalendar from "../view/MyCalendar";
import FormActive from "../components/FormActive";
import ImageList from "../components/ImageList";
import Lab from "../view/Lab";

const router = [
    {
        id: "login",
        path: "/login",
        exact: true,
        component: Login
    },
    {
        id: "main",
        path: "/main",
        component: Main,
        children:[]
    }
];


export const components = {
    tablepage: TalbePage,
    customize: Iframe,
    treepage: Tree,
    proofingApplication: ProofingApplication,
    myCalendar: MyCalendar,
    myIframe: MyIframe,
    formActive: FormActive,
    ImageList: ImageList,
    Lab: Lab
};

let findRouter = (router, path, result) => {
    for (let i = 0; i < router.length; i++) {
        let item = router[i];
        if (item.children && item.children.length) {
            findRouter(item.children, path, result);
        } else if (item.path === path) {
            result.route = { ...item };
        }
    }
};
// 查询新增组件
export let findRouterReturn = (router, path) => {
    let result = {};
    findRouter(router, path, result);
    return result.route;
};

export default router;
