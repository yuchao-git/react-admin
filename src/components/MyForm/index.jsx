/**
 * form表单
 * 1.获取表单的值
 * 2.支持配置元素布局 col
 * 3.支持配置单个元素布局 formItemLayout
 * 4.支持 多选框,单选框,下拉框,下拉多选框,下拉树形框,文件上传(不支持多文件),输入框,文本框,密码框,日历,树形,潘通色卡,自定义的多选框加下拉框,时间控件(年月,年月日,年月日时分秒,通过format控制)
 * 5.可以通过外部props传入产生字段的联动
*/
import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Cascader,
  DatePicker,
  Checkbox,
  Row,
  Col,
  Upload,
  Button,
  Icon,
  Radio,
  TreeSelect,
  Tree
} from "antd";
import { SketchPicker } from "react-color";
import { GETREQUIREHEADER } from "../../common/auth";
import $http from "../../common/fetch";
import { commonUrl, realroot } from "../../common/url";
import moment from "moment";
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const TreeNode = TreeSelect.TreeNode;
const { MonthPicker } = DatePicker;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 15 }
  }
};

//配置查询项和列比较特殊,有组合控件(勾选和排序)
class MySearchConfig extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ("value" in nextProps) {
      return {
        ...(nextProps.value || {})
      };
    }
    return null;
  }
  constructor(props) {
    super(props);
    const value = props.value || {};
    const length = props.length;
    this.state = value;
    this.orderArr = [];
    for (let i = 0; i < length; i++) {
      this.orderArr.push(i);
    }
  }

  selectFieldShow = e => {
    let select = e.target.checked;
    if (!("value" in this.props)) {
      this.setState({ select });
    }
    this.triggerChange({ select });
  };

  selectOrder = priority => {
    if (!("value" in this.props)) {
      this.setState({ priority });
    }
    this.triggerChange({ priority });
  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };
  render() {
    let { select, priority } = this.state;
    let { name } = this.props;
    return (
      <React.Fragment>
        <Row>
          <Col
            span={18}
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Checkbox checked={select} onChange={this.selectFieldShow}>
              {name} :{" "}
            </Checkbox>
          </Col>
          <Col span={6}>
            <Select
              showSearch
              value={priority}
              onChange={this.selectOrder}
              optionFilterProp={"children"}
            >
              {this.orderArr.map((element, index) => (
                <Option key={index} value={index + 1}>
                  {index + 1}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

class MyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  getfieldsValue = () => {
    let { data } = this.props;
    let resultData;
    let { validateFields, validateFieldsAndScroll } = this.props.form;
    let flag = true;
    validateFields((err, fieldsValue) => {
      if (err) {
        validateFieldsAndScroll();
        flag = false;
        return;
      } else {
        resultData = fieldsValue;
      }
    });
    data.forEach(item => {
      if (
        (item.type === "img" || item.type === "file") &&
        !!resultData[item.id] &&
        !!resultData[item.id].length
      ) {
        resultData[item.id] = resultData[item.id][0].response
          ? resultData[item.id][0].response.body.uid
          : resultData[item.id][0].uid;
      } else if (item.type === "date" && resultData[item.id]) {
        resultData[item.id] = resultData[item.id].format(item.format);
      }
    });
    return flag ? resultData : false;
  };
  getFieldValue = name => {
    let { getFieldValue } = this.props.form;
    return getFieldValue(name);
  };
  setFieldsValue = name => {
    let { setFieldsValue } = this.props.form;
    setFieldsValue({ [name]: "" });
  };
  normFile = e => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };
  //上传文件只能有一个,所有如果多上传了要删除
  fileOnChange = ({ file, fileList }) => {
    if (file.status === "done") {
      if (file.response.st === 0) {
        if (fileList.length > 1) {
          fileList.shift();
        }
      } else {
        Modal.error({ content: file.response.msg });
        fileList.pop();
      }
    } else if (file.status === "error") {
      Modal.error({ content: "上传失败" });
      fileList.pop();
    }
  };
  //自定义点击上传后的文件事件(下载)
  onUploadPreview = file => {
    let url, name;
    if (file.response) {
      url = file.response.body.url;
      name = file.response.body.name;
    } else {
      url = file.url;
      name = file.name;
    }
    //图片是传了realroot,文件是不带url的
    $http
      .fileData(`${url.includes(realroot) ? "" : realroot}${url}`)
      .then(fileBlob => {
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(fileBlob, name);
        } else {
          var blobUrl = URL.createObjectURL(fileBlob);
          var save_link = document.createElementNS(
            "http://www.w3.org/1999/xhtml",
            "a"
          );
          save_link.href = blobUrl;
          save_link.download = name;
          save_link.style.display = "none";
          document.body.appendChild(save_link);
          save_link.click();
          document.body.removeChild(save_link);
        }
      });
  };
  renderSelect = element => {
    if (!element.hide) {
      //如果没有值就默认选中第一个
      // if(!element.initialValue && element.option.length){
      //   element.initialValue = element.option[0].code
      // }
      let { getFieldDecorator } = this.props.form;
      return (
        <React.Fragment key={element.id}>
          <FormItem
            {...formItemLayout}
            {...element.formItemLayout}
            label={element.label}
            style={{ marginBottom: "0.5rem" }}
          >
            {getFieldDecorator(element.id, {
              initialValue: element.initialValue,
              validateFirst: true,
              rules: element.rules
            })(
              <Select
                showSearch
                mode={element.type}
                disabled={!!element.disabled}
                onChange={!!element.onChange ? element.onChange : null}
                optionFilterProp={"children"}
              >
                {element.option.map(element => {
                  return (
                    <Option key={element.code} value={element.code}>
                      {element.name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          {element.hr ? <hr /> : null}
        </React.Fragment>
      );
    }
  };
  renderInput = element => {
    let rules = element.rules ? element.rules : [];
    if (!element.hide) {
      let getFieldDecorator = this.props.form.getFieldDecorator;
      return (
        <React.Fragment key={element.id}>
          <FormItem
            label={element.label}
            {...formItemLayout}
            {...element.formItemLayout}
            key={element.id}
            style={{ marginBottom: "0.5rem" }}
          >
            {getFieldDecorator(element.id, {
              initialValue: element.initialValue,
              validateFirst: true,
              rules: rules
            })(
              element.type === "text" ? (
                <Input disabled={element.disabled} />
              ) : (
                <TextArea disabled={element.disabled} rows={element.rows} />
              )
            )}
          </FormItem>
          {element.hr ? <hr /> : null}
        </React.Fragment>
      );
    }
  };
  renderPassWord = element => {
    let rules = element.rules ? element.rules : [];
    if (!element.hide) {
      let getFieldDecorator = this.props.form.getFieldDecorator;
      return (
        <React.Fragment key={element.id}>
          <FormItem
            label={element.label}
            {...formItemLayout}
            {...element.formItemLayout}
            key={element.id}
            style={{ marginBottom: "0.5rem" }}
          >
            {getFieldDecorator(element.id, {
              initialValue: element.initialValue,
              validateFirst: true,
              rules: rules
            })(
              <Input.Password
                visibilityToggle={false}
                placeholder="input password"
              />
            )}
          </FormItem>
        </React.Fragment>
      );
    }
  };
  renderCascader = element => {
    // if (!element.hide) {
    let getFieldDecorator = this.props.form.getFieldDecorator;
    return (
      <FormItem
        label={element.label}
        {...formItemLayout}
        {...element.formItemLayout}
        key={element.id}
        style={{ marginBottom: "0.5rem" }}
      >
        {getFieldDecorator(element.id, {
          initialValue: element.initialValue,
          validateFirst: true,
          rules: element.rules
        })(<Cascader options={element.option} />)}
      </FormItem>
    );
    // }
  };
  renderDate = element => {
    if (!element.hide) {
      let getFieldDecorator = this.props.form.getFieldDecorator;
      if (!!element.format) {
        element.format = element.format
          .replace("yyyy", "YYYY")
          .replace("dd", "DD");
        
      }
      if(!!element.initialValue){
        element.initialValue = moment(element.initialValue, element.format);
      }

      return (
        <FormItem
          label={element.label}
          {...formItemLayout}
          {...element.formItemLayout}
          key={element.id}
          style={{ marginBottom: "0.5rem" }}
        >
          {getFieldDecorator(element.id, {
            initialValue: element.initialValue,
            validateFirst: true,
            rules: element.rules
          })(
            element.format == 'YYYY-MM'?
            <MonthPicker format={element.format}/>
            :
            <DatePicker
              showTime={element.format.includes("HH:mm:ss")}
              format={element.format}
            />
          )}
        </FormItem>
      );
    }
  };
  renderCheckBox = element => {
    // if (!element.hide) {
    let getFieldDecorator = this.props.form.getFieldDecorator;
    return (
      <FormItem
        label={element.label}
        {...formItemLayout}
        {...element.formItemLayout}
        key={element.id}
        style={{ marginBottom: "0.5rem" }}
      >
        {getFieldDecorator(element.id, {
          initialValue: element.initialValue,
          validateFirst: true,
          rules: element.rules
        })(
          <Checkbox.Group disabled={element.disabled} style={{ width: "100%" }}>
            <Row>
              {element.option.map(item =>
                item.code ? (
                  <Col
                    key={item.code}
                    span={item.span ? item.span : element.span}
                  >
                    <Checkbox value={item.code}>{item.name}</Checkbox>
                  </Col>
                ) : null
              )}
            </Row>
          </Checkbox.Group>
        )}
      </FormItem>
    );
    // }
  };
  renderRadio = element => {
    // if (!element.hide) {
    let getFieldDecorator = this.props.form.getFieldDecorator;
    return (
      <FormItem
        label={element.label}
        {...formItemLayout}
        {...element.formItemLayout}
        key={element.id}
        style={{ marginBottom: "0.5rem" }}
      >
        {getFieldDecorator(element.id, {
          initialValue: element.initialValue,
          validateFirst: true,
          rules: element.rules
        })(
          <Radio.Group
            onChange={!!element.onChange ? element.onChange : null}
            style={{ width: "100%" }}
          >
            <Row>
              {element.option.map(item => (
                <Col
                  key={item.code}
                  span={item.span ? item.span : element.span}
                >
                  <Radio value={item.code}>{item.name}</Radio>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        )}
      </FormItem>
    );
    // }
  };
  renderTreeSelect = element => {
    let getFieldDecorator = this.props.form.getFieldDecorator;

    return (
      <React.Fragment key={element.id}>
        <FormItem
          label={element.label}
          {...formItemLayout}
          {...element.formItemLayout}
          key={element.id}
          style={{ marginBottom: "0.5rem" }}
        >
          {getFieldDecorator(element.id, {
            initialValue: element.initialValue,
            validateFirst: true,
            rules: element.rules
          })(
            <TreeSelect
              treeCheckable
              disabled={!!element.disabled}
              showSearch
              treeNodeFilterProp={"title"}
              dropdownStyle={{ maxHeight: 300, overflow: "auto", top: "100px" }}
              treeData={element.option}
              multiple={!!element.multiple}
            />
          )}
        </FormItem>
        {element.hr ? <hr /> : null}
      </React.Fragment>
    );
  };
  renderTree = element => {
    let getFieldDecorator = this.props.form.getFieldDecorator;
    let renderTreeNodes = data => {
      return data.map(item => {
        if (item.child) {
          return (
            <TreeNode title={item.name} key={item.orgcode} dataRef={item}>
              {renderTreeNodes(item.child)}
            </TreeNode>
          );
        }
        return <TreeNode {...item} />;
      });
    };
    return (
      <React.Fragment key={element.id}>
        <FormItem
          label={element.label}
          {...formItemLayout}
          {...element.formItemLayout}
          key={element.id}
          style={{ marginBottom: "0.5rem" }}
        >
          {getFieldDecorator(element.id, {
            initialValue: element.initialValue,
            validateFirst: true,
            valuePropName: "checkedKeys",
            trigger: "onCheck",
            rules: element.rules
          })(<Tree checkable>{renderTreeNodes(element.option)}</Tree>)}
        </FormItem>
      </React.Fragment>
    );
  };
  renderFile = (element, type = "imageFile") => {
    let getFieldDecorator = this.props.form.getFieldDecorator;
    return (
      <React.Fragment key={element.id}>
        <FormItem
          label={element.label}
          {...formItemLayout}
          {...element.formItemLayout}
          key={element.id}
          style={{ marginBottom: "0.5rem" }}
        >
          {getFieldDecorator(element.id, {
            initialValue: element.initialValue,
            validateFirst: true,
            getValueFromEvent: this.normFile,
            valuePropName: "fileList",
            rules: element.rules
          })(
            <Upload
              listType={type === "imageFile" ? "picture" : "text"}
              withCredentials
              name={type}
              headers={GETREQUIREHEADER()}
              action={commonUrl[type].update}
              onChange={this.fileOnChange}
              onPreview={this.onUploadPreview}
              // onRemove={() => false}
            >
              <Button>
                <Icon type="upload" /> 上传文件
              </Button>
            </Upload>
          )}
        </FormItem>
      </React.Fragment>
    );
  };
  renderMySearchConfig = (element, type) => {
    let { data } = this.props;
    let getFieldDecorator = this.props.form.getFieldDecorator;
    return (
      <React.Fragment key={element.id}>
        <FormItem
          // label={element.label}
          {...formItemLayout}
          {...element.formItemLayout}
          key={element.id}
          style={{ marginBottom: "0.5rem" }}
        >
          {getFieldDecorator(element.id, {
            initialValue: element.value,
            validateFirst: true,
            rules: element.rules
          })(<MySearchConfig name={element.label} length={data.length} />)}
        </FormItem>
      </React.Fragment>
    );
  };
  renderColor = element => {
    let getFieldDecorator = this.props.form.getFieldDecorator;
    return (
      <React.Fragment key={element.id}>
        <FormItem
          label={element.label}
          {...formItemLayout}
          {...element.formItemLayout}
          key={element.id}
          style={{ marginBottom: "0.5rem" }}
        >
          {getFieldDecorator(element.id, {
            initialValue: element.initialValue,
            validateFirst: true,
            rules: element.rules
          })(<SketchPicker />)}
        </FormItem>
      </React.Fragment>
    );
  };
  render() {
    let { data } = this.props;
    return (
      <React.Fragment>
        <Form>
          <Row gutter={24}>
            {data.map(element => {
              let formItem;
              switch (element.type) {
                case "select":
                  formItem = this.renderSelect(element);
                  break;
                case "textarea":
                  formItem = this.renderInput(element);
                  break;
                case "cascader":
                  formItem = this.renderCascader(element);
                  break;
                case "date":
                  formItem = this.renderDate(element);
                  break;
                case "checkBox":
                  formItem = this.renderCheckBox(element);
                  break;
                case "radio":
                  formItem = this.renderRadio(element);
                  break;
                case "img":
                  formItem = this.renderFile(element);
                  break;
                case "file":
                  formItem = this.renderFile(element, "docFile");
                  break;
                case "tags":
                  formItem = this.renderSelect(element);
                  break;
                case "multiple":
                  formItem = this.renderSelect(element);
                  break;
                case "text":
                  formItem = this.renderInput(element);
                  break;
                case "password":
                  formItem = this.renderPassWord(element);
                  break;
                case "treeSelect":
                  formItem = this.renderTreeSelect(element);
                  break;
                case "tree":
                  formItem = this.renderTree(element);
                  break;
                case "searchConfig":
                  formItem = this.renderMySearchConfig(element);
                  break;
                case "columnConfig":
                  formItem = this.renderMySearchConfig(element);
                  break;
                case "color":
                  formItem = this.renderColor(element);
                  break;
                default:
                  break;
              }
              return (
                <Col
                  key={element.id}
                  span={element.col || 12}
                  style={{ minHeight: "2.5rem" }}
                >
                  {formItem}
                </Col>
              );
            })}
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}

export default Form.create()(MyForm);
