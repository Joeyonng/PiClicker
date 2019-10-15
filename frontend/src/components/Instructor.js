import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {Redirect, Route, Switch, withRouter} from "react-router-dom";

import {withStyles} from "@material-ui/core";
import withWidth from "@material-ui/core/withWidth/withWidth";
import LinearProgress from "@material-ui/core/LinearProgress";

import UserMenu from "./UserMenu";
import SessionMenu from "./SessionMenu";
import TopBar from "./TopBar";
import Polls from "./Polls";
import {changeActivity} from "../redux";
import {getActivityInfo} from "../backend-api";

const styles = theme => {

};

class Instructor extends Component {
    constructor(props) {
        super(props);
        //console.log("Instructor Constructor", this.props);

        this.state = {
            userMenuOpen: true,
            sessionMenuOpen: false,
        };
    }

    componentDidMount() {
        //console.log('Instructor: componentDidMount', this.props);
        getActivityInfo().then(data => {
            this.props.changeActivity(data);
            /*
            this.props.history.push('/instructor/'
                + this.props.match.params.userID + '/'
                + data.courseID + '/' + data.sessionID
            );
             */
        }).catch(error => {
            console.log(error);
        })
    }

    render() {
        return (
            <Fragment>
                <Route
                    path="/instructor/:userID/:courseID?"
                    render={() =>
                        <UserMenu
                            open={this.state.userMenuOpen}
                            openCtl={(open) => {this.setState({userMenuOpen: open})}}
                        />
                    }
                />
                <Route
                    path="/instructor/:userID/:courseID/:sessionID?"
                    render={() =>
                        <SessionMenu
                            open={this.state.sessionMenuOpen}
                            openCtl={(open) => {this.setState({sessionMenuOpen: open})}}
                        />
                    }
                />
                <Route
                    path="/instructor/:userID/:courseID/:sessionID?"
                    render={() =>
                        <TopBar
                            userMenuOpen={this.state.userMenuOpen}
                            userMenuOpenCtl={(open) => {this.setState({userMenuOpen: open})}}
                            sessionMenuOpen={this.state.sessionMenuOpen}
                            sessionMenuOpenCtl={(open) => {this.setState({sessionMenuOpen: open})}}
                        />
                    }
                />
                <Route
                    path="/instructor/:userID/:courseID/:sessionID/"
                    render={() =>
                        <Polls
                            userMenuOpen={this.state.userMenuOpen}
                            userMenuOpenCtl={(open) => {this.setState({userMenuOpen: open})}}
                            sessionMenuOpen={this.state.sessionMenuOpen}
                            sessionMenuOpenCtl={(open) => {this.setState({sessionMenuOpen: open})}}
                        />
                    }
                />
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeActivity: (data) => dispatch(changeActivity(data)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(Instructor))));

