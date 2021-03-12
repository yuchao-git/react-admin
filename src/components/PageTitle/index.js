import React from "react";
import { Icon,Upload,Button,Menu,Dropdown } from "antd";
import SearchForm from "../SearchForm";
import "./index.css";

export const ButtonList = ({ controlBarConfig, auth = [], exportFn, importFn }) => {
  let children = [];
  let buttonArray = controlBarConfig.slice(0, 10);
  let menuArray = controlBarConfig.slice(10);

  buttonArray.map(item => {
    let controlID = item.id;
    let controlType = item.type;
    let controlTitle = item.title;
    let icon = item.icon;
    let click = item.onclick;
    controlType === "IMPORT_DATA"
      ? children.push(
          <Upload key={controlID} customRequest={item.onclick} withCredentials={true}>
            <Button><Icon type={icon} />{controlTitle}</Button>
          </Upload>
      
        )
      : children.push(
          <Button key={controlID} type={controlType} onClick={click}>
						<Icon type={icon} />
            {controlTitle}
          </Button>
        );
  });

  if (menuArray.length) {
    let menuChildren = [];
    let dropdownClick = {};
    menuArray.map(item => {
      let controlID = item.id;
      let controlType = item.type;
      let controlTitle = item.title;
      let click = item.onclick;
      dropdownClick[controlID] = click;
      menuChildren.push(
        <Menu.Item key={controlID} type={controlType}>
          {controlTitle}
        </Menu.Item>
      );
    });
    children.push(
      <Dropdown
        key="dropDown"
        overlay={
          <Menu
            onClick={({ key }) => {
              dropdownClick[key]();
            }}>
            {menuChildren}
          </Menu>
        }>
        <Button>
          更多操作<Icon type="down" />
        </Button>
      </Dropdown>
    );
  }

  return children;
};

class PageTitle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSearch: false
    };
	}
	// shouldComponentUpdate(nextProps,nextState){
	// 	if(nextState.showSearch !== this.state.showSearch){
	// 		return true
	// 	}else{
	// 		return false
	// 	}
	// }
  changeSearch = () => {
    this.setState({
      showSearch: !this.state.showSearch
    });
  };
  render() {
    let { showSearch } = this.state;
    let {
      configData,//查询配置
      updateSearchParams,
			searchTableAction,
			controlBarConfig=[]
    } = this.props;
    return (
      <React.Fragment>
        <div className="page_title">
          <div className="button_active">
            {configData ? (
              <Icon style={{color:'#47b0ff',verticalAlign: 'middle'}} onClick={this.changeSearch} type="search" />
            ) : null}
						{
							controlBarConfig.length?
							<ButtonList controlBarConfig={controlBarConfig} />:null
						}
          </div>
          {
            configData?
            <div className={`search ${showSearch ? "active" : null}`}>
              <SearchForm
                changeSearch={this.changeSearch}
                updateSearchParams={updateSearchParams}
                searchTableAction={searchTableAction}
                configData={configData}
              />
            </div>:null
          }
        </div>
      </React.Fragment>
    );
  }
}
export default PageTitle;
