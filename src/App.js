import React, { Component } from "react";
import moment from 'moment';
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { Spin } from "antd";
import router from './common/router'

import {NoMatch} from './view/Nomatch';
import 'moment/locale/zh-cn';
import "antd/dist/antd.css";
import "./App.css";
moment.locale('zh-cn');//日历的中英文

class App extends Component {
  render() {
    return (
      <div className="App">
        <HashRouter>
          <Switch>
            <Route path="/" exact strict render={() => <Redirect to="/login" />} />
            {router.map(item => {
              return (
                <Route
                  key={item.path}
                  exact={item.exact || false}
                  path={item.path}
                  component={item.component}
                />
              );
            })}
            <Route component={NoMatch} />
          </Switch>
        </HashRouter>
        <div className={`main_mask ${this.props.fetchState ? "active" : null}`}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Spin />
            <span className="app-spin-title">{this.props.fetchMsg}</span>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  fetchState: state.require.fetchState,
  fetchMsg: state.require.fetchMsg,
});
export default connect(mapStateToProps)(App);
