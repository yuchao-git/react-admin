import React from "react";
import { Form, Input, Icon, Row, Col, Button } from "antd";
// 请求方法
import $http from "../../common/fetch";
//导入请求路径
import { authUserMenu } from "../../common/auth";
import { loginUrl, commonUrl } from "../../common/url";
//导入css
import "./index.css";
import homebg from "../../assets/image/homeBG.jpg";
const FormItem = Form.Item;

const unKey = "mess-paas-un";
const upKey = "mess-paas-up";
// 解决ie登录密码被冲掉的问题
const setLoginInfo = (un, up) => {
    localStorage.setItem(unKey, un);
    localStorage.setItem(upKey, up);
};

const getLoginInfo = () => {
    return {
        un: localStorage.getItem(unKey) || "",
        up: localStorage.getItem(upKey) || ""
    };
};

class Login extends React.Component {
    constructor() {
        super();
        this.state = {
            title: "",
            validateRandom: 1
        };
        this.logoRandom = Math.random();
    }
    componentDidMount() {
        $http.postData(loginUrl.companyName).then(req => {
            this.setState({ title: req.body.name });
        });
    }
    handleSubmit = e => {
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        const { history } = this.props;
        validateFieldsAndScroll(async (err, values) => {
            if (!err) {
                let { companycode, usercode, loginname, expire = "" } = (await $http.postFormData(loginUrl.signin, { ...values, ut: "mobile" })).body;
                localStorage.setItem("manamge_expire", expire);
                localStorage.setItem("manage_cd", companycode);
                localStorage.setItem("manage_ud", usercode);
                localStorage.setItem("manage_user", loginname);
                let data = await $http.postData(commonUrl.menu);
                setLoginInfo(values.un, values.up);
                // 进行权限处理
                authUserMenu(data.body);
                history.push("/main");
            } else {
                console.log(err);
            }
        });
    };
    render() {
        const { getFieldDecorator } = this.props.form;
        const loginInfo = getLoginInfo();
        return (
            <div
                className="login-view"
                style={{
                    backgroundImage: `url(${homebg})`
                }}
            >
                <div className="header">
                    <div className="container">
                        <img src={`${loginUrl.logo}?${this.logoRandom}`} alt="" />
                    </div>
                </div>
                <div className="body">
                    <div className="login">
                        <h1 className="login-header">
                            <span>{this.state.title}</span>
                        </h1>
                        <div style={{ padding: "0 1rem" }}>
                            <div className="describe">请登录你的账号</div>
                            <Form onSubmit={this.handleSubmit} className="login-form">
                                <FormItem>
                                    {getFieldDecorator("un", {
                                        initialValue: loginInfo.un,
                                        rules: [
                                            {
                                                required: true,
                                                message: "请输入账号!"
                                            }
                                        ]
                                    })(
                                        <Input
                                            className="login-input"
                                            prefix={
                                                <Icon
                                                    type="user"
                                                    style={{
                                                        color: "rgba(0,0,0,.25)"
                                                    }}
                                                />
                                            }
                                            placeholder="账号"
                                        />
                                    )}
                                </FormItem>
                                <FormItem>
                                    {getFieldDecorator("up", {
                                        initialValue: loginInfo.up,
                                        rules: [
                                            {
                                                required: true,
                                                message: "请输入密码"
                                            }
                                        ]
                                    })(
                                        <Input
                                            className="login-input"
                                            prefix={
                                                <Icon
                                                    type="lock"
                                                    style={{
                                                        color: "rgba(0,0,0,.25)"
                                                    }}
                                                />
                                            }
                                            type="password"
                                            placeholder="密码"
                                        />
                                    )}
                                </FormItem>
                                <FormItem>
                                    <Row gutter={8}>
                                        <Col span={16}>
                                            {getFieldDecorator("captchaText", {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入验证码"
                                                    }
                                                ]
                                            })(<Input className="login-input-captcha" placeholder="验证码" />)}
                                        </Col>
                                        <Col span={8}>
                                            <img
                                                src={`${loginUrl.validation}?${this.state.validateRandom}`}
                                                onClick={() =>
                                                    this.setState({
                                                        validateRandom: Math.random()
                                                    })
                                                }
                                                alt=""
                                                style={{
                                                    width: "100%",
                                                    height: "100%"
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </FormItem>
                                <FormItem>
                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                        登录
                                    </Button>
                                </FormItem>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Form.create()(Login);
