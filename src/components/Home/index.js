import React from "react";
import { Menu, Icon, Modal, Popover } from "antd";
import "./index.css";

class MenuNav extends React.Component {
    constructor(props) {
        super(props);
        let children = props.children;
        let firstChild = children.find(item => !item.hidden) || { path: 0, children: [] };
        this.state = {
            firstChild,
            silderArr: firstChild.children,
            modalConfig: {},
            expire: parseInt(localStorage.getItem("manamge_expire")),
            modifyVisible: false
        };
    }
    render() {
        return (
            <div className="header main-body-header">
                <div className="logo" />
            
            </div>
        );
    }
}
export default MenuNav;
