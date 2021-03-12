import React from "react";
import $http from "../../common/fetch";
import { realroot } from "../../common/url";
import validation from '../../common/validation';
import MyForm from "../MyForm";
import {Button} from 'antd';
let qs = require("qs");
class FormActive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalConfig: {
        data: [],
        
      },
      modalFooter: [],
    };
  }
  // 构建弹框的按钮
  InitModalFooter = data => {
    return data.map(item => {
      return (
        <Button
          key={item.type}
          className={item.type}
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
    let { parentPageId = "" } = this.props;
    let url = `${realroot}${this.props.path}`;
    let configData = await $http.postData(`${url}?${qs.stringify({upparams: parentPageId})}`
    );
    let modalConfig = {
        data: (() => {
          return configData.body.map(item => ({
            id: item.code,
            label: item.title,
            type: item.type,
            format: item.format,
            option: item.option || [],
            rules: validation.init(item.css || ""),
            //改变的联动(不支持多对多,多对一);
            onChange: async value => {
              if (item.linkage) {
                let { modalConfig } = this.state;
                let linkage = item.linkage.split(",");
                let data = {};
                for (let i = 0; i < linkage.length; i++) {
                  data[linkage[i]] = await this.getData(
                    `${realroot}${item.linkageUrl}`,
                    { id: value, key: linkage[i] }
                  );
                }
                modalConfig.data.map(ele => {
                  if (!!data[ele.id]) {
                    ele.option = data[ele.id].body.option;
                    this.MyModal.MyForm.setFieldsValue(ele.id);
                  }
                });
                this.setState({ modalConfig });
              }
            }
          }));
        })()
      };
    this.setState({
        modalConfig,
        modalFooter: this.InitModalFooter(configData.next || [])
    })
  }
  /**
   * 导出有3种
   * 1.导出模板,没有参数导入
   * 2.导出筛选数据
   * 3.导出勾选数据
   * 这里我们不区分,由后台接口自行取参数
   * */
  export = (
    url,
    fileName = "EXPORT_" + new Date().getTime() + ".xlsx",
    params = {}
  ) => {
    let searchParams = this.MyForm.getfieldsValue();

    let postParams = Object.assign({}, searchParams, params);

    $http.fileData(url, postParams).then(fileBlob => {
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(fileBlob, fileName);
      } else {
        var blobUrl = URL.createObjectURL(fileBlob);
        var save_link = document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "a"
        );
        save_link.href = blobUrl;
        save_link.download = fileName;
        save_link.style.display = "none";
        document.body.appendChild(save_link);
        save_link.click();
        document.body.removeChild(save_link);
      }
    });
  };
  render() {
    let { modalConfig,modalFooter} = this.state;
    return (
      <React.Fragment>
        <MyForm
          wrappedComponentRef={form => (this.MyForm = form)}
          data={modalConfig.data}
        />
        {
            modalFooter
        }
      </React.Fragment>
    );
  }
}
export default FormActive;
