import React from "react";
import { Table, Input, Select, DatePicker, Button, Modal } from "antd";
import MyForm from "../../components/MyForm";
import PageTitle from "../../components/PageTitle";
import { realroot, proofingApplicationUrl } from "../../common/url";
import $http from "../../common/fetch";
import { GETREQUIREHEADER } from "../../common/auth";
import moment from "moment";
let qs = require("qs");
const Option = Select.Option;

class EditTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: []
    };
  }
  componentDidMount() {
    let { header } = this.props;
    let renderHeader = header.map(item => {
      if (item.render) {
        return item;
      } else {
        return {
          ...item,
          render: (text, record, index) => {
            return this.renderEditCell(item, record, index);
          }
        };
      }
    });
    this.setState({
      columns: renderHeader
    });
  }
  renderEditCell = (item, record, index) => {
    let dom;
    switch (item.type) {
      case "text":
        dom = (
          <Input
            value={record[item.dataIndex]}
            disabled={record.disabled}
            onBlur={e => {
              item.blur(e.target.value, index);
            }}
            onChange={e => {
              item.change(e.target.value, index, item.dataIndex);
            }}
          />
        );
        break;
      case "select":
        dom = (
          <Select
            disabled={record.disabled}
            value={record[item.dataIndex]}
            style={{ width: "100px" }}
            showSearch
            optionFilterProp={"children"}
            onChange={value => {
              item.change(value, index, item.dataIndex);
            }}
          >
            {item.option.map(element => (
              <Option key={element.code} value={element.code}>
                {element.name}
              </Option>
            ))}
          </Select>
        );
        break;
      case "date":
        dom = (
          <DatePicker
            value={moment(record[item.dataIndex])}
            allowClear={false}
            onChange={value => {
              item.change(value, index, item.dataIndex);
            }}
          />
        );
        break;
      default:
        dom = <span>{record[item.dataIndex]}</span>;
    }
    return dom;
  };
  render() {
    let { data, tableRowKey } = this.props;
    let { columns } = this.state;
    return (
      <React.Fragment>
        <Table
          rowKey={tableRowKey}
          columns={columns}
          dataSource={data}
          pagination={false}
        />
      </React.Fragment>
    );
  }
}

class ProofingApplication extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalConfig: { data: [] },
      controlBarConfig: [],
      header: [],
      data: []
    };
  }
  getuuid = () => {
    return new Date().getTime() + "" + Math.random();
  };
  calcNumber = index => {
    let { data } = this.state;
    let number = 0;
    for (let i = 0; i <= index; i++) {
      number += parseInt(data[i].number) || 0;
    }
    return number;
  };
  async componentDidMount() {
    let { parentPageId = "" } = this.props;
    let url = `${realroot}${this.props.path}?${qs.stringify({
      upparams: parentPageId
    })}`;
    let data = await $http.postData(url);
    let modalConfig = {
      data: data.body.modalConfig.data.map(item => ({
        ...item,
        disabled: !item.edit,
        initialValue: item.value
      }))
    };

    let controlBarConfig = data.body.controlBarConfig.map(item => {
      if (item.target === "_BLANK") {
        return {
          ...item,
          onclick: () => {
            window.open(
              `${item.url}${item.url.includes("?") ? "&&" : "?"}${qs.stringify(
                GETREQUIREHEADER()
              )}`
            );
          }
        };
      }
      return {
        ...item,
        onclick: () => {
          this[item.type](`${realroot}${item.url}`);
        }
      };
    });

    let header = data.body.header;
    //给部分字段加上事件
    header.map(item => {
      if (item.dataIndex === "number") {
        item.blur = async (value, index) => {
          let { data } = this.state;
          let someparams = this.MyForm.getfieldsValue();
          let plndat = await $http.postData(proofingApplicationUrl.changeNum, {
            number: this.calcNumber(index),
            form: someparams
          });
          data = data.map((item, i) =>
            index === i ? { ...item, plndat: plndat.body } : item
          );
          this.setState({ data });
        };
      }
      item.change = (value, index, key) => {
        let { data } = this.state;
        data = data.map((item, i) => {
          if (index === i) {
            if (key === "date") {
              value = value.format("YYYY-MM-DD HH:mm:ss");
            }
            return { ...item, [key]: value };
          } else {
            return item;
          }
        });
        this.setState({ data });
      };
      return item;
    });

    header.push({
      title: "操作",
      dataIndex: "operation",
      align: "center",
      render: (text, record, index) => {
        return (
          <div>
            {record.buts.map(item => {
              return (
                <span
                  key={item.title}
                  onClick={() => {
                    this[item.fun](`${realroot}${item.url}`, item, index);
                  }}
                >
                  {item.title}
                </span>
              );
            })}
          </div>
        );
      }
    });

    let tableData = data.body.data.map(item => {
      item.uuid = this.getuuid();
      item.disabled = true;
      return item;
    });

    this.setState({
      modalConfig,
      controlBarConfig,
      header,
      data: tableData,
      modalFooter: this.InitModalFooter(data.next)
    });
  }
  // 构建弹框的按钮
  InitModalFooter = (data = []) => {
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

  add = url => {
    let { data } = this.state;
    data.push({ index: this.getuuid(), buts: [],reqdat:moment(new Date()).format('YYYY-MM-DD') });
    this.setState({
      data
    });
  };

  delete = async (url, item, index) => {
    let { data } = this.state;
    await $http.postData(url);
    Modal.success({
      content: "删除成功",
      onOk: () => {
        data.splice(index, 1);
        this.setState({ data });
      }
    });
  };
  //导出
  export = (
    url,
    fileName = "EXPORT_" + new Date().getTime() + ".xlsx",
    params = {}
  ) => {
    let postParams = this.MyForm.getfieldsValue();

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
  save = async url => {
    let { data } = this.state;
    let someparams = this.MyForm.getfieldsValue();
    await $http.postData(url, {
      form: someparams,
      data
    });
    Modal.success({ content: "保存成功" });
  };
  render() {
    let {
      modalConfig,
      controlBarConfig,
      header,
      data,
      modalFooter
    } = this.state;

    return (
      <React.Fragment>
        <MyForm
          wrappedComponentRef={form => (this.MyForm = form)}
          data={modalConfig.data}
        />
        <PageTitle controlBarConfig={controlBarConfig} />
        {header.length ? (
          <EditTable tableRowKey={"index"} header={header} data={data} />
        ) : null}
        {modalFooter}
      </React.Fragment>
    );
  }
}

export default ProofingApplication;
