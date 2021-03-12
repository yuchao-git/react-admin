import React from "react";
import Iframe from "../Iframe";
import { Button, Modal, message } from "antd";
import MyForm from "../MyForm";
import { realroot } from "../../common/url";
import $http from "../../common/fetch";
import moment from "moment";
import validation from "../../common/validation";
import "./index.css";

let qs = require("qs");
class MyIframe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showIframe: true,
      friendlyurl: null,
      modalFooter: [],
      modalConfig: null
    };
  }
  getData = async (url, params, config) => {
    return $http.postData(url, params, config).then(resp => {
      return resp;
    });
  };
  // 构建弹框的按钮
  InitModalFooter = data => {
    return data.map(item => {
      return (
        <Button
          key={item.type}
          className={item.type}
          size="large"
          onClick={() => {
            this[item.type](`${realroot}${item.url}`);
          }}
        >
          {item.title}
        </Button>
      );
    });
  };
  async componentDidMount() {
    let { path, parentPageId = "" } = this.props;
    // friendlyurl = "http://localhost:3100/fac/aaa";
    let data = await this.getData(
      `${realroot}${path}?${qs.stringify({ upparams: parentPageId })}`
    );
    let modalConfig = {
      title: "修改",
      width: 800,
      data: (() => {
        return data.body.config.map(item => {
          return {
            id: item.code,
            disabled: item.readonly,
            label: item.title,
            type: item.type,
            format: item.format,
            option: item.option || [],
            rules: validation.init(item.css || ""),
            onChange: async value => {
              if (item.linkage) {
                let { modalConfig } = this.state;

                let data = await this.getData(`${realroot}${item.linkageUrl}`, {
                  id: value
                });
                modalConfig.data.map(ele => {
                  if (ele.id === item.linkage) {
                    ele.option = data.body.option;
                    this.MyForm.setFieldsValue(ele.id);
                  }
                });
                this.setState({ modalConfig });
              }
            },
            initialValue: (() => {
              let value;
              switch (item.type) {
                case "img":
                  value = item.url
                    ? [
                        {
                          url: `${realroot}${item.url}`,
                          uid: item.url.split("id=")[1],
                          name: item.val
                        }
                      ]
                    : [];
                  break;
                case "file":
                  value = item.url
                    ? [
                        {
                          url: item.url,
                          uid: item.url.split("id=")[1],
                          name: item.val
                        }
                      ]
                    : [];
                  break;
                default:
                  value = item.val;
                  break;
              }
              return value;
            })()
          };
        });
      })()
    };
    this.setState({
      friendlyurl: data.body.friendlyurl,
      modalConfig,
      modalFooter: this.InitModalFooter(data.next || [])
    });
  }
  save = url => {
    let { parentPageId } = this.props;
    let someparams = this.MyForm.getfieldsValue();
    if (someparams) {
      this.setState({ showIframe: false }, async () => {
        let params = Object.assign({}, { ...someparams });
        await this.getData(
          `${url}?${qs.stringify({ upparams: parentPageId })}`,
          params
        );
        Modal.success({
          content: "保存成功",
          onOk: () => {
            this.setState({ showIframe: true });
          }
        });
      });
    }
  };
  render() {
    let { modalFooter = [], modalConfig, friendlyurl, showIframe } = this.state;
    return (
      <div className="my_iframe">
        <div style={{ visibility: `${showIframe ? "visible" : "hidden"}` }}>
          {friendlyurl ? <Iframe friendlyurl={friendlyurl} /> : null}
        </div>
        {modalConfig ? (
          <div style={{ marginTop: "1rem" }}>
            <MyForm
              wrappedComponentRef={form => (this.MyForm = form)}
              data={modalConfig.data}
            />
          </div>
        ) : null}
        <div className="btns">{modalFooter}</div>
      </div>
    );
  }
}
export default MyIframe;
