/**
 * 功能文档
 * 1.查询
 * 2.配置功能性按钮(新增,修改,删除,批量删除,导入,导出,下钻,树形,同步请求,异步请求,外嵌iframe弹框,展示列配置,搜索框配置)
 * 3.普通表格(1.里面图片展示,点击变大 2.文件点击下载)
 * 4.合并行列的复杂表格
 */

/**
 * 组件流程
 * 加载完dom后, 会请求path路径的接口(查询,功能,表头),然后将path路径中的init替换成list接口,请求数据
 * 最大的坑是点击下钻的时候  会将parentsId带到下个页面
 * 1.查询
 * code唯一主键
 * title展示文字
 * type类型
 * format只为日期做格式化
 * data 下拉框的备选数据
 *
 * 2.功能(我会将按钮的地址传到方法中调用)
 * code唯一主键
 * title展示文字
 * type类型
 * format只为日期做格式化
 * option 多选,单选,下拉,树形的备选数据
 * disabled 禁用
 * rules 验证
 * initialValue 初始化值
 */

import React from "react";
import { Table, Modal, Button, Dropdown, Icon, Menu, Upload,message } from "antd";
import moment from "moment";
import PageTitle from "../PageTitle";
import MyModal from "../MyModal";
import $http from "../../common/fetch";
import { realroot } from "../../common/url";
import router, { findRouterReturn } from "../../common/router";
import { GETREQUIREHEADER, getUserMenu } from "../../common/auth";
import validation from "../../common/validation";

import "./index.css";

let qs = require("qs");

let MyTable = record => {
  let columns = [
    {
      title: "姓名",
      dataIndex: "name",
      width: 159
    },
    {
      title: "年龄",
      dataIndex: "age"
    }
  ];

  return (
    <React.Fragment>
      <Table
        expandedRowRender={record.items && MyTable}
        rowKey={"id"}
        columns={columns}
        dataSource={record.items}
      />
    </React.Fragment>
  );
};

// 导出基础table页面
class TablePage extends React.Component {
  constructor(props) {
    super(props);
    // 状态
    this.state = {
      searchConfig: [], //查询条件
      msg:'',//提示信息
      tableColumns: [], //表头
      controlBarConfig: [], //功能按钮
      dataSource: [], // 列表数据的源数据
      modalFooter: [], //弹框下的功能按钮
      modalShow: false, //新增弹框的展示
      modalConfig: {}, //弹框配置
      selectedRowKeys: [], //勾选项
      isshowTable: false, //刚进来时不渲染,从初始化信息中得到表格的类型(复选框,可展开的table,以及主键)再渲染
      saveType: "", //当前是哪个的保存(保存走的都是同一个接口)

      searchParams: {}, // PySearch组件的查找参数
      tableState: {
        size: 50,
        page: 1
      }, // Table组件的filter、sort、pagination数据
      pagination: {
        total: 0,
        showTotal: (total, range) => {
          return `显示${range[0]}-${range[1]}条 共${total}条`;
        },
        showSizeChanger: true,
        showQuickJumper: true,
        defaultPageSize: 50,
        pageSizeOptions: ["10", "50", "100", "200"]
      }, // 列表分页配置
      // showTableLoading: false //是否显示列表加载动画
      noPagination: false, //报表页面没有分页
      userClickRow: "" //用户点击的行
    };
    this.tempTableProps = {}; //table相关配置信息(是否多选,复杂表格)
    this.tableWidth = 0; //整个table的宽度,为了横向滚动设置
  }

  getData = async (url, params, config) => {
    return $http.postData(url, params, config).then(resp => {
      return resp;
    });
  };

  //初始化table的配置信息和头部展示列
  initTableProps = (header, isResetWidth = true) => {
    let tableColumns = [];
    //不是复杂表格的递归,都重置宽度
    if (isResetWidth) {
      this.tableWidth = 0;
    }
    header.forEach(item => {
      //如果有复杂表头就递归出数据
      if (item.children && item.children.length) {
        item.children = this.initTableProps(item.children, false);
      }

      if (item.title === "Select") {
        this.tableWidth += 62;
        this.tempTableProps.isSelect = true;
      } else if (item.pk === 1) {
        this.tempTableProps.rowKey = record => {
          return record[item.code].title;
        };
      } else {
        let style = {};
        //复杂表格只有在最底层的子项才会加宽度
        if (item.width && (!item.children || !item.children.length)) {
          style.width = `${parseInt(item.width) - 12}px`; //padding 32 border-right 1
          this.tableWidth += parseInt(item.width);
        }
        let column = {
          ...item,
          dataIndex: item.code,
          title: item.title,
          width: item.width && parseInt(item.width),
          sorter: item.sort,
          align: "center"
        };
        //如果没有children就添加渲染列方法
        if (!item.children || !item.children.length) {
          column.render = (text, record, index) => {
            let contentDom; //渲染内容
            // 文件和图片特殊处理
            if (item.type === "img") {
              contentDom = record[item.code].url ? (
                <a
                  style={{
                    display: "inline-block",
                    width: "100px",
                    height: "100px"
                  }}
                  onClick={() => {
                    this.show_image(`${realroot}${record[item.code].url}`);
                  }}
                >
                  <img
                    style={{ maxWidth: "100px", maxHeight: "100px" }}
                    src={`${realroot}${record[item.code].url}`}
                  />
                </a>
              ) : null;
            } else {
              contentDom = record[item.code] ? (
                <div style={style} className="td_overflow">
                  {item.type === "file" ? (
                    <a href={`${realroot}${record[item.code].url}`}>
                      {record[item.code].title}
                    </a>
                  ) : (
                    record[item.code].title
                  )}
                </div>
              ) : null;
            }
            return {
              children: contentDom,
              props: {
                rowSpan: record[item.code].rowSpan,
                colSpan: record[item.code].colSpan
              }
            };
          };
        }
        tableColumns.push(column);
      }
    });
    return tableColumns;
  };
  //初始化按钮,table列,查询条件
  initConfig = async () => {
    let { parentPageId = "" } = this.props;
    let url = `${realroot}${this.props.path}?${qs.stringify({
      upparams: parentPageId
    })}`;
    let initConfig = await this.getData(url);
    let {
      headerArea,
      searchArea,
      buttonArea,
      hasPagination = false,
      isoperation = false,
      msg
    } = initConfig.body;
   
    let searchConfig = searchArea.map(item => {
      return {
        id: item.code,
        title: `${item.title} ( ${item.symbol} )`,
        type: item.type,
        format: item.format,
        data: item.option,
        css: item.css
      };
    });

    let tableColumns = this.initTableProps(headerArea);

    let controlBarConfig = buttonArea.map(item => {
      let button = {
        id: item.code || "",
        title: item.title || "",
        type: item.type,
        icon: item.icon || "form",
        onclick: () => {
          this[item.type](`${realroot}${item.url}`);
        }
      };
      if (item.target === "_BLANK") {
        button.onclick = () => {
          window.open(
            `${item.url}${item.url.includes("?") ? "&&" : "?"}${qs.stringify(
              GETREQUIREHEADER()
            )}`
          );
        };
        return button;
      }
      if (["CUSTOMIZE_MODAL", "SHOW_DRILL"].includes(item.type)) {
        button.onclick = () => {
          this[item.type](`${realroot}${item.url}`, item);
        };
      }
      if (["EXPORT_DATA", "DOWNLOAD_TEMPLATE"].includes(item.type)) {
        button.onclick = () => {
          this.export(`${realroot}${item.url}`);
        };
      }
      if (item.type === "IMPORT_DATA") {
        button.onclick = ({ file }) => {
          this.import(`${realroot}${item.url}`, file);
        };
      }
      return button;
    });
    if (!isoperation) {
      tableColumns.push({
        title: "操作",
        dataIndex: "operation",
        width: 250,
        fixed: "right",
        align: "center",
        render: (text, record) => {
          let ButtonActive = item => {
            return (
              <React.Fragment>
                {item.fun === "IMPORT_DATA" ? (
                  <Upload
                    customRequest={({ file }) => {
                      this.import(`${realroot}${item.url}`, file);
                    }}
                    withCredentials={true}
                  >
                    <Button>{item.title}</Button>
                  </Upload>
                ) : (
                  <span
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
                  </span>
                )}
              </React.Fragment>
            );
          };
          //加载更多功能的按钮
          let renderMoreButs = butArray => {
            return (
              <Menu>
                {butArray.map(item => {
                  return (
                    <Menu.Item key={item.url}>{ButtonActive(item)}</Menu.Item>
                  );
                })}
              </Menu>
            );
          };
          return (
            <div className="table-inner-control td_overflow">
              {record.buts
                ? record.buts.slice(0, 2).map(item => {
                    return ButtonActive(item);
                  })
                : null}
              {record.buts && record.buts.length > 2 ? (
                <Dropdown overlay={renderMoreButs(record.buts.slice(2))}>
                  <span className="ant-dropdown-link">
                    更多功能 <Icon type="down" />
                  </span>
                </Dropdown>
              ) : null}
            </div>
          );
        }
      });
    }

    this.setState({
      searchConfig,
      tableColumns,
      controlBarConfig,
      msg,
      noPagination: hasPagination
    });
  };
  //行名称
  rowClassName = (record, index) => {
    let { userClickRow, selectedRowKeys } = this.state;
    let rowKey = this.tempTableProps.rowKey(record);
    //订单状态改变颜色
    if (
      record["3e8ac828-42a5-4956-84f8-96d7b4d96516"] &&
      record["3e8ac828-42a5-4956-84f8-96d7b4d96516"].title == "未完成"
    ) {
      return "red";
    }
    //用户点击的颜色
    if (userClickRow === rowKey) {
      return "user_click";
    }
    //用户勾选的颜色
    if (selectedRowKeys.includes(rowKey)) {
      return "user_select";
    }
    //各种状态的类名
    return record.className;
  };
  onRowClick = record => {
    let { userClickRow } = this.state;
    this.setState({
      userClickRow:
        this.tempTableProps.rowKey(record) == userClickRow
          ? ""
          : this.tempTableProps.rowKey(record)
    });
  };

  async componentDidMount() {
    await this.initConfig();
    await this.getServerData();
  }
  //勾选框改变的时候
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
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
  //点击图片放大
  show_image = url => {
    Modal.confirm({
      title: "图片",
      width: "25rem",
      className: "show_image",
      maskClosable: true,
      content: (
        <div style={{ textAlign: "center" }}>
          <img style={{ maxWidth: "20rem" }} src={url} />
        </div>
      )
    });
  };
  //新增
  SHOW_ADD = async url => {
    let addconfig = await this.getData(url);
    let modalConfig = {
      title: "新增",
      width: 1000,
      data: (() => {
        return addconfig.body.map(item => ({
          id: item.code,
          label: item.title,
          disabled: item.readonly,
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
        }));
      })()
    };
    this.setState({
      modalShow: true,
      modalConfig,
      modalFooter: this.InitModalFooter(addconfig.next || [])
    });
  };
  //修改
  SHOW_EDIT = async url => {
    let updateconfig = await this.getData(url);

    //联动的请求
    for (let i = 0; i < updateconfig.body.length; i++) {
      let item = updateconfig.body[i];
      if (item.linkage) {
        let linkage = item.linkage.split(",");
        let data = {};
        for (let i = 0; i < linkage.length; i++) {
          data[linkage[i]] = await this.getData(
            `${realroot}${item.linkageUrl}`,
            { id: item.val, key: linkage[i] }
          );
        }
        updateconfig.body.map(ele => {
          if (!!data[ele.code]) {
            ele.option = data[ele.code].body.option;
          }
        });
      }
    }

    let modalConfig = {
      title: "修改",
      width: 1000,
      data: (() => {
        return updateconfig.body.map(item => {
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
  // 删除单个和批量用single标记
  DELETE_DATA = (url, single) => {
    let { selectedRowKeys = [] } = this.state;
    if (!selectedRowKeys.length && !single) {
      Modal.error({
        content: "请勾选数据"
      });
    } else {
      Modal.confirm({
        title: "是否删除?",
        onOk: async () => {
          await this.getData(url, selectedRowKeys);
          this.setState({
            selectedRowKeys: []
          });
          await this.getServerData();
          Modal.success({
            content: "删除成功"
          });
        }
      });
    }
  };
  //查询配置
  SHOW_SEARCH = async url => {
    let searchConfigtemp = await this.getData(url);
    let modalConfig = {
      title: "配置查询项",
      width: 800,
      data: (() =>
        searchConfigtemp.body.map(item => ({
          id: item.code,
          label: `${item.title} ( ${item.symbol} )`,
          type: "searchConfig",
          formItemLayout: {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 0 }
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 20 }
            }
          },
          value: {
            select: item.select,
            priority: item.priority
          }
        })))()
    };
    this.setState({
      modalShow: true,
      modalConfig,
      modalFooter: this.InitModalFooter(searchConfigtemp.next || [])
    });
  };
  // 列配置
  SHOW_COLUMN = async url => {
    let columnsconfig = await this.getData(url);
    let modalConfig = {
      title: "配置展示头",
      width: 800,
      data: (() =>
        columnsconfig.body.map(item => ({
          id: item.code,
          label: item.title,
          type: "columnConfig",
          formItemLayout: {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 0 }
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 20 }
            }
          },
          value: {
            select: item.select,
            priority: item.priority
          }
        })))()
    };
    this.setState({
      modalShow: true,
      modalConfig,
      modalFooter: this.InitModalFooter(columnsconfig.next || [])
    });
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
  //多选框
  SHOW_MANY_CHECKBOX = async url => {
    let checkBoxconfig = await this.getData(url);
    let modalConfig = {
      title: "配置查询项",
      width: 800,
      data: [
        {
          id: checkBoxconfig.body.code,
          label: "",
          type: "checkBox",
          hide: false,
          col: 24,
          span: 5,
          initialValue: checkBoxconfig.body.selected || [],
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
          option: checkBoxconfig.body.avliable
        }
      ]
    };
    this.setState({
      modalShow: true,
      modalConfig,
      modalFooter: this.InitModalFooter(checkBoxconfig.next || [])
    });
  };
  //递归移除树形结构后端带过来的父勾选
  initTreeSelect = (tree = [], selected = []) => {
    let newSelected = [];
    let recursive = (tree, selected) => {
      tree.forEach(item => {
        if (item.child && item.child.length) {
          recursive(item.child, selected);
        } else {
          if (selected.includes(item.orgcode)) {
            newSelected.push(item.orgcode);
          }
        }
      });
    };
    recursive(tree, selected);
    return newSelected;
  };
  //树状
  SHOW_MANY_TREE = async url => {
    let treeconfig = await this.getData(url);

    let modalConfig = {
      title: "树",
      width: 800,
      data: [
        {
          id: treeconfig.body.code,
          label: "",
          type: "tree",
          hide: false,
          col: 24,
          span: 5,
          initialValue:
            this.initTreeSelect(
              treeconfig.body.avliable,
              treeconfig.body.selected
            ) || [],
          formItemLayout: {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 0 }
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 24 }
            }
          },
          option: treeconfig.body.avliable
        }
      ]
    };
    this.setState({
      modalShow: true,
      modalConfig,
      modalFooter: this.InitModalFooter(treeconfig.next || [])
    });
  };
  //新增tabs
  SHOW_DRILL = (url, item) => {
    let { selectedRowKeys } = this.state;
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
      addTab({ ...addRouter, parentPageId, selectedRowKeys });
    } else {
      Modal.error({ content: "菜单中找不到当前路径" });
    }
  };
  //同步
  SYN = async url => {
    let { selectedRowKeys } = this.state;
    if (!selectedRowKeys.length) {
      Modal.error({
        content: "请勾选数据"
      });
    } else {
      let syn = await this.getData(url);
      let modalConfig = {
        title: "同步",
        width: 800,
        data: [
          {
            id: "apps",
            label: "第三方系统",
            type: "checkBox",
            hide: false,
            col: 24,
            span: 5,
            initialValue: [],
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
            option: syn.body.map(item => ({ code: item, name: item }))
          },
          {
            id: "notes",
            label: "业务通知",
            type: "textarea",
            hide: false,
            col: 24,
            initialValue: "",
            formItemLayout: {
              labelCol: {
                xs: { span: 24 },
                sm: { span: 4 }
              },
              wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 }
              }
            }
          }
        ]
      };
      this.setState({
        saveType: "SYN",
        modalShow: true,
        modalConfig,
        modalFooter: this.InitModalFooter(syn.next || [])
      });
    }
  };
  //异步
  ASYNC = async url => {
    let data = await this.getData(url);
    Modal.success({
      content: data.msg,
      onOk: () => {
        this.getServerData();
      }
    });
  };
  //自定义页面弹框
  CUSTOMIZE_MODAL = async (url, item) => {
    let iframeUrl = `${item.url}${
      item.url.includes("?") ? "&&" : "?"
    }${qs.stringify(GETREQUIREHEADER())}`;
    Modal.confirm({
      width: 1000,
      icon: null,
      content: (
        <iframe
          style={{
            border: "none",
            width: "100%",
            height: "calc(100vh - 13rem)"
          }}
          src={iframeUrl}
        />
      ),
      okButtonProps: []
    });
  };
  //保存所有(新增,修改,权限,列配置,查询)
  save = async url => {
    let { selectedRowKeys, saveType } = this.state;
    let someparams = this.MyModal.handleOk();

    if (someparams) {
      let params = Object.assign({}, { ...someparams });
      if (saveType) {
        params.codes = selectedRowKeys;
      }
      await this.getData(url, params);
      await this.initConfig();
      await this.getServerData();
      this.setState({
        saveType: "",
        modalShow: false
      });
    }
  };
  cancel = () => {
    this.setState({
      modalShow: false
    });
  };

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
    let { searchParams } = this.state;

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
  //导入
  import = (url, file) => {
    let form = new FormData();
    form.append("importFile", file);
    this.getData(
      url,
      {},
      {
        headers: {
          ...GETREQUIREHEADER()
        },
        body: form
      }
    ).then(response => {
      this.getServerData();
      Modal.success({ content: response.msg });
    });
  };
  // 从服务器获取数据
  getServerData = async () => {
    // this.setState({ showTableLoading: true });
    let params = {
      ...this.state.searchParams
      // ...this.state.tableState
    };

    let { parentPageId = "" } = this.props;
    params = Object.assign({}, params);
    let url = `${realroot}${this.props.path.replace("/init/", "/list/")}`;
    await $http
      .postData(
        `${url}?${qs.stringify({
          ...this.state.tableState,
          upparams: parentPageId
        })}`,
        params
      )
      .then(
        resp => {
          let pagination = Object.assign({}, this.state.pagination);
          pagination.total = resp.body.total || 1;
          this.setState(() => ({
            dataSource: [...resp.body.list],
            pagination,
            // showTableLoading: false,
            selectedRowKeys: [],
            isshowTable: true
          }));
        },
        () => {
          // this.setState({ showTableLoading: false });
        }
      );
  };

  // 表格排序、翻页等功能时的回调
  onTableStateChange = (pagination, filters, sorter) => {
    let { pageSize, current } = pagination;
    let tableState = {
      size: pageSize,
      page: current,
      ...filters
    };
    //如果有排序就加上参数
    if (sorter.order) {
      tableState.sort = `${sorter.field},${sorter.order.replace("end", "")}`;
    }
    this.setState(
      {
        tableState,
        pagination: { ...this.state.pagination, current }
      },
      this.getServerData
    );
  };

  // 查询数据变化的回调
  updateSearchParams = searchParams => {
    this.setState({ searchParams });
  };

  // 查询按钮执行事件
  searchTableAction = () => {
    let tableState = {
      ...this.state.tableState,
      page: 1
    };

    let pagination = {
      ...this.state.pagination,
      current: 1
    };

    this.setState(
      {
        tableState,
        pagination
      },
      () => {
        this.getServerData();
      }
    );
  };

  render() {
    let {
      dataSource = [],
      searchConfig = [],
      msg,
      tableColumns = [],
      controlBarConfig = [],
      modalConfig,
      // showTableLoading,
      pagination,
      modalShow,
      isshowTable,
      selectedRowKeys,
      modalFooter,
      noPagination
    } = this.state;

    const rowSelection = {
      selectedRowKeys,
      fixed: true,
      onChange: this.onSelectChange
    };
    let tableProps = {
      // expandedRowRender: MyTable,
      // loading: showTableLoading,
      rowClassName: this.rowClassName,
      pagination: noPagination ? false : pagination,
      scroll: { y: "calc(100vh - 9.5rem)", x: this.tableWidth + 250 },
      rowKey: this.tempTableProps.rowKey,
      columns: tableColumns,
      bordered: true,
      dataSource: dataSource,
      onChange: this.onTableStateChange,
      onRow: record => {
        return {
          onClick: event => {
            this.onRowClick(record);
          }, // 点击行
          onDoubleClick: event => {},
          onContextMenu: event => {},
          onMouseEnter: event => {}, // 鼠标移入行
          onMouseLeave: event => {}
        };
      }
    };
    //根据初始化接口给的数据判断是否需要多选框
    if (this.tempTableProps.isSelect) {
      tableProps.rowSelection = rowSelection;
    }
    return (
      <div className="wrapper-main-body">
        <PageTitle
          configData={{ form: searchConfig }}
          updateSearchParams={this.updateSearchParams}
          searchTableAction={this.searchTableAction}
          controlBarConfig={controlBarConfig}
        />
        {msg?<div style={{textAlign:'center',color:'#58b3b3'}}>{msg}</div>:null}
        <div className="wrapper-table-container">
          {isshowTable && <Table {...tableProps} />}
          {
            <MyModal
              ref={node => (this.MyModal = node)}
              modalConfig={modalConfig}
              visible={modalShow}
              cancel={this.cancel}
              footer={modalFooter}
            />
          }
        </div>
      </div>
    );
  }
}

export default TablePage;
