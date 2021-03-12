import React from "react";
import { getUserMenu } from "../../common/auth";
import MenuNav from "../../components/MenuNav";

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.userMenu = getUserMenu();
        if (this.userMenu.length === 0) {
            props.history.push("/login");
        }
    }

    render() {
        return (
            <div className="main_body">
                <MenuNav children={this.userMenu} history={this.props.history} />
            </div>
        );
    }
}

export default Main;
