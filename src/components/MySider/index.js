import React from "react";
import { Layout, Menu, Icon, Tabs } from "antd";
import { components } from "../../common/router";
import { transferAuthUrl } from "../../common/auth";
import "./index.css";
const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const { Content, Sider } = Layout;
class MySider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabsArr: [],
            activeKey: ""
        };
    }
    tabChange = activeKey => {
        this.setState({ activeKey });
    };
    addTab = item => {
        // let {history} = this.props;
        let { tabsArr } = this.state;
        if (tabsArr.some(ele => ele.friendlyurl === item.friendlyurl)) {
            this.setState({
                activeKey: item.friendlyurl
            });
        } else {
            tabsArr.push(item);
            this.setState({
                tabsArr,
                activeKey: item.friendlyurl
            });
        }
    };
    remove = targetKey => {
        let { activeKey } = this.state;

        let lastIndex;
        this.state.tabsArr.forEach((pane, i) => {
            if (pane.friendlyurl === targetKey) {
                lastIndex = i - 1;
            }
        });
        const tabsArr = this.state.tabsArr.filter(pane => pane.friendlyurl !== targetKey);
        if (tabsArr.length && activeKey === targetKey) {
            if (lastIndex >= 0) {
                activeKey = tabsArr[lastIndex].friendlyurl;
            } else {
                activeKey = tabsArr[0].friendlyurl;
            }
        }
        this.setState({ tabsArr, activeKey });
    };
    onEdit = (targetKey, action) => {
        this[action](targetKey);
    };
    render() {
        let { silderArr } = this.props;
        let { tabsArr, activeKey } = this.state;
        return (
            <Layout className="main-body-content">
                <Sider width={170} collapsible>
                    <Menu
                        mode="inline"
                        style={{
                            maxHeight: "calc(100vh - 3.2rem)",
                            overflowY: "auto",
                            overflowX: "hidden",
                            borderRight: 0
                        }}
                    >
                        {silderArr
                            .filter(ele => !ele.hidden)
                            .map(item => {
                                if (item.children) {
                                    return (
                                        <SubMenu
                                            key={item.path}
                                            title={
                                                <div>
                                                    <Icon type="user" />
                                                    <span>{item.title}</span>
                                                </div>
                                            }
                                        >
                                            {item.children
                                                .filter(ele => !ele.hidden)
                                                .map(element => (
                                                    <Menu.Item
                                                        onClick={() => {
                                                            if (!(element.target === "_BLANK")) {
                                                                this.addTab(element);
                                                            }
                                                        }}
                                                        key={element.path}
                                                    >
                                                        <Icon type="user" />
                                                        {element.target === "_BLANK" ? (
                                                            <a href={transferAuthUrl(element.path)} target="_blank">
                                                                {element.title}
                                                            </a>
                                                        ) : (
                                                            <span>{element.title}</span>
                                                        )}
                                                    </Menu.Item>
                                                ))}
                                        </SubMenu>
                                    );
                                }
                                return (
                                    <Menu.Item
                                        onClick={() => {
                                            if (!(item.target === "_BLANK")) {
                                                this.addTab(item);
                                            }
                                        }}
                                        key={item.path}
                                    >
                                        <Icon type="user" />
                                        {item.target === "_BLANK" ? (
                                            <a href={transferAuthUrl(item.path)} target="_blank">
                                                {item.title}
                                            </a>
                                        ) : (
                                            item.title
                                        )}
                                    </Menu.Item>
                                );
                            })}
                    </Menu>
                </Sider>
                <Layout>
                    <Content
                        style={{
                            height: "calc(100vh - 2rem)",
                            overflow: "auto"
                        }}
                    >
                        {tabsArr.length ? (
                            <Tabs hideAdd onEdit={this.onEdit} activeKey={activeKey} onChange={this.tabChange} type="editable-card">
                                {tabsArr.map(item => {
                                    let itemComponent = components[item.component] || components["tablepage"];
                                    return (
                                        <TabPane tab={item.title} key={item.friendlyurl}>
                                            {React.createElement(itemComponent, {
                                                ...item,
                                                addTab: this.addTab
                                            })}
                                        </TabPane>
                                    );
                                })}
                            </Tabs>
                        ) : (
                            "本系统页面"
                        )}
                    </Content>
                </Layout>
            </Layout>
        );
    }
}
export default MySider;
