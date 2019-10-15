import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from "@material-ui/core/Divider";
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import FormatListBulletedOutlinedIcon from '@material-ui/icons/FormatListBulletedOutlined';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import CategoryOutlinedIcon from '@material-ui/icons/CategoryOutlined';
import PollOutlinedIcon from '@material-ui/icons/PollOutlined';

import Statistics from "./Statistics";
import CourseDashboard from "./CourseDashboard";
import CourseSettings from "./CourseSettings";

const styles = theme => ({
    appBar: props => ({
        top: 0,
        width: props.userMenuOpen ? `calc(100% - ${260}px)` : '100%',
        marginLeft: props.userMenuOpen ? 260 : 0,
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    }),
    grow: {
        flexGrow: 1,
    },
});

class TopBar extends Component {
    constructor(props) {
        super(props);
        //console.log("TopBar props", this.props);

        this.state = {
            statisticsOpen: false,
            courseDashboardOpen: false,
            courseSettingsOpen: false,
        };
    }

    componentDidMount() {
        console.log('TopBar: componentDidMount', this.props);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('TopBar: componentDidUpdate', prevProps, this.props);
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <div>
                <AppBar
                    className={mobile ? null : this.props.classes.appBar}
                    color="inherit"
                    position="fixed"
                    elevation={0}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            onClick={() => {
                                this.props.userMenuOpenCtl(!this.props.userMenuOpen);
                            }}
                        >
                            <MenuIcon/>
                        </IconButton>

                        <Typography
                            className={this.props.classes.grow}
                            variant='h6'
                        >
                        </Typography>

                        {this.props.match.params.course === 'unknown' ? null :
                            <div>
                                {mobile ? null :
                                    <IconButton
                                        onClick={() => {this.setState({statisticsOpen: true})}}
                                    >
                                        <PollOutlinedIcon/>
                                    </IconButton>
                                }

                                {mobile ? null :
                                    <IconButton
                                        onClick={() => {this.setState({courseDashboardOpen: true,});}}
                                    >
                                        <CategoryOutlinedIcon/>
                                    </IconButton>
                                }

                                <IconButton
                                    onClick={()=>{this.setState({courseSettingsOpen: true,});}}
                                >
                                    <SettingsOutlinedIcon/>
                                </IconButton>
                            </div>
                        }

                        <IconButton
                            onClick={()=>{this.props.sessionMenuOpenCtl(!this.props.sessionMenuOpen)}}
                        >
                            <FormatListBulletedOutlinedIcon/>
                        </IconButton>
                    </Toolbar>

                    <Divider/>
                </AppBar>

                {/*this.props.match.params.course === 'unknown' ? null :
                    <div>
                        <Statistics
                            key={this.props.sessions}
                            open={this.state.statisticsOpen}
                            openCtl={(open) => this.setState({statisticsOpen: open})}
                            selectedSessions={Object.keys(this.props.sessions)}
                            course={this.props.courses[this.props.match.params.course]}
                        />

                        <CourseDashboard
                            key={"Dashboard" + Object.keys(this.props.courses) + this.props.match.params.course + this.state.courseDashboardOpen}
                            open={this.state.courseDashboardOpen}
                            openCtl={(open) => {this.setState({courseDashboardOpen: open})}}
                        />

                        <CourseSettings
                            key={"Settings" + Object.keys(this.props.courses) + this.props.match.params.course + this.state.courseSettingsOpen}
                            open={this.state.courseSettingsOpen}
                            openCtl={(open) => {this.setState({courseSettingsOpen: open})}}
                            newCourse={false}
                        />
                    </div>
                */}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(TopBar))));
