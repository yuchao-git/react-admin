import React from "react";
import $http from "../../common/fetch";
import {realroot} from "../../common/url";
import "./index.css";

let qs = require("qs");
class ImageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }
  async componentDidMount() {
    let { parentPageId, selectedRowKeys, path } = this.props;
    let data = await $http.postData(
      `${realroot}${path}?${qs.stringify({
        upparams: parentPageId
      })}`,
      { selectArr: selectedRowKeys }
    );
    this.setState({data:data.body})
  }
  render() {
    let { data } = this.state;
    return (
      <React.Fragment>
        <div className="bed_code">
          {data.map(item => {
            return (
              <div className="box" key={item.url}>
                <div className="image_box">
                  <img
                    src={`${realroot}${item.url}`}
                    alt=""
                  />
                </div>
                <p>{item.dec}</p>
              </div>
            );
          })}
        </div>
      </React.Fragment>
    );
  }
}

export default ImageList;
