import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Drawer from '@material-ui/core/Drawer'
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import CourseSettings from "./CourseSettings";
import {createCourse, getCourses} from "../backend-api";
import {changeCourses} from "../redux";

const styles = theme => ({
    headerListItem: {
        height: 64,
        [theme.breakpoints.down('xs')]: {
            height: 56,
        },
    },
    drawerPaper: {
        width: 260,
    },
});

class UserMenu extends Component {
    constructor(props) {
        super(props);
        //console.log("UserMenu Constructor", this.props);

        this.state = {
            snifferPageOpen: false,
            courseSettingsOpen: false,
        };
    }

    componentDidMount() {
        //console.log('UserMenu: componentDidMount', this.props);
        this.fetchCourses(this.props.match.params.userID);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('UserMenu: componentDidUpdate', prevProps, this.props);
        if (this.props.match.params.userID !== prevProps.match.params.userID) {
            this.fetchCourses(this.props.match.params.userID);
        }
    }

    fetchCourses(instructorID) {
        getCourses(instructorID).then(data => {
            let courses = {};
            for(let course of data.courses) {
                courses[course.courseID] = course;
            }
            this.props.changeCourses(courses);
        }).catch(error => {
            console.log(error);
        });
    }

    addCourse(instructorID, name, quarter, year) {
        createCourse(instructorID, name, quarter, year).then(data => {
            let newCourses = this.props.courses;
            newCourses[data.courseID] = data;
            this.props.changeCourses(newCourses);

            this.props.history.push('/instructor/'
                + this.props.match.params.userID + '/' + data.courseID
            );
        }).catch(error => {

        });
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <div>
                <Drawer
                    classes={{paper: this.props.classes.drawerPaper}}
                    anchor="left"
                    variant={mobile ? "temporary" : "persistent"}
                    open={this.props.open}
                    onClose={() => {
                        this.props.openCtl(false);
                    }}
                >
                    <ListItem className={this.props.classes.headerListItem}>
                        <ListItemText
                            primary={this.props.account.name}
                            secondary={this.props.account.email}
                        />
                        <IconButton
                            onClick={() => {

                            }}
                        >
                            <ExitToAppIcon/>
                        </IconButton>
                    </ListItem>

                    <Divider/>

                    <List subheader={<ListSubheader>Courses</ListSubheader>}>
                        {Object.values(this.props.courses).map(course =>
                            <ListItem
                                key={course.name}
                                button
                                selected={Number(this.props.match.params.courseID) === course.courseID}
                                onClick={() => {
                                    this.props.history.push('/instructor/' + this.props.match.params.userID + '/' + course.courseID);
                                }}
                            >
                                <ListItemText primary={course.name} />
                            </ListItem>
                        )}

                        <ListItem
                            button
                            onClick={() => {
                                //this.setState({courseSettingsOpen: true})

                            }}
                        >
                            <ListItemText primary={'Add Course'} />
                        </ListItem>
                    </List>

                    <Divider/>
                </Drawer>

                <CourseSettings
                    key={"Settings New"  + this.state.courseSettingsOpen}
                    open={this.state.courseSettingsOpen}
                    openCtl={(open) => {this.setState({courseSettingsOpen: open})}}
                    newCourse={true}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeCourses: (data) => dispatch(changeCourses(data)),
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, { withTheme: true })(withWidth()(UserMenu))));
