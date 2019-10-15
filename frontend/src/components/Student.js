import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import {withStyles} from "@material-ui/core";
import withWidth from "@material-ui/core/withWidth/withWidth";
import LinearProgress from "@material-ui/core/LinearProgress";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import Avatar from "@material-ui/core/Avatar";

import {getActivityInfo, setStudentVote} from "../backend-api";
import Icon from "@material-ui/core/Icon";

const styles = theme => {

};

class Student extends Component {
    constructor(props) {
        super(props);
        //console.log("Student Constructor", this.props);

        this.state = {
            choice: null,
        };
    }

    componentDidMount() {
        console.log('Student: componentDidMount', this.props);
    }

    render() {
        return (
            <BottomNavigation
                value={this.state.choice}
                onChange={(event, value) => {
                    setStudentVote(this.props.account.userID, value).then(() => {
                        this.setState({choice: value});
                    }).catch((error) => {
                        console.log(error);
                    })
                }}
            >
                {['A', 'B', 'C', 'D', 'E'].map((choice) =>
                    <BottomNavigationAction
                        key={choice}
                        value={choice}
                        label={'Selected'}
                        icon={<Icon>{choice}</Icon>}
                    />
                )}
            </BottomNavigation>
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
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(Student))));

