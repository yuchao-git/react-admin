import React from "react";
import { transferAuthUrl } from "../../common/auth";

class Myiframe extends React.Component {
    render() {
        let { friendlyurl } = this.props;
        let url = transferAuthUrl(friendlyurl);
        return (
            <iframe
                style={{
                    border: "none",
                    width: "100%",
                    height: "calc(100vh - 3.75rem)"
                }}
                src={url}
            />
        );
    }
}
export default Myiframe;
