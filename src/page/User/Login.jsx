import React, {Component} from 'react'
import {connect} from 'react-redux'
import * as actions from '../../app/actions.jsx'
import {
    Form,
    Icon,
    Input,
    Button,
    Checkbox,
    Modal
} from 'antd';
import DB from '../../app/DB'

const FormItem = Form.Item;

class NormalLoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: ''
        }


        // this.props.UserMessage.username&&location.replace('#/user/index');
        // console.log(this.props)

        // DB.User.message().then(()=>location.replace('#/user/index'),()=>null)
    }
    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
              DB.User.login({
                username: values.username,
                password: md5(values.password)
              }).then(re => location.replace('#/user/index'),re=>Modal.error({title: '温馨提示', content: re.error}))
            }

        });
    }
    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit.bind(this)} className="login-form">
                <FormItem>
                    {getFieldDecorator('username', {
                        rules: [
                            {
                                required: true,
                                message: '请输入用户名!'
                            }
                        ]
                    })(
                        <Input autoComplete={false} prefix={< Icon type = "user" style = {{ fontSize: 13 }}/>} placeholder="用户名"/>
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('password', {
                        rules: [
                            {
                                required: true,
                                message: '请输入密码!'
                            }
                        ]
                    })(
                        <Input prefix={< Icon type = "lock" style = {{ fontSize: 13 }}/>} type="password" placeholder="密码"/>
                    )}
                </FormItem>
                <FormItem>
                    <a className="login-form-forgot" hidden>忘记密码</a>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        登录
                    </Button>
                    <a href="#/user/regist">立即注册</a>
                </FormItem>
            </Form>
        );
    }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {}
        this.props.UserMessage.username&&history.go(-1);
    }
    componentDidMount() {
        this.props.dispatch(actions.setTitle({title: '登录', backBtn: true, right: false}));
    }
    render() {
        return <section id='login'><WrappedNormalLoginForm/></section>
    }
}

const select = state => {
    return {UserMessage: state.setUserMessage}
}

export default connect(select)(Login);
