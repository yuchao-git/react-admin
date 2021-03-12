import React from "react";
import moment from "moment";
import { Calendar, Button, Select, Form, Input } from "antd";
import { realroot } from "../../common/url";
import MyModal from "../../components/MyModal";
import $http from "../../common/fetch";
import validation from "../../common/validation";
import {myCalendarUrl} from '../../common/url'
import "./index.css";
const Option = Select.Option;
const FormItem = Form.Item;

class MyCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dateObj: {},
      factoryArr: [],
      factoryValue: "",
      num: "",
      value: moment(new Date(), "YYYY-MM")
    };
  }
  getData = async (url, params, config) => {
    return $http.postData(url, params, config).then(resp => {
      return resp;
    });
  };
  async componentDidMount() {
    // let url = "http://localhost:3100/fac/ccc";
    let factoryArr = await this.getData(myCalendarUrl.selectArr);
    this.setState(
      {
        factoryArr: factoryArr.body,
        factoryValue: factoryArr.body[0].code
      },
      this.getServerData
    );
  }
  getServerData = async () => {
    let { value, factoryValue } = this.state;
    let url = `${realroot}${this.props.path}`;
    // url = "http://localhost:3100/fac/aaa";
    let nowDate = value.format("YYYY-MM");
    let dateObj = await this.getData(url, {
      date: nowDate,
      factory: factoryValue
    });
    this.setState({
      dateObj: dateObj.body.date,
      num: dateObj.body.num
    });
  };

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
  //选择日期
  selectCalendar = async value => {
    let { factoryValue } = this.state;
    // url = "http://localhost:3100/fac/bbb";
    let updateconfig = await this.getData(myCalendarUrl.seletDate, {
      date: value.format("YYYY-MM-DD"),
      factory: factoryValue
    });
    //联动的请求
    for (let i = 0; i < updateconfig.body.length; i++) {
      let item = updateconfig.body[i];
      if (item.linkage) {
        let data = await this.getData(`${realroot}${item.linkageUrl}`, {
          id: item.val
        });
        updateconfig.body.map(ele => {
          if (ele.code === item.linkage) {
            ele.option = data.body.option;
          }
        });
      }
    }

    let modalConfig = {
      title: "修改",
      width: 800,
      data: (() => {
        return updateconfig.body.map(item => {
          return {
            id: item.code,
            disabled: item.readonly,
            label: item.title,
            type: item.type,
            format: item.format,
            option: item.option || [],
            rules: validation.init(item.css),
            onChange: async value => {
              if (item.linkage) {
                let { modalConfig } = this.state;

                let data = await this.getData(`${realroot}${item.linkageUrl}`, {
                  id: value
                });
                modalConfig.data.map(ele => {
                  if (ele.id === item.linkage) {
                    ele.option = data.body.option;
                    this.MyModal.MyForm.setFieldsValue(ele.id);
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
      modalShow: true,
      modalConfig,
      modalFooter: this.InitModalFooter(updateconfig.next || [])
    });
  };
  save = async url => {
    let {factoryValue} = this.state;
    let someparams = this.MyModal.handleOk();

    if (someparams) {
      let params = Object.assign({}, { ...someparams,factory:factoryValue });
      await this.getData(url, params);
      this.setState({
        modalShow: false
      },this.getServerData);
    }
  };
  cancel = () => {
    this.setState({
      modalShow: false
    });
  };
  //渲染日期框内容
  dateCellRender = date => {
    let { dateObj } = this.state;
    let nowdata = dateObj[date.format("YYYY-MM-DD")];
    if (nowdata) {
      return (
        <div className="date">
          <div className={`isWork ${nowdata.isWork ? "" : "no-work"}`}>
            {nowdata.isWork ? "排产" : "不可排产"}
          </div>
          <p className={`work-type ${nowdata.workType}`}>
            {" "}
            {nowdata.workType === "work" ? <span>班</span> : null}
            {nowdata.workType === "stop-work" ? <span>休</span> : null}
            {nowdata.workType === "to-leave" ? <span>假</span> : null}
          </p>
        </div>
      );
    } else {
      return "";
    }
  };
  //改变日期
  onPanelChange = date => {
    this.setState(
      {
        value: date
      },
      this.getServerData
    );
  };
  //改变工厂
  handleChange = value => {
    this.setState(
      {
        factoryValue: value
      },
      this.getServerData
    );
  };
  render() {
    let {
      modalConfig,
      modalShow,
      modalFooter,
      value,
      factoryArr,
      factoryValue,
      num
    } = this.state;
    return (
      <React.Fragment>
        <div className="my_calendar">
          <div className="select_factory_box">
            <FormItem label={"选择机构"}>
              <Select
                value={factoryValue}
                style={{ width: 250 }}
                onChange={this.handleChange}
              >
                {factoryArr.map(element => {
                  return (
                    <Option key={element.code} value={element.code}>
                      {element.name}
                    </Option>
                  );
                })}
              </Select>
            </FormItem>
            <FormItem label={"数量"} style={{ marginLeft: "1rem" }}>
              <Input disabled value={num} />
            </FormItem>
          </div>
          <Calendar
            value={value}
            dateCellRender={this.dateCellRender}
            onSelect={value => {
              this.selectCalendar(value);
            }}
            onPanelChange={this.onPanelChange}
          />
          <MyModal
            ref={node => (this.MyModal = node)}
            modalConfig={modalConfig}
            visible={modalShow}
            cancel={this.cancel}
            footer={modalFooter}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default MyCalendar;
