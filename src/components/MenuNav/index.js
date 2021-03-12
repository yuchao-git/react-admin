import React from "react";
import { Menu, Icon, Modal, Popover,Button } from "antd";
import MySider from "../MySider";
import MyModal from "../MyModal";
import { loginUrl, commonUrl } from "../../common/url";
import $http from "../../common/fetch";
import { REMOVEREQUIREHEADER, REMOVEMENU } from "../../common/auth";
import "./index.css";

class MenuNav extends React.Component {
  constructor(props) {
    super(props);
    let children = props.children;
    let firstChild = children.find(item => !item.hidden) || {
      path: 0,
      children: []
    };
    this.state = {
      firstChild,
      silderArr: firstChild.children,
      modalConfig: {},
      expire: parseInt(localStorage.getItem("manamge_expire")),
      modifyVisible: false
    };
  }
  selectMenu = silderArr => {
    this.setState({
      silderArr
    });
  };
  loginOut = () => {
    let { history } = this.props;
    Modal.confirm({
      content: "是否确认退出?",
      onOk: () => {
        $http.postData(loginUrl.signout).then(req => {
          REMOVEREQUIREHEADER();
          REMOVEMENU();
          history.push("/login");
        });
      }
    });
  };
  updatePassWord = () => {
    let modalConfig = {
      title: "修改密码",
      width: 600,
      data: [
        {
          id: "oldpwd",
          label: "旧密码",
          hide: false,
          type: "text",
          col: 24,
          rules: [
            {
              required: true,
              message: "不能为空"
            }
          ]
        },
        {
          id: "newpwd",
          label: "新密码",
          hide: false,
          type: "text",
          col: 24,
          rules: [
            {
              required: true,
              message: "不能为空"
            }
          ]
        },
        {
          id: "confirmpwd",
          label: "确定密码",
          hide: false,
          type: "text",
          col: 24,
          rules: [
            {
              required: true,
              message: "不能为空"
            }
          ]
        }
      ]
    };
    this.setState({
      modalConfig,
      modifyVisible: true
    });
  };
  handleOk = () => {
    let { history } = this.props;
    let someparam = this.MyModal.handleOk();
    if (someparam.newpwd !== someparam.confirmpwd) {
      Modal.info({
        content: "二次输入密码不一致"
      });
      return;
    }
    $http.postData(loginUrl.updatePassWord, someparam).then(req => {
      this.setState({
        modifyVisible: false
      });
      Modal.success({
        content: "修改成功",
        onOk:()=>{
          REMOVEREQUIREHEADER();
          REMOVEMENU();
          history.push("/login");
        }
      });
    });
  };
  cancel = () => {
    this.setState({
      modifyVisible: false
    });
  };
  userActive = () => {
    return (
      <React.Fragment>
        <div className="active" onClick={this.updatePassWord}>
          <Icon type="export" />
          修改密码
        </div>
        <div className="active" onClick={this.loginOut}>
          <Icon type="export" />
          退出登录
        </div>
      </React.Fragment>
    );
  };
  render() {
    let { children } = this.props;
    let {
      silderArr,
      modalConfig,
      modifyVisible,
      expire,
      firstChild
    } = this.state;
    return (
      <React.Fragment>
        <div className="header main-body-header">
          <div className="logo" />
          <div className="menu">
            <Menu
              style={{
                lineHeight: "2rem",
                flexGrow: "1"
              }}
              defaultSelectedKeys={firstChild.path}
              mode="horizontal"
            >
              {children
                .filter(ele => !ele.hidden)
                .map(item => {
                  return (
                    <Menu.Item
                      onClick={() => {
                        this.selectMenu(item.children);
                      }}
                      key={item.path}
                    >
                      <Icon type="user" />
                      {item.title}
                    </Menu.Item>
                  );
                })}
            </Menu>
            <div className="active_box">
              <span
                style={{
                  color: "red",
                  lineHeight: "2.5rem",
                  paddingRight: "0.5rem"
                }}
              >
                {expire && expire < 30 ? `您的系统还有${expire}天到期` : null}
              </span>
              <Popover placement="bottom" content={this.userActive()}>
                <div>
                  <Icon type="user" />{" "}
                  <span>{localStorage.getItem("manage_user")}</span>
                </div>
              </Popover>
            </div>
          </div>
        </div>
        <MySider silderArr={silderArr} {...this.props} />
        <MyModal
          modalConfig={modalConfig}
          visible={modifyVisible}
          footer={
            [
              <Button key="check" onClick={this.cancel}>
                取消
              </Button>,
              <Button key="submit" type="primary" onClick={this.handleOk}>
                确定
              </Button>
            ]
          }
          ref={node => (this.MyModal = node)}
        />
      </React.Fragment>
    );
  }
}
export default MenuNav;
