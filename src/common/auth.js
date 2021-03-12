import router from "./router";
let qs = require("qs");
//登录之后的id(带到请求头中)
export let GETREQUIREHEADER = () => {
    return {
        ud: localStorage.getItem("manage_ud") || "",
        cd: localStorage.getItem("manage_cd") || ""
    };
};

// 将ud、cd带入到url中
export let transferAuthUrl = friendlyurl => {
    let url = `${friendlyurl}${friendlyurl.includes("?") ? "&&" : "?"}${qs.stringify(GETREQUIREHEADER())}`;
    return url;
};

export let REMOVEREQUIREHEADER = () => {
    localStorage.removeItem("manage_ud");
    localStorage.removeItem("manage_cd");
};
export let REMOVEMENU = () => {
    localStorage.removeItem("manage_menu");
};

// 递归处理菜单权限数据
let recursive = data => {
    data.forEach(async element => {
        if (element.child && element.child.length) {
            recursive(element.child);
        }
        element.children = element.child;
        element.title = element.name;
        element.id = element.menucode;
        element.path = element.friendlyurl;
    });
};

// 权限处理
export let authUserMenu = (data = []) => {
    recursive(data);
    // 存放处理过的菜单数据
    localStorage.setItem("manage_menu", JSON.stringify(data));
};

// 获取处理过后的菜单数据
export let getUserMenu = () => {
    let menuData = localStorage.getItem("manage_menu") || "[]";
    return JSON.parse(menuData);
};
