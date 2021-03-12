import React from "react";
import PageTitle from "../../components/PageTitle";
import MyModal from "../../components/MyModal";
import $http from "../../common/fetch";
import { labUrl } from "../../common/url";
import {
  InputNumber,
  Input,
  Select,
  Table,
  Modal,
  Button,
  Icon,
  Checkbox
} from "antd";
import "./index.css";

const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

class BedTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      controlBarConfig: [
        {
          title: "新增",
          id: "add",
          type: "add",
          icon: "form",
          onclick: () => {
            this.add();
          }
        },
        {
          title: "保存",
          id: "save",
          type: "save",
          icon: "form",
          onclick: () => {
            this.save();
          }
        }
      ],
      typeArr: []
    };
    this.column = [
      {
        title: "床次号",
        width: 100,
        dataIndex: "laynum",
        render: (text, record, index) => {
          return (
            <Input
              value={record.laynum}
              onClick={e => e.stopPropagation()}
              onChange={e => {
                this.dataChange(e.target.value, index, "laynum");
              }}
            />
          );
        }
      },
      {
        title: "类型",
        dataIndex: "mtrtyp",
        width: 100,
        render: (text, record, index) => {
          let { typeArr } = this.state;
          return (
            <div
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <Select
                style={{ width: "100%" }}
                value={record.mtrtyp}
                showSearch
                optionFilterProp={"children"}
                onChange={value => {
                  this.dataChange(value, index, "mtrtyp");
                }}
              >
                {typeArr.map(item => (
                  <Option value={item.code}>{item.name}</Option>
                ))}
              </Select>
            </div>
          );
        }
      },
      {
        title: "状态",
        width: 100,
        dataIndex: "status"
      },
      {
        title: "排产长度",
        width: 100,
        dataIndex: "patlng",
        render: (text, record, index) => {
          return (
            <Input
              value={record.patlng}
              onClick={e => e.stopPropagation()}
              onChange={e => {
                this.dataChange(e.target.value, index, "patlng");
              }}
            />
          );
        }
      },
      {
        title: "排料图",
        width: 100,
        dataIndex: "image"
      },
      {
        width: 200,
        title: "排料尺码",
        dataIndex: "patsize"
      },
      {
        title: "数量",
        width: 100,
        dataIndex: "pllqty",
        render: (text, record, index) => {
          return (
            <Input
              value={record.pllqty}
              onClick={e => e.stopPropagation()}
              onChange={e => {
                this.dataChange(e.target.value, index, "pllqty");
              }}
            />
          );
        }
      }
    ];
  }
  dataChange = (value, index, key) => {
    let { data } = this.state;
    data[index][key] = value;
    this.setState({
      data: [...data]
    });
  };
  getData = async (url, params, config) => {
    return $http.postData(url, params, config).then(resp => {
      return resp;
    });
  };
  async componentDidMount() {
    let { parentPageId = "" } = this.props;
    let typeArr = await $http.postFormData(labUrl.typeArr, { parentPageId });
    let data = await $http.postFormData(labUrl.getBedNo, { parentPageId });
    this.setState({ data: data.body, typeArr: typeArr.body });
  }
  getuuid = () => {
    return new Date().getTime() + "" + Math.random();
  };
  onRowClick = record => {
    let { getDetail } = this.props;
    if (!record.noadd) {
      Modal.error({ content: "请先保存再修改子项" });
    } else {
      getDetail(record.lyhdid);
    }
  };
  add = () => {
    let { data = [] } = this.state;
    data.push({
      uuid: this.getuuid(),
      laynum: "",
      mtrtyp: "",
      status: "",
      patlng: "",
      image: "",
      patsize: "",
      pllqty: "0",
      buts: []
    });
    this.setState({
      data
    });
  };
  save = async () => {
    let { data } = this.state;
    let { parentPageId = "" } = this.props;
    await this.getData(labUrl.saveBed, { parentPageId, list: data });
    Modal.success({ content: "保存成功",onOk:async() => {
      let data = await $http.postFormData(labUrl.getBedNo, { parentPageId });
      this.setState({ data: data.body });
    } });
  };
  render() {
    let { controlBarConfig, data = [] } = this.state;
    return (
      <React.Fragment>
        <PageTitle controlBarConfig={controlBarConfig} />
        <Table
          onRow={record => {
            return {
              onClick: event => {
                this.onRowClick(record);
              }, // 点击行
              onDoubleClick: event => {},
              onContextMenu: event => {},
              onMouseEnter: event => {}, // 鼠标移入行
              onMouseLeave: event => {}
            };
          }}
          rowKey={"uuid"}
          columns={this.column}
          bordered={true}
          dataSource={data}
          pagination={false}
        />
      </React.Fragment>
    );
  }
}

class DetailTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      column: this.initHeader(),
      showColumn: this.showColumnHeader(),
      data: [],
      modalFooter: [],
      partModalShow: false,
      sizeArr: [],
      selectSizeArr: [],
      plainOptions: [],
      selectSize: {},
      colorArr: [],
      controlBarConfig: [
        {
          title: "新增",
          id: "add",
          type: "add",
          icon: "form",
          onclick: () => {
            this.add();
          }
        },
        {
          title: "保存",
          id: "save",
          type: "save",
          icon: "form",
          onclick: () => {
            this.save();
          }
        },
        {
          title: "打印",
          id: "print",
          type: "print",
          icon: "form",
          onclick: () => {
            this.print();
          }
        },
        {
          title: "尺码",
          id: "size",
          type: "size",
          icon: "form",
          onclick: () => {
            this.size();
          }
        }
      ]
    };
  }
  async componentDidMount() {
    let { parentPageId = "" } = this.props;
    let colorArr = await $http.postFormData(labUrl.colorArr, { parentPageId });

    this.setState({ colorArr: colorArr.body });
  }
  dataChange = (value, index, key) => {
    let { data } = this.state;
    data[index][key] = value;
    this.setState({
      data: [...data]
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
            this[item.type]();
          }}
        >
          {item.title}
        </Button>
      );
    });
  };
  getData = async (url, params, config) => {
    return $http.postData(url, params, config).then(resp => {
      return resp;
    });
  };
  //获取数据
  getPackageData = async id => {
    let data = await $http.postFormData(labUrl.getDetail, { lyhdid: id });
    this.setState({
      id,
      data: data.body.data,
      selectSizeArr: data.body.size,
      column: this.initHeader(data.body.size)
    });
  };
  //构建表格的头部(尺码不固定)
  initHeader = (size = []) => {
    let column = [
      {
        title: "序号",
        width: 50,
        dataIndex: "no",
        render: (text, record, index) => {
          return index + 1;
        }
      },
      {
        title: "颜色",
        width: 100,
        dataIndex: "color",
        render: (text, record, index) => {
          let { colorArr } = this.state;
          return (
            <Select
              value={record.color}
              showSearch
              style={{ width: "100%" }}
              optionFilterProp={"children"}
              onChange={value => {
                this.dataChange(value, index, "color");
              }}
            >
              {colorArr.map(item => (
                <Option value={item.code}>{item.name}</Option>
              ))}
            </Select>
          );
        }
      },
      {
        title: "拉布张数",
        width: 100,
        dataIndex: "labNums",
        render: (text, record, index) => {
          return (
            <Input
              value={record.labNums}
              onChange={e => {
                this.dataChange(e.target.value, index, "labNums");
              }}
              onBlur={e => {
                let { data } = this.state;
                let value = e.target.value || 0;
                size.forEach(item => {
                  data[index][item.code] = parseInt(value) + "";
                });
                this.setState({ data });
              }}
            />
          );
        }
      }
    ];
    size.forEach(item => {
      column.push({
        title: item.stylno,
        children: [
          {
            title: item.sizeno,
            width: 50,
            align: "center",
            dataIndex: item.code,
            render: (text, record, index) => {
              return (
                <Input
                  value={record[item.code]}
                  onChange={e => {
                    this.dataChange(e.target.value, index, item.code);
                  }}
                  onBlur={e => {
                    let { data } = this.state;
                    let total = 0;
                    size.forEach(item => {
                      total += parseInt(data[index][item.code]) || 0;
                    });
                    data[index].labNums = (total / size.length).toFixed(2) + "";
                    this.setState({ data });
                  }}
                />
              );
            }
          }
        ]
      });
    });
    column.push({
      title: "操作",
      width: 50,
      dataIndex: "operation",
      align: "center",
      render: (text, record, index) => {
        return (
          <div>
            <span
              onClick={() => {
                this.delete(index);
              }}
            >
              删除
            </span>
          </div>
        );
      }
    });
    return column;
  };
  showColumnHeader = (size = []) => {
    let column = [
      {
        title: "序号",
        width: 100,
        dataIndex: "lylnno"
      },
      {
        title: "颜色",
        width: 100,
        dataIndex: "color"
      },
      {
        title: "拉布张数",
        width: 100,
        dataIndex: "labNums",
      }
    ];
    size.forEach(item => {
      column.push({
        title: item.sizeno,
        align: "center",
        dataIndex: item.code
      });
    });
    return column;
  };
  getuuid = () => {
    return new Date().getTime() + "" + Math.random();
  };
  //新增行
  add = () => {
    let { data = [], id } = this.state;
    if (!id) {
      Modal.error({ content: "请先选择头部" });
      return;
    }
    data.push({ uuid: this.getuuid(), buts: [] });
    this.setState({
      data
    });
  };
  //删除
  delete = async index => {
    let { data } = this.state;
    Modal.success({
      content: "删除成功",
      onOk: () => {
        data.splice(index, 1);
        this.setState({ data });
      }
    });
  };
  save = async () => {
    let { data, selectSizeArr, id } = this.state;
    if (!id) {
      Modal.error({ content: "请先选择头部" });
      return;
    }

    await $http.postData(labUrl.saveLydetils, {
      id,
      size: selectSizeArr,
      data: data.map((item, index) => {
        for (const key in item) {
          item[key] += "";
        }
        return { ...item, no: index + 1 + "" };
      })
    });
    Modal.success({ content: "保存成功" });
  };
  //请求尺码
  size = async () => {
    let { parentPageId = "" } = this.props;
    let size = await $http.postFormData(labUrl.selectSize, { parentPageId });

    let modalFooter = [
      {
        title: "取消",
        type: "cancel"
      },
      {
        title: "确定",
        type: "updateSize"
      }
    ];
    this.setState({
      modalShow: true,
      sizeArr: size.body,
      selectSizeArr: [],
      modalFooter: this.InitModalFooter(modalFooter)
    });
  };
  //记录选中尺码
  selectSize = (size, direction) => {
    this.setState({ selectSize: { ...size, direction } });
  };
  //新增展示的尺码
  addSize = () => {
    let { selectSize, selectSizeArr } = this.state;
    if (selectSize.direction === "left") {
      selectSizeArr.push({ ...selectSize });
      this.setState({
        selectSizeArr: selectSizeArr.map((item, index) => ({
          ...item,
          code: item.title + "&" + (index + 1)
        }))
      });
    }
  };
  //删除尺码
  removeSize = () => {
    let { selectSize, selectSizeArr } = this.state;
    if (selectSize.direction === "right") {
      this.setState({
        selectSizeArr: selectSizeArr
          .filter(item => item.code !== selectSize.code)
          .map((item, index) => ({
            ...item,
            code: item.title + "&" + (index + 1)
          }))
      });
    }
  };
  // 保存选择的尺码
  updateSize = async () => {
    let { selectSizeArr } = this.state;
    this.setState({
      modalShow: false,
      data: [],
      column: this.initHeader(selectSizeArr)
    });
  };
  print = async () => {
    let { id } = this.state;
    if (!id) {
      Modal.error({ content: "请先选择头部" });
      return;
    }

    let partsArr = await $http.postFormData(labUrl.partsArr, { lyhdid: id });
 
    this.setState({ plainOptions: partsArr.body.pdgnpr,showColumn:this.showColumnHeader(partsArr.body.size),showData:partsArr.body.data, partModalShow: true,checkAll:true,checkedList:  partsArr.body.pdgnpr.map(item=> item.value), });
  };
  printsave = async () => {
    let { id,checkedList } = this.state;
    if (!id) {
      Modal.error({ content: "请先选择头部" });
      return;
    }
    await $http.postData(labUrl.savePrint,{id,pdgnpr:checkedList});
    Modal.success({content:'成功',onOk:()=>{
      this.setState({
        partModalShow: false
      })
    }})
  }
  cancel = () => {
    this.setState({
      modalShow: false,
      partModalShow: false
    });
  };
  //多选框
  onChange = checkedList => {
    let { plainOptions } = this.state;
    this.setState({
      checkedList,
      indeterminate:
        !!checkedList.length && checkedList.length < plainOptions.length,
      checkAll: checkedList.length === plainOptions.length
    });
  };

  onCheckAllChange = e => {
    let { plainOptions } = this.state;
    this.setState({
      checkedList: e.target.checked ? plainOptions.map(item=> item.value) : [],
      indeterminate: false,
      checkAll: e.target.checked
    });
  };
  render() {
    let {
      column,
      controlBarConfig,
      data = [],
      modalShow,
      modalFooter,
      sizeArr,
      selectSizeArr,
      selectSize,
      partModalShow,
      plainOptions,
      showData,
      showColumn
    } = this.state;
    return (
      <React.Fragment>
        <PageTitle controlBarConfig={controlBarConfig} />
        <Table
          id="detailtable"
          rowKey={"uuid"}
          columns={column}
          bordered={true}
          dataSource={data}
          pagination={false}
        />
        <Modal
          title={"尺码"}
          visible={modalShow}
          footer={modalFooter}
          cancel={this.cancel}
        >
          <div className="size_modal">
            <div className="size_left">
              {sizeArr.map(item => (
                <div
                  className={`${
                    selectSize.code === item.code ? "active" : null
                  }`}
                  onClick={() => {
                    this.selectSize(item, "left");
                  }}
                  key={item.code}
                >
                  {item.title}
                </div>
              ))}
            </div>
            <div className="size_active">
              <Button onClick={this.addSize}>
                <Icon type="swap-right" />
              </Button>
              <Button onClick={this.removeSize}>
                <Icon type="swap-left" />
              </Button>
            </div>
            <div className="size_right">
              {selectSizeArr.map(item => (
                <div
                  className={`${
                    selectSize.code === item.code ? "active" : null
                  }`}
                  onClick={() => {
                    this.selectSize(item, "right");
                  }}
                  key={item.code}
                >
                  {item.title}
                </div>
              ))}
            </div>
          </div>
        </Modal>
        <Modal
          title={"部件"}
          width={1000}
          visible={partModalShow}
          footer={this.InitModalFooter([
            {
              title: "取消",
              type: "cancel"
            },
            {
              title: "确定",
              type: "printsave"
            }
          ])}
          cancel={this.cancel}
        >
          <div>
            <div style={{ borderBottom: "1px solid #E9E9E9" }}>
              <Checkbox
                indeterminate={this.state.indeterminate}
                onChange={this.onCheckAllChange}
                checked={this.state.checkAll}
              >
                全选
              </Checkbox>
            </div>
            <br />
            <CheckboxGroup
              options={plainOptions}
              value={this.state.checkedList}
              onChange={this.onChange}
            />
          </div>
          <div>
            <Table
              onRow={record => {
                return {
                  onClick: event => {
                    this.onRowClick(record);
                  }, // 点击行
                  onDoubleClick: event => {},
                  onContextMenu: event => {},
                  onMouseEnter: event => {}, // 鼠标移入行
                  onMouseLeave: event => {}
                };
              }}
              rowKey={"uuid"}
              columns={showColumn}
              bordered={true}
              dataSource={showData}
              pagination={false}
            />
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

class Lab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  selectBed = record => {
    this.setState({ selectBedNo: record.index });
  };
  //调用DetailTable中更新数据的方法
  getDetail = id => {
    this.detailTable.getPackageData(id);
  };
  render() {
    return (
      <React.Fragment>
        <div className="lab">
          <div className="bedtable_box">
            <BedTable {...this.props} getDetail={this.getDetail} />
          </div>
          <div className="detailtable_box">
            <DetailTable {...this.props} ref={node => (this.detailTable = node)} />
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export default Lab;
