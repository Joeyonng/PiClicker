import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Route, Switch, withRouter} from "react-router-dom";

import {withStyles} from "@material-ui/core";
import withWidth from "@material-ui/core/withWidth/withWidth";
import LinearProgress from "@material-ui/core/LinearProgress";

import Login from './Login';
import Instructor from './Instructor';
import Student from "./Student";

class Router extends Component {
    constructor(props) {
        super(props);
        //console.log("Router Constructor", this.props);

        this.checkPermission();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('Router: componentDidMount', this.props);
        if (this.props.match.params.user !== prevProps.match.params.user) {
            this.checkPermission();
        }
    }

    checkPermission() {
        switch(this.props.account.userType) {
            case 'i':
                this.props.history.push('/instructor/' + this.props.account.userID);
                break;
            case 's':
                this.props.history.push('/student/' + this.props.account.userID);
                break;
            default:
                this.props.history.push('/login');
        }
    }

    render() {
        return (
            <Switch>
                <Route path='/login' component={Login}/>
                <Route path='/instructor/:userID?' component={Instructor}/>
                <Route path='/student/:userID?' component={() => <Student/>}/>
            </Switch>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(Router));
