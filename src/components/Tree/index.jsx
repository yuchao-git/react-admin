import React from "react";
import MyForm from "../MyForm";
import $http from "../../common/fetch";
import PageTitle from "../PageTitle";
import moment from "moment";
import { Tree, Button, Modal,Menu,Dropdown,Icon } from "antd";
import { realroot } from "../../common/url";
import validation from "../../common/validation";
import router, { findRouterReturn } from "../../common/router";
import { GETREQUIREHEADER,getUserMenu } from "../../common/auth";
import "./index.css";
const { TreeNode } = Tree;
let qs = require("qs");
class TreePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, //树对象
      controlBarConfig: [], //功能按钮
      modalConfig: null, //新增编辑form表单
      modalFooter: [] //新增编辑后的功能按钮
    };
  }
  getData = async (url, params, config) => {
    return $http.postData(url, params, config).then(resp => {
      return resp;
    });
  };
  renderTreeNodesTitle = (title, btns) => {
    //加载更多功能的按钮
    let renderMoreButs = butArray => {
      return (
        <Menu>
          {butArray.map(item => {
            return (
              <Menu.Item key={item.url}>
                <a
                  style={{color:'#1890ff'}}
                  key={item.url}
                  onClick={() => {
                    if (item.target === "_BLANK") {
                      window.open(
                        `${item.url}${
                          item.url.includes("?") ? "&&" : "?"
                        }${qs.stringify(GETREQUIREHEADER())}`
                      );
                    } else {
                      this[item.fun](`${realroot}${item.url}`, item);
                    }
                  }}
                >
                  {item.title}
                </a>
              </Menu.Item>
            );
          })}
        </Menu>
      );
    };
    return (
      <div>
        <span>{title}</span>
        <Dropdown overlay={renderMoreButs(JSON.parse(btns))}>
          <a style={{marginLeft:'1rem'}} className="ant-dropdown-link">
            <Icon type="pushpin" />  
          </a>
        </Dropdown>
      </div>
    );
  };
  renderTreeNodes = data => {
    return data.map(item => {
      if (item.child) {
        return (
          <TreeNode
            title={this.renderTreeNodesTitle(item.name, item.bakstr1)}
            key={item.orgcode}
            dataRef={item}
          >
            {this.renderTreeNodes(item.child)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });
  };
  async componentDidMount() {
    this.getServerData();
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
  //新增
  SHOW_ADD = async url => {
    let { parentPageId = "" } = this.props;
    let addconfig = await this.getData(`${url}&upparams=${parentPageId}`);
    let modalConfig = {
      title: "新增",
      width: 800,
      data: (() => {
        return addconfig.body.map(item => ({
          id: item.code,
          label: item.title,
          type: item.type,
          format: item.format,
          rules: validation.init(item.css || ""),
          option: item.option || []
        }));
      })()
    };
    this.setState({
      modalConfig,
      modalFooter: this.InitModalFooter(addconfig.next || [])
    });
  };
  //修改
  SHOW_EDIT = async url => {
    let updateconfig = await this.getData(url);
    let modalConfig = {
      title: "修改",
      width: 800,
      data: (() => {
        return updateconfig.body.map(item => ({
          id: item.code,
          disabled: item.readonly,
          label: item.title,
          type: item.type,
          format: item.format,
          option: item.option || [],
          rules: validation.init(item.css || ""),
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
        }));
      })()
    };
    this.setState({
      modalConfig,
      modalFooter: this.InitModalFooter(updateconfig.next || [])
    });
  };
  //新增tabs
  SHOW_DRILL = (url, item) => {
    let { addTab } = this.props;
    let arr = item.url.split("?");
    let path; //用来在router中寻找一样的,打开此页面

    //自定义页面有参数(多出一个code和upparams)  所以要特殊处理
    if (item.url.startsWith("http")) {
      let params = qs.parse(arr[1]);
      delete params.code;
      delete params.upparams;
      path = arr[0] + "?" + qs.stringify(params).replace(/&/g, "&&");
    } else {
      path = arr[0];
    }
    let parentPageId = qs.parse(arr[1]).upparams;
    let addRouter = findRouterReturn(getUserMenu(), path);

    if (addRouter) {
      addRouter.friendlyurl = item.url;
      addRouter.title = item.drillkey + "-" + addRouter.title;
      addTab({ ...addRouter, parentPageId });
    } else {
      Modal.error({ content: "菜单中找不到当前路径" });
    }
  };
  //权限
  DATA_PERMISSION = async url => {
    let authconfig = await this.getData(url);
    let modalConfig = {
      title: "权限配置",
      width: 1000,
      data: (() =>
        authconfig.body.map(item => ({
          id: item.code,
          label: item.name,
          type: "checkBox",
          hide: false,
          col: 24,
          span: 5,
          initialValue: item.selbuts || [],
          formItemLayout: {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 4 }
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 20 }
            }
          },
          option: item.buttons.map(ele => ({
            code: ele.code,
            name: ele.title
          }))
        })))()
    };
    this.setState({
      modalShow: true,
      modalConfig,
      modalFooter: this.InitModalFooter(authconfig.next || [])
    });
  };
  //删除
  DELETE_DATA = url => {
    Modal.confirm({
      title: "是否删除?",
      onOk: async () => {
        await this.getData(url, []);
        await this.getServerData();
        Modal.success({
          content: "删除成功"
        });
      }
    });
  };
  save = async url => {
    let someparams = this.MyForm.getfieldsValue();

    if (someparams) {
      let params = Object.assign({}, { ...someparams });

      await this.getData(url, params);
      await this.getServerData();
      this.setState({
        modalConfig: null
      });
    }
  };
  getServerData = async () => {
    let url = `${realroot}${this.props.path}`;
    let treeconfig = await $http.postData(url);
    let controlBarConfig = treeconfig.body.buttonArea.map(item => {
      let button = {
        id: item.code || "",
        title: item.title || "",
        type: item.type,
        icon: item.icon || "form",
        onclick: () => {
          this[item.type](`${realroot}${item.url}`);
        }
      };
      if (item.type === "SHOW_DRILL") {
        button.onclick = () => {
          this[item.type](`${realroot}${item.url}`, item);
        };
      }
      return button;
    });
    this.setState({ data: treeconfig.body.list, controlBarConfig });
  };
  render() {
    let { data, modalFooter, modalConfig, controlBarConfig } = this.state;
    return (
      <React.Fragment>
        <PageTitle controlBarConfig={controlBarConfig} />
        <div className="treePage">
          <div className="treeBox">
            {data ? <Tree showLine>{this.renderTreeNodes(data)}</Tree> : null}
          </div>
          {modalConfig ? (
            <div className="formBox">
              <div>{modalConfig.title}</div>
              <MyForm
                key={modalConfig.title}
                wrappedComponentRef={form => (this.MyForm = form)}
                data={modalConfig.data}
              />
              {modalFooter}
            </div>
          ) : null}
        </div>
      </React.Fragment>
    );
  }
}
export default TreePage;
