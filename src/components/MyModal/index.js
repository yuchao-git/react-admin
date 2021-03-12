import React from "react";
import { Button, Modal } from "antd";
import MyForm from "../MyForm";

class MyModal extends React.Component {
  constructor(props) {
    super(props);
  }
  
  handleOk = () => {
    let data = this.MyForm.getfieldsValue();
    return data
  };
  render() {
    let {
      modalConfig = { title : "标题", width : 800,data:[] },
      visible,//显示隐藏
      footer,//下面的按钮
      cancel//取消弹框
    } = this.props;
    return (
      <React.Fragment>
        <Modal
          title={modalConfig.title}
          width={modalConfig.width}
          destroyOnClose={true}
          wrapClassName="detail-modal"
          visible={visible}
          onCancel={cancel}
          footer={
            footer
              ? footer
              : [
                  <Button key="check" onClick={cancel}>
                    取消
                  </Button>,
                  <Button key="submit" type="primary" onClick={this.handleOk}>
                    确定
                  </Button>
                ]
          }
          maskClosable={false}
          zIndex={10}
          bodyStyle={{
            maxHeight: "60vh",
            overflow: "auto",
            paddingTop: "10px"
          }}
        >
          <MyForm wrappedComponentRef={(form) => this.MyForm = form} data = {modalConfig.data} />
        </Modal>
      </React.Fragment>
    );
  }
}
export default MyModal