import React from "react";
import {
  DatePicker,
  Cascader,
  Input,
  Spin,
  Form,
  Row,
  Col,
  Button,
  Select,
  Icon,
  Radio
} from "antd";
import moment from "moment";
import $http from "../../common/fetch";
import "./index.css";

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;

class SearchForm extends React.Component {
  constructor(props) {
    super(props);
    let {configData} = props;
    this.serverUrl = {};
    this.state = {
      expand: false,
      isBegin: false,
      serverCategory: {},
      model: {}
    };

    // 如果该值存在则需要进行查询状态的保留
    this.localPrefix = configData.localPrefix || "";
    // 创建数据模型用于提交
    configData.form.map(item => {
      let id = item.id;
      let data = item.data;
      let type = item.type;
      switch (type) {
        case "range":
          let startID = id + "Start";
          let endID = id + "End";
          this.state.model[startID] = this.getFormItemLocalValue(startID);
          this.state.model[endID] = this.getFormItemLocalValue(endID);
          break;
        case "select":
          if (typeof data === "string") {
            this.serverUrl[id] = data;
            this.state.serverCategory[id] = [];
          }
          this.state.model[id] = this.getFormItemLocalValue(id);
          break;
        default:
          this.state.model[id] = this.getFormItemLocalValue(id);
      }
    });

    this.toggleCategory = this.toggleCategory.bind(this);
    this.updateStateModel = this.updateStateModel.bind(this);
    this.changeCategoryModelData = this.changeCategoryModelData.bind(this);
    this.changeRangerModelData = this.changeRangerModelData.bind(this);
    this.getSearchCategory = this.getSearchCategory.bind(this);
    this.getAllSearchCategory = this.getAllSearchCategory.bind(this);
  }

  // 获取当前查询数据的本地值
  getFormItemLocalValue = id => {
    let localValue = "";
    if (this.localPrefix) {
      localValue = localStorage.getItem(`${this.localPrefix}.${id}`) || "";
    }
    return localValue;
  };

  // 赋值当前查询状态的数据
  setFormItemLocalValue = (id, value) => {
    if (this.localPrefix) {
      localStorage.setItem(`${this.localPrefix}.${id}`, value);
    }
  };

  // 绑定日期范围选择框
  changeRangerModelData(momentDateArray, stringDateArray, modelID) {
    let currentModel = Object.assign({}, this.state.model);
    let startID = modelID + "Start";
    currentModel[startID] = stringDateArray[0];
    this.setFormItemLocalValue(startID, stringDateArray[0]);
    let endID = modelID + "End";
    currentModel[endID] = stringDateArray[1];
    this.setFormItemLocalValue(endID, stringDateArray[1]);
    this.updateStateModel(currentModel);
  }

  // 绑定标签选择框
  changeCategoryModelData(modelID, value) {
    let currentModel = Object.assign({}, this.state.model);
    let tempValue;
    if (value instanceof Array) {
      tempValue = value;
    } else {
      tempValue = typeof value === "object" ? value.target.value : value;
    }
    currentModel[modelID] = tempValue;
    this.setFormItemLocalValue(modelID, tempValue);
    this.updateStateModel(currentModel);
  }

  // 更新state，同时提交请求
  updateStateModel(model) {
    this.setState({ model });
    this.props.updateSearchParams(model);
  }

  // 获取table数据
  searchTableData = () => {
    let { changeSearch } = this.props;
    changeSearch();
    this.props.searchTableAction(this.state.model);
  };

  // 获取category数据
  getSearchCategory(url) {
    this.setState({ isBegin: true });
    return $http.post(url).then(resp => {
      this.setState({ isBegin: false });
      return resp;
    });
  }

  getSearchForm = () => {
    let {configData} = this.props;
    let { expand } = this.state;
    let children = [];

    configData.form.map((item, index) => {
      children.push(
        <Col
          span={8}
          key={index}
          style={{ display: expand || index < 6 ? "block" : "none" }}
        >
          {this.getSearchFormItem(item)}
        </Col>
      );
    });
    return children;
  };

  getSearchFormItem = item => {
    let { getFieldDecorator } = this.props.form;
    let title = item.title;
    let id = item.id;
    let data = item.data;
    let elementType = "";
    let elementProps = {};
    let elementChildren = [];
    let initialValue = this.getFormItemLocalValue(id);
    elementProps.onChange = value => this.changeCategoryModelData(id, value);
    switch (item.type) {
      case "radio":
        elementType = Radio.Group;
        elementProps.style = { width: "100%" };
        data.map((optionItem, index) => {
          let optionKey = optionItem.code;
          elementChildren.push(
            <Radio key={index} value={`${optionKey}`}>
              {optionItem.name}
            </Radio>
          );
        });
        break;
      case "range":
        elementType = RangePicker;
        let dateFormat = "YYYY-MM-DD";
        elementProps.style = { width: "100%" };
        let startDate = this.getFormItemLocalValue(id + "Start");
        let endDate = this.getFormItemLocalValue(id + "End");
        initialValue = [];
        if (startDate || endDate) {
          initialValue = [
            moment(startDate, dateFormat),
            moment(endDate, dateFormat)
          ];
        }
        elementProps.onChange = (momentDates, stringDates) =>
          this.changeRangerModelData(momentDates, stringDates, id);
        break;
      case "timeRange":
        elementType = RangePicker;
        elementProps.style = { width: "100%" };
        elementProps.showTime = { format: "HH:mm:ss" };
        elementProps.format = "YYYY-MM-DD HH:mm:ss";
        elementProps.onChange = (momentDates, stringDates) =>
          this.changeRangerModelData(momentDates, stringDates, id);
        break;
      case "select":
        let optionData =
          typeof data === "string" ? this.state.serverCategory[id] : data;
        elementType = Select;
        elementProps.showSearch = true;
        elementProps.optionFilterProp = "children";

        optionData.map((optionItem, index) => {
          let optionKey = optionItem.code;
          elementChildren.push(
            <Option key={index} value={`${optionKey}`}>
              {optionItem.name}
            </Option>
          );
        });
        break;
      case "cascader":
        let options =
          typeof data === "string" ? this.state.serverCategory[id] : data;
        elementType = Cascader;
        elementProps.options = options;
        break;
      case "date":
        elementType = DatePicker;
        initialValue = null;
        elementProps.showTime = item.format.includes('HH:mm:ss')
        elementProps.onChange = value => this.changeCategoryModelData(id, value.format(item.format));
        break;
      default:
        elementType = Input;
        elementProps.onPressEnter = this.searchTableData;
        break;
    }
    return (
      <FormItem key={id} label={title}>
        {getFieldDecorator(id, {
          initialValue
        })(
          elementChildren.length
            ? React.createElement(elementType, elementProps, [
                ...elementChildren
              ])
            : React.createElement(elementType, elementProps)
        )}
      </FormItem>
    );
  };

  getAllSearchCategory() {
    const serverUrlKeys = Object.keys(this.serverUrl);
    // 清空已经添加的serverCategory;
    const serverCategory = {};
    let index = serverUrlKeys.length;
    while (serverUrlKeys.length > 0) {
      let tempServerUrlKey = serverUrlKeys.shift();
      this.getSearchCategory(this.serverUrl[tempServerUrlKey]).then(resp => {
        index--;
        serverCategory[tempServerUrlKey] = resp.records;
        // 最后一个的时候执行显示影藏功能
        if (index === 0) {
          this.setState({
            serverCategory
          });
        }
      });
    }
  }

  componentDidMount() {
    this.getAllSearchCategory();
    if (this.props.configData.localPrefix) {
      this.props.updateSearchParams(this.state.model);
      this.searchTableData();
    }
  }

  toggleCategory() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  handleReset = () => {
    let model = Object.assign({}, this.state.model);
    for (const key in model) {
      model[key] = "";
      this.setFormItemLocalValue(key, "");
    }
    this.props.form.resetFields();
    this.updateStateModel(model);
  };

  render() {
    let { expand } = this.state;
    return (
      <div className="search-content">
        <Form className="search-form">
          <Spin tip="初始化查询数据中，请稍后..." spinning={this.state.isBegin}>
            <Row>{this.getSearchForm()}</Row>
            <Row>
              <Col span={24} style={{ textAlign: "right" }}>
                {this.props.configData.form.length > 6 ? (
                  <span
                    style={{ marginRight: 8, fontSize: 12 }}
                    onClick={this.toggleCategory}
                  >
                    {expand ? "收缩" : "展开"}
                    <Icon type={expand ? "up" : "down"} />
                  </span>
                ) : null}
                <Button type="primary" onClick={this.searchTableData}>
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                  重置
                </Button>
              </Col>
            </Row>
          </Spin>
        </Form>
      </div>
    );
  }
}

export default Form.create()(SearchForm);
